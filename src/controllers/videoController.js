import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comment";
import fs from "fs";

// * 메인 페이지
export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
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
  if (!video) {
    return res
      .status(404)
      .render("404", { pageTitle: "동영상을 찾을 수 없음" });
  }
  return res.render("videos/watch", { pageTitle: video.title, video });
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
    return res
      .status(404)
      .render("404", { pageTitle: "동영상을 찾을 수 없음" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  res.render("videos/edit", { pageTitle: `${video.title} Editing:`, video });
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
    return res
      .status(404)
      .render("404", { pageTitle: "동영상을 찾을 수 없음" });
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
  return res.render("videos/upload", { pageTitle: "Upload Video" });
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
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path,
      description,
      owner,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(owner);
    user.videos.unshift(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    req.flash("error", `${error._message} 업로드에 실패했습니다.`);
    return res.status(400).render("videos/upload", {
      pageTitle: "Upload Video",
    });
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
  const video = await Video.findById(id);
  const user = await User.findById(_id);
  if (!video) {
    return res.status(404).render("404", {
      pageTitle: "찾을 수 없는 영상입니다.",
    });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndDelete(id);
  fs.unlinkSync(video.fileUrl);
  return res.redirect("/");
};

// * 검색
export const search = async (req, res) => {
  const pageTitle = "검색";
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
  return res.render("videos/search", { pageTitle, videos });
};

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

export const createComment = async (req, res) => {
  const {
    params: { id },
    body: { text },
    session: { user },
  } = req;

  const video = await Video.findById(id);

  if (!video) {
    return res.sendStatus(404);
  }

  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  res.sendStatus(201);
};

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
  const comments = video.comments.map((comment) => ({
    _id: comment._id,
    text: comment.text,
    owner: comment.owner,
  }));

  const comment = comments[comments.length - 1 - index];

  if (String(loginUser) !== String(comment.owner._id)) {
    return res.sendStatus(401);
  }

  await Video.findOneAndUpdate(
    { _id: id },
    { $pull: { comments: comment._id } },
    { new: true }
  );
};

export const commentProfile = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { socialLogin },
    },
  } = req;
  const video = await Video.findById(id).populate({
    path: "comments",
    populate: { path: "owner" },
  });
  const avatarUrls = video.comments.map((comment) => comment.owner.avatarUrl);

  return res.status(200).json({ socialLogin, avatarUrls });
};
