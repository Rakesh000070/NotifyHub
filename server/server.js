const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Welcome to NotifyHub Backend 🚀");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});