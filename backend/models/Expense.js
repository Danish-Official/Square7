const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Utilities', 'Maintenance', 'Salary', 'Marketing', 'Legal', 'Other']
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
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
