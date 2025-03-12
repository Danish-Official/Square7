const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const authenticate = require('../middleware/authenticate');

// Create Enquiry
router.post('/', authenticate(), async (req, res) => {
  try {
    const enquiry = new Enquiry(req.body);
    await enquiry.save();
    res.status(201).json(enquiry);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;