let videos = [
  {
    title: "첫번째 영상",
    rating: 5,
    comments: 2,
    createdAt: "2분 전",
    views: 59,
    id: 1,
  },
  {
    title: "두번째 영상",
    rating: 2,
    comments: 64,
    createdAt: "59분 전",
    views: 1532,
    id: 2,
  },
  {
    title: "세번째 영상",
    rating: 6,
    comments: 152,
    createdAt: "1시간 전",
    views: 665,
    id: 3,
  },
];

export const trending = (req, res) => {
  return res.render("home", { pageTitle: "Home", videos });
};
export const watch = (req, res) => {
  const {
    params: { id },
  } = req;
  const video = videos[id - 1];
  return res.render("watch", { pageTitle: `Watching:  ${video.title}`, video });
};
export const getEdit = (req, res) => {
  const {
    params: { id },
  } = req;
  const video = videos[id - 1];
  res.render("edit", { pageTitle: `Editing: ${video.title}`, video });
};
export const postEdit = (req, res) => {
  const {
    params: { id },
    body: { title },
  } = req;
  videos[id - 1].title = title;
  return res.redirect(`/videos/${id}`);
};
export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};
export const postUpload = (req, res) => {
  // 이곳에서 비디오를 videos array에 추가할 예정
  const {
    body: { title },
  } = req;
  const newVideo = {
    title,
    rating: 0,
    comments: 0,
    createdAt: "방금",
    views: 0,
    id: videos.length + 1,
  };
  videos.push(newVideo);
  return res.redirect("/");
};
