import "./db";
import "./models/Video";
import "./models/User";
import app from "./server";

const PORT = 80;

const handleListening = () => {
  console.log(`🐤 http://localhost:${PORT} 포트에서 listening 하고 있습니다.`);
};

app.listen(PORT, handleListening);
