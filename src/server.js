// babel node를 사용하기 전에 express를 사용하는 법
// const express = require("express");

import express from "express";
import morgan from "morgan";

const PORT = 4000;

const app = express(); // express 어플리케이션
const logger = morgan("dev"); // morgan 미들웨어

const handleHome = (req, res) => {
  return res.send("<h1>res send</h1>");
};

const handleLogin = (req, res) => res.send("Login 완료");

app.use(logger);
app.get("/", handleHome);
app.get("/login", handleLogin);

const handleListening = () => {
  console.log(`🐤 http://localhost:${PORT} 포트에서 listening 하고 있습니다.`);
};

app.listen(PORT, handleListening);
