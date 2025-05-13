const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const authenticate = require('../middleware/authenticate');

// Get all deleted contacts
router.get('/', authenticate(['admin', 'superadmin']), async (req, res) => {
  try {
    const deletedContacts = await Booking.find({ deleted: true })
      .populate('plot')
      .populate('broker');
    res.json(deletedContacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deleted contacts' });
  }
});

// Restore a deleted contact
router.post('/restore/:id', authenticate(['superadmin']), async (req, res) => {
  try {
    const contact = await Booking.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    contact.deleted = false;
    contact.deletedAt = undefined;
    await contact.save();

    res.json({ message: 'Contact restored successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring contact' });
  }
});

module.exports = router;
