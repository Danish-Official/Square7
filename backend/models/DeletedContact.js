const mongoose = require("mongoose");

const deletedContactSchema = new mongoose.Schema({
  originalId: mongoose.Schema.Types.ObjectId,
  buyerName: String,
  phoneNumber: String,
  plot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plot",
  },
  deletedAt: {
    type: Date,
    default: Date.now,
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("DeletedContact", deletedContactSchema);
