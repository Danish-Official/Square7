const mongoose = require("mongoose");

const plotSchema = new mongoose.Schema(
  {
    layoutId: { type: String, required: true }, // Add layoutId
    plotNumber: { type: Number, required: true },
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

// Compound index to ensure plotNumber is unique within a layout
plotSchema.index({ layoutId: 1, plotNumber: 1 }, { unique: true });

module.exports = mongoose.model("Plot", plotSchema);
