const mongoose = require('mongoose');

const plotSchema = new mongoose.Schema(
  {
    plotNumber: { type: String, required: true, unique: true },
    areaSqMt: { type: Number, required: true },
    areaSqFt: { type: Number, required: true },
    ratePerSqFt: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plot", plotSchema);
