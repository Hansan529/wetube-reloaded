export const trending = (req, res) => {
  const videos = [
    {
      title: "첫번째 영상",
      rating: 5,
      comments: 2,
      createdAt: "2분 전",
      view: 59,
      id: 1,
    },
    {
      title: "두번째 영상",
      rating: 2,
      comments: 64,
      createdAt: "59분 전",
      view: 1532,
      id: 2,
    },
    {
      title: "세번째 영상",
      rating: 6,
      comments: 152,
      createdAt: "1시간 전",
      view: 665,
      id: 3,
    },
  ];
  return res.render("home", { pageTitle: "Home", videos });
};
export const see = (req, res) => res.render("watch", { pageTitle: "Watch" });
export const edit = (req, res) => res.render("edit", { pageTitle: "Edit" });
export const search = (req, res) => res.send("Search;");
export const upload = (req, res) => res.send("Upload");
export const deleteVideo = (req, res) => res.send("Delete Video");
