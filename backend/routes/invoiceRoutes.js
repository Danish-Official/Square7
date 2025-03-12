const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const authenticate = require('../middleware/authenticate');

// Add Invoice
router.post('/', authenticate(), async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
