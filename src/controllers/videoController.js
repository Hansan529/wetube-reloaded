import Video from "../models/Video";

export const home = async (req, res) => {
  const videos = await Video.find({});
  return res.render("home", { pageTitle: "Home", videos: [] });
};
export const watch = (req, res) => {
  const {
    params: { id },
  } = req;
  return res.render("watch", { pageTitle: `Watching` });
};
export const getEdit = (req, res) => {
  const {
    params: { id },
  } = req;
  res.render("edit", { pageTitle: `Editing:` });
};
export const postEdit = (req, res) => {
  const {
    params: { id },
    body: { title },
  } = req;
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
  return res.redirect("/");
};
