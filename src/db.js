import mongoose from "mongoose";

export const connectUrl = "mongodb://admin:123@0.0.0.0:27017/wetube";

mongoose.connect(connectUrl);

const db = mongoose.connection;

const handleOpen = () => console.log("✅ DB가 연결되었습니다.");
const handleError = (error) => console.log("❌ DB 오류", error);

db.on("error", handleError);
db.once("open", handleOpen);
