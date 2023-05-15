import express from "express";
import {
  commentProfile,
  createComment,
  deleteComment,
  editComment,
  registerView,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.delete("/videos/:id([0-9a-f]{24})/comment-delete", deleteComment);
apiRouter.post("/videos/:id([0-9a-f]{24})/profile", commentProfile);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment-edit", editComment);

export default apiRouter;
