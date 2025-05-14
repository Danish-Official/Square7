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
  tds: {
    type: Number,
    required: false,
    default: 0
  },
  netAmount: {
    type: Number,
    required: false,
    default: function() {
      return this.amount - (this.amount * (this.tds || 0) / 100);
    }
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
    required: false,
    trim: true
  }
}, { timestamps: true });

// Add pre-save middleware to calculate netAmount
expenseSchema.pre('save', function(next) {
  this.netAmount = this.amount - (this.amount * (this.tds || 0) / 100);
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
