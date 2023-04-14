import Video from "../models/Video";

export const home = async (req, res) => {
  const videos = await Video.find({});
  return res.render("home", { pageTitle: "Home", videos });
};
export const watch = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", { pageTitle: "동영상을 찾을 수 없음" });
  }
  return res.render("watch", { pageTitle: video.title, video });
};
export const getEdit = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await Video.findById(id);
  console.log("video: ", video);
  if (!video) {
    return res.render("404", { pageTitle: "동영상을 찾을 수 없음" });
  }
  res.render("edit", { pageTitle: `${video.title} Editing:`, video });
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
export const postUpload = async (req, res) => {
  const {
    body: { title, description, hashtags },
  } = req;
  try {
    await Video.create({
      title,
      description,
      hashtags: hashtags.split(",").map((word) => `#${word}`),
    });
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};
