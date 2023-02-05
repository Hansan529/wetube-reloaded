import express from "express";

const videoRouter = express.Router();

const handleWatchVvideo = (req, res) => res.send("Watch  Video");

videoRouter.get("/watch", handleWatchVvideo);

export default handleWatchVvideo;
