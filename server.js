const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
});
// File Upload Setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Order Schema
const OrderSchema = new mongoose.Schema({
  playerId: String,
  uc: Number,
  payment: String,
  amount: Number,
  proof: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", OrderSchema);

// Routes
app.post("/create-order", upload.single("proof"), async (req, res) => {
  try {
    const newOrder = new Order({
      playerId: req.body.playerId,
      uc: req.body.uc,
      payment: req.body.payment,
      amount: req.body.amount,
      proof: req.file.filename
    });

    await newOrder.save();
    res.json({ success: true, message: "Order saved!" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/orders", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

app.put("/order/:id", async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, {
    status: req.body.status
  });
  res.json({ success: true });
});

app.use("/uploads", express.static("uploads"));

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running...");
});
