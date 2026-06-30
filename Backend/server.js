const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files from the Frontend directory
app.use(express.static(path.join(__dirname, "../Frontend")));

const SECRET = "admin123_super_secret_key"; // Keep it safe

/* DB */
mongoose.connect("mongodb://127.0.0.1:27017/biteswift")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB connection error:", err));

/* MODELS */
const Admin = mongoose.model("Admin", new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}));

const Order = mongoose.model("Order", new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  items: Array,
  totalAmount: Number,
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
}));

/* PRODUCTS DUMMY DATA */
let products = [
  { id: 1, name: "Karahi", price: 1500, desc: "Delicious chicken karahi", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=300&q=80" },
  { id: 2, name: "Biryani", price: 800, desc: "Spicy chicken biryani", image: "https://images.unsplash.com/photo-1589302168068-964664d93cb0?auto=format&fit=crop&w=300&q=80" },
  { id: 3, name: "Kebab", price: 600, desc: "Juicy beef seekh kebabs", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80" },
  { id: 4, name: "Naan", price: 50, desc: "Freshly baked garlic naan", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=300&q=80" }
];

/* API ENDPOINTS */

app.get("/products", (req, res) => {
  res.json(products);
});

app.get("/product/:id", (req, res) => {
  const p = products.find(x => x.id == req.params.id);
  res.json(p || {});
});

/* ADMIN AUTH */
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ success: false, message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();
    res.json({ success: true, message: "Admin created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    
    if (!admin) return res.status(400).json({ success: false, message: "Invalid username or password" });
    
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid username or password" });

    const token = jwt.sign({ user: admin.username, id: admin._id }, SECRET, { expiresIn: '1d' });
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* MIDDLEWARE */
function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });
  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
}

/* ORDERS */
app.get("/orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Checkout API
app.post("/order", async (req, res) => {
  try {
    const { name, phone, address, items, totalAmount } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: "Cart is empty" });
    
    const order = new Order({ name, phone, address, items, totalAmount });
    await order.save();
    res.json({ success: true, message: "Order placed successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/order/:id", verifyToken, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/order/:id", verifyToken, async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: "Delivered" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ADMIN ADD PRODUCT */
app.post("/product", verifyToken, (req, res) => {
  const { name, price } = req.body;
  const newProduct = {
    id: Date.now(),
    name,
    price,
    desc: "Added by admin",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80"
  };
  products.push(newProduct);
  res.json({ success: true, product: newProduct });
});

// Default fallback (removed due to express 5 route issues, static handles the rest)

/* SERVER */
app.listen(5000, () => {
  console.log("🚀 Backend Server running on http://localhost:5000");
});