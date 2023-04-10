// babel node를 사용하기 전에 express를 사용하는 법
// const express = require("express");

import express from "express";

const PORT = 4000;
const app = express();

const gossipMiddleware = (req, res, next) => {
  console.log(`누군가 ${req.url}로 이동하려고 합니다.`);
  // console.log(req);
  next();
};

const handleHome = (req, res) => {
  console.log("메인 루트로 이동했습니다.");
  return res.send("<h1>res send</h1>");
};

const handleLogin = (req, res) => {
  return res.send("Login 완료");
};
app.use(gossipMiddleware);
app.get("/", handleHome);
app.get("/login", handleLogin);

const handleListening = () => {
  console.log(`🐤 http://localhost:${PORT} 포트에서 listening 하고 있습니다.`);
};

app.listen(PORT, handleListening);
