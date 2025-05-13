const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  layoutId: {
    type: String,
    required: true
  },
  occupation: {
    type: String,
    required: false,  // Changed to false to make it optional
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
