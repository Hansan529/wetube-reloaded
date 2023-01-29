import express from "express";
import morgan from "morgan";

const PORT = 4000;

const app = express();
const logger = morgan("dev");

const login = (req, res, next) => {
  res.send(`${req.method} ${req.url}`);
};

const home = (req, res) => {
  console.log("first");
  return res.send("Home");
};

app.use(logger);
app.get("/", home);
app.get("/login", login);

const handleListening = () =>
  console.log(`Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
