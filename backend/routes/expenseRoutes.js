const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const authenticate = require('../middleware/authenticate');

// Get all expenses for a layout
router.get('/layout/:layoutId', authenticate(), async (req, res) => {
  try {
    const { layoutId } = req.params;
    const expenses = await Expense.find({ layoutId }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Add new expense
router.post('/', authenticate(), async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Update expense
router.put('/:id', authenticate(), async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete expense
router.delete('/:id', authenticate(), async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
