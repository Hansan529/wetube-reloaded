import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/wetube");

const db = mongoose.connection;

const handleOpen = () => console.log("✅ DB가 연결되었습니다.");
const handleError = (error) => console.log("❌ DB 오류", error);

db.on("error", handleError);
db.once("open", handleOpen);
