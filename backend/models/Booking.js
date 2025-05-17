const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    buyerName: { type: String, required: true },
    email: { type: String },
    dateOfBirth: { type: Date },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    plot: { type: mongoose.Schema.Types.ObjectId, ref: "Plot", required: true },
    paymentType: { type: String, enum: ["Cash", "Cheque", "Online"], required: true },
    narration: { type: String },
    totalCost: { type: Number, required: true },
    ratePerSqFt: { type: Number, required: true },
    bookingDate: { type: Date, required: true, default: Date.now },
    broker: { type: mongoose.Schema.Types.ObjectId, ref: "Broker" },
    documents: [{
      type: {
        type: String,
        enum: ["aadharCardFront", "aadharCardBack", "panCard"],
        required: true
      },
      filename: String,
      originalName: String,
      url: String,
      uploadDate: { type: Date, default: Date.now }
    }],
    firstPayment: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
