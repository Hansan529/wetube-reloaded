import express from "express";
import {
  commentProfile,
  createComment,
  deleteComment,
  registerView,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.post("/videos/:id[0-9a-f]{24}/comment-delete", deleteComment);
apiRouter.post("/videos/:id([0-9a-f]{24})/profile", commentProfile);

export default apiRouter;
