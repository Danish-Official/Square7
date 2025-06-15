const mongoose = require('mongoose');

const brokerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String
  },
  commission: {
    type: Number,
    default: 0
  },
  tdsPercentage: {
    type: Number,
    default: 5
  },
  date: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Broker', brokerSchema);
