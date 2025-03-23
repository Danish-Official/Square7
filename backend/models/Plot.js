const mongoose = require("mongoose");

const plotSchema = new mongoose.Schema(
  {
    plotNumber: { type: String, required: true, unique: true },
    areaSqMt: { type: Number, required: true },
    areaSqFt: { type: Number, required: true },
    ratePerSqFt: { type: Number, required: true },
    status: {
      type: String,
      enum: ["available", "sold"], // Removed "booked"
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plot", plotSchema);
