const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const authenticate = require('../middleware/authenticate');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Delete uploaded expense document
router.delete('/:id/document', authenticate('superadmin'), async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (!expense.documentUrl) return res.status(400).json({ message: 'No document to delete' });
    const filename = expense.documentUrl.replace('/uploads/expenses/', '');
    const filePath = path.join(__dirname, '../uploads/expenses', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    expense.documentUrl = undefined;
    await expense.save();
    res.status(200).json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Serve uploaded expense documents
router.get('/:filename', authenticate('superadmin'), (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads/expenses', filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Document not found' });
  }
  res.setHeader('Content-Disposition', 'attachment');
  res.sendFile(filePath);
});

// Multer config for expense document upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/expenses');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `expense_${req.params.id || Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Upload document for an expense
router.post('/:id/upload', authenticate('superadmin'), upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fileUrl = `/uploads/expenses/${req.file.filename}`;
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { documentUrl: fileUrl },
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.status(200).json({ message: 'Document uploaded', documentUrl: fileUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Get all expenses for a layout
router.get('/layout/:layoutId', authenticate('superadmin'), async (req, res) => {
  try {
    const { layoutId } = req.params;
    const expenses = await Expense.find({ layoutId }).sort({ createdAt: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Add new expense
router.post('/', authenticate('superadmin'), async (req, res) => {
  try {
    const { amount, tds, name, receivedBy, contactNumber, date, layoutId } = req.body;

    if (!name || !receivedBy || !amount || !layoutId) {
      return res.status(400).json({ message: "Name, Received By, Amount, and Layout are required" });
    }

    // Calculate net amount
    const netAmount = amount - (amount * (tds || 0) / 100);

    const expense = new Expense({
      amount,
      tds,
      netAmount,
      name,
      receivedBy,
      contactNumber,
      date,
      layoutId
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Update expense
router.put('/:id', authenticate('superadmin'), async (req, res) => {
  try {
    const { amount, tds, name, receivedBy, contactNumber, date, layoutId } = req.body;

    if (!name || !receivedBy || !amount || !layoutId) {
      return res.status(400).json({ message: "Name, Received By, Amount, and Layout are required" });
    }

    // Calculate net amount
    const netAmount = amount - (amount * (tds || 0) / 100);

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        amount,
        tds,
        netAmount,
        name,
        receivedBy,
        contactNumber,
        date,
        layoutId
      },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Delete expense
router.delete('/:id', authenticate('superadmin'), async (req, res) => {
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
