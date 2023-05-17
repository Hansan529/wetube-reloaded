import "dotenv/config";

import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import "./models/Like";
import app from "./server";

const PORT = 3000;

const handleListening = () => {
  console.log(
    `[localhost           ] 🐤 http://localhost:${PORT} 포트에서 listening 하고 있습니다.`
  );
  console.log(
    `[hyeonServer - ip    ] 🐤 http://192.168.10.57:${PORT} 포트에서 listening 하고 있습니다.`
  );
  console.log(
    `[hyeonServer - http  ] 🐤 http://hxan.net:${PORT} 포트에서 listening 하고 있습니다.`
  );
  console.log(
    `[hyeonServer - https ] 🐤 https://hxan.net:${PORT} 포트에서 listening 하고 있습니다.`
  );
};

app.listen(PORT, handleListening);
