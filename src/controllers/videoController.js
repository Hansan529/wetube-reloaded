import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comment";
import fs from "fs";
import Like from "../models/Like";

// * 메인 페이지
export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { videos });
};

// * 비디오 페이지
export const watch = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await Video.findById(id)
    .populate("owner")
    .populate({
      path: "comments",
      populate: { path: "owner" },
    });
  const like = await Like.findOne({ video: id });
  if (!video) {
    return res.status(404).render("404");
  }
  return res.render("videos/watch", { video, like });
};

// * 비디오 수정 페이지
export const getEdit = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404");
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  res.render("videos/edit", { video });
};

// * 비디오 수정
export const postEdit = async (req, res) => {
  const {
    params: { id },
    body: { title, description, hashtags },
    session: {
      user: { _id },
    },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404");
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

// * 업로드 페이지
export const getUpload = (req, res) => {
  return res.render("videos/upload");
};

// * 비디오 업로드
export const postUpload = async (req, res) => {
  const {
    body: { title, description, hashtags },
    files: { video, thumb },
    session: {
      user: { _id: owner },
    },
  } = req;
  try {
    const newVideo = await Video.create({
      title,
      fileUrl: `/${video[0].path}`,
      thumbUrl: `/${thumb[0].path}`,
      description,
      owner,
      hashtags: Video.formatHashtags(hashtags),
    });
    const like = await Like.create({
      video: newVideo._id,
    });
    const user = await User.findById(owner);
    user.videos.unshift(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    fs.unlinkSync(video[0].path);
    fs.unlinkSync(thumb[0].path);
    req.flash("error", `${error._message} 업로드에 실패했습니다.`);
    return res.status(400).render("videos/upload");
  }
};

// * 비디오 삭제
export const deleteVideo = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
  } = req;
  const video = await Video.findById(id).populate({
    path: "comments",
    populate: { path: "owner" },
  });
  if (!video) {
    return res.status(404).render("404");
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }

  const comment = video.comments.map((comment) => ({
    _id: comment._id.toString(),
    owner: comment.owner._id.toString(),
  }));

  comment.forEach(async (list, index) => {
    const a = await User.findById(comment[index].owner);
    const b = a.comments.toString().split(",");
    await Comment.findByIdAndDelete(b[index]);
    await User.findByIdAndUpdate(
      comment[index].owner,
      { $pull: { comments: b[index] } },
      { new: true }
    );
    await Video.findByIdAndUpdate(
      id,
      { $pull: { comments: b[index] } },
      { new: true }
    );
  });
  await Video.findByIdAndDelete(id);

  fs.unlinkSync(video.fileUrl.substring(1));
  fs.unlinkSync(video.thumbUrl.substring(1));
  return res.redirect("/");
};

// * 검색
export const search = async (req, res) => {
  const {
    query: { q },
  } = req;
  let videos = [];
  if (q) {
    videos = await Video.find({
      $or: [
        { title: { $regex: new RegExp(q, "i") } },
        { hashtags: { $regex: new RegExp(q, "i") } },
      ],
    }).populate("owner");
  }
  return res.render("videos/search", { videos });
};

// * 조회수 API
export const registerView = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

// * 댓글 작성 API
export const createComment = async (req, res) => {
  try {
    const {
      params: { id },
      body: { text },
      session: {
        user: { _id: loginUser },
      },
    } = req;

    const video = await Video.findById(id);

    if (!video) {
      return res.sendStatus(404);
    }

    const comment = await Comment.create({
      text,
      owner: loginUser,
      video: id,
    });

    video.comments.push(comment._id);
    await User.findByIdAndUpdate(
      loginUser,
      { $push: { comments: comment._id } },
      { new: true }
    );
    video.save();
    res.sendStatus(201);
  } catch {
    return res.sendStatus(401);
  }
};

// * 댓글 수정 API
export const editComment = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id: loginUser },
    },
    body: { text, index },
  } = req;

  const video = await Video.findById(id).populate({
    path: "comments",
    populate: { path: "owner" },
  });

  const videoComments = video.comments.map((comment) => ({
    _id: comment._id,
    text: comment.text,
    owner: comment.owner,
  }));

  const videoComment = videoComments[videoComments.length - 1 - index];

  if (String(loginUser) !== String(videoComment.owner._id)) {
    return res.sendStatus(401);
  }

  const commentId = videoComment._id;

  await Comment.findByIdAndUpdate(
    commentId,
    {
      text,
    },
    { new: true }
  );
  await Video.findByIdAndUpdate(id, { text }, { new: true });
  await User.findByIdAndUpdate(loginUser, { text }, { new: true });

  return res.sendStatus(200);
};

// * 댓글 삭제 API
export const deleteComment = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id: loginUser },
    },
    body: { index },
  } = req;

  const video = await Video.findById(id).populate({
    path: "comments",
    populate: { path: "owner" },
  });

  const videoComments = video.comments.map((comment) => ({
    _id: comment._id,
    text: comment.text,
    owner: comment.owner,
  }));

  const videoComment = videoComments[videoComments.length - 1 - index];

  if (String(loginUser) !== String(videoComment.owner._id)) {
    return res.sendStatus(401);
  }

  const comments = videoComment._id;

  await Comment.findByIdAndDelete(videoComment);
  await Video.findOneAndUpdate(
    { _id: id },
    { $pull: { comments } },
    { new: true }
  );
  await User.findByIdAndUpdate(
    loginUser,
    { $pull: { comments } },
    { new: true }
  );

  return res.sendStatus(200);
};

// * 작성자 정보 가져오기 API
export const commentProfile = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { socialLogin, name },
    },
  } = req;
  const video = await Video.findById(id).populate({
    path: "comments",
    populate: { path: "owner" },
  });
  const avatarUrls = video.comments.map((comment) => comment.owner.avatarUrl);

  return res.status(200).json({ socialLogin, name, avatarUrls });
};

// * 좋아요 API
// TODO: 사용자별로, 비디오별로 좋아요 체크 기능 추가하기, 현재는 공통으로 적용됨
export const likeVideo = async (req, res) => {
  try {
    const {
      params: { id },
      session: {
        user: { _id: loginUser },
      },
    } = req;
    const video = await Video.findById(id);
    const likeCheck = await Like.exists({ user: loginUser });
    const like = await Like.findOne({ video: id });
    if (likeCheck) {
      await Like.findOneAndUpdate(
        { video: id },
        { $pull: { user: loginUser }, $inc: { likes: -1 } },
        { new: true }
      );
    } else {
      await Like.findOneAndUpdate(
        { video: id },
        { $push: { user: loginUser }, $inc: { likes: 1 } },
        { new: true }
      ).populate("video");
    }
    const likes = like.likes;
    return res.status(200).json({ likeCheck, likes });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "로그인이 필요합니다." });
  }
};

export const getVideo = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await Video.findById(id);
  return res.render("videos/embed", { video });
};
