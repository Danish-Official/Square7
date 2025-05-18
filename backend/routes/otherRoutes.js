const express = require('express');
const router = express.Router();
const Other = require('../models/Other');
const authenticate = require('../middleware/authenticate');

// Get all others
router.get('/', authenticate(), async (req, res) => {
  try {
    const others = await Other.find().sort({ createdAt: -1 });
    res.status(200).json(others);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Add new other
router.post('/', authenticate(), async (req, res) => {
  try {
    const other = new Other(req.body);
    await other.save();
    res.status(201).json(other);
  } catch (error) {
    console.error('Error creating other:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Update other
router.put('/:id', authenticate(), async (req, res) => {
  try {
    const other = await Other.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!other) {
      return res.status(404).json({ message: "Other not found" });
    }
    res.status(200).json(other);
  } catch (error) {
    console.error('Error updating other:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Delete other
router.delete('/:id', authenticate(), async (req, res) => {
  try {
    const other = await Other.findByIdAndDelete(req.params.id);
    if (!other) {
      return res.status(404).json({ message: "Other not found" });
    }
    res.status(200).json({ message: "Other deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
