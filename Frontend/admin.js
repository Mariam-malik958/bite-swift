const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "admin123"; // change later

/* DB */
mongoose.connect("mongodb://127.0.0.1:27017/bite swift");

/* ORDER MODEL */
const Order = mongoose.model("Order", {
  product: String,
  price: Number,
  name: String,
  phone: String,
  address: String,
  status: { type: String, default: "Pending" }
});

/* 🔐 ADMIN LOGIN (FIXED) */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "1234") {
    const token = jwt.sign({ user: "admin" }, SECRET);
    return res.json({ success: true, token });
  }

  res.json({ success: false, message: "Invalid login" });
});

/* 🔒 MIDDLEWARE */
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.json({ success: false, message: "No token" });

  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    res.json({ success: false, message: "Invalid token" });
  }
}

/* ORDERS (PROTECTED) */
app.get("/orders", verifyToken, async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

/* ORDER POST */
app.post("/order", async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.json({ success: true });
});

/* SERVER */
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});