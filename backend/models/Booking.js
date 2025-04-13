const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    buyerName: {
      type: String,
      required: true,
      match: /^[A-Za-z\s]+$/, // Only alphabets and spaces
    },
    address: { type: String, required: true },
    phoneNumber: {
      type: String,
      required: true,
      match: /^\d{10}$/, // Exactly 10 digits
    },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    plot: { type: mongoose.Schema.Types.ObjectId, ref: "Plot", required: true },
    layoutId: { type: String, required: true }, // Add layoutId field
    paymentType: {
      type: String,
      enum: ["Cash", "Cheque", "Online"],
      required: true,
    },
    brokerReference: { type: String },
    totalCost: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
