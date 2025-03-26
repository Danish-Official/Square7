const mongoose = require("mongoose");

const plotSchema = new mongoose.Schema(
  {
    plotNumber: { type: Number, required: true, unique: true },
    areaSqMt: { type: Number, required: true },
    areaSqFt: { type: Number, required: true },
    status: {
      type: String,
      enum: ["available", "sold"],
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plot", plotSchema);
