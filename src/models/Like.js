import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
  likes: { type: Number, default: 0 },
  video: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Like = mongoose.model("Like", likeSchema);

export default Like;
