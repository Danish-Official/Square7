const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    buyerName: {
      type: String,
      required: true,
    },
    address: { type: String, required: true },
    phoneNumber: {
      type: String,
      required: true,
    },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    plot: { type: mongoose.Schema.Types.ObjectId, ref: "Plot", required: true },
    paymentType: {
      type: String,
      enum: ["Cash", "Cheque", "Online"],
      required: true,
    },
    broker: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Broker"
    },
    totalCost: { type: Number, required: true },
    bookingDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
