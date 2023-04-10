// babel node를 사용하기 전에 express를 사용하는 법
// const express = require("express");

import express from "express";

const PORT = 4000;

const app = express();

const handleListening = () => {
  console.log(`🐤 http://localhost:${PORT} 포트에서 listening 하고 있습니다.`);
};

app.listen(PORT, handleListening);
