const express = require("express");
const cors = require("cors");
const login = require("./auth");
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await login(email, password);

  if (user) {
    res.status(200).json({
      message: "Login success",
      user: user
    });
  } else {
    res.status(401).json({ message: "Login failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
