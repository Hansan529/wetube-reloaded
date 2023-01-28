import express from "express";

const PORT = 4000;

const app = express();

const handleHome = (req, res) => {
  return res.end();
};
const handleLogin = (req, res) => {
  return res.send("Login here");
};

app.get("/", handleHome);
// button.addEvenListener("click", handleClick);
app.get("/login", handleLogin);

const handleListening = () =>
  console.log(`Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
