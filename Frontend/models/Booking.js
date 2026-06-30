// models/Booking.js

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  date: String,
  time: String,
  guests: String,
  message: String
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);