const express = require('express');
const router = express.Router();
const DeletedContact = require('../models/DeletedContact');
const authenticate = require('../middleware/authenticate');

// Get all deleted contacts
router.get('/', authenticate('superadmin'), async (req, res) => {
  try {
    const deletedContacts = await DeletedContact.find()
      .populate('plot')
      .populate('deletedBy', 'name')
      .sort({ deletedAt: -1 });
    res.json(deletedContacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deleted contacts' });
  }
});

module.exports = router;
