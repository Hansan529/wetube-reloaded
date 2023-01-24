import express from "express";

const PORT = 4000;

const app = express();

app.get("/", () => console.log("somebody is trying to go home."));
// button.addEvenListener("click", handleClick);

const handleListening = () =>
  console.log(`Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
