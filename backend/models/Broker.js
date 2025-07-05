const mongoose = require('mongoose');

const brokerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String
  },
  address: {
    type: String,
    default: ''
  },
  // commissionRate, tdsPercentage, and date removed: now handled per booking
}, { timestamps: true });

module.exports = mongoose.model('Broker', brokerSchema);
