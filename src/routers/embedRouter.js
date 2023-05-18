import express from "express";
import { getVideo } from "../controllers/videoController";

const embedRouter = express.Router();

embedRouter.get("/video/:id([0-9a-f]{24})", getVideo);

export default embedRouter;
