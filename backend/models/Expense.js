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
  role: {
    type: String,
    required: true,
    enum: ['Architect', 'Engineer', 'Contractor', 'Advocate', 'CA']
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
