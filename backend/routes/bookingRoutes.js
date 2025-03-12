const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const authenticate = require('../middleware/authenticate');

// Create Booking
router.post('/', authenticate(), async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all bookings
router.get('/', authenticate(), async (req, res) => {
  try {
    const bookings = await Booking.find().populate('plot');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;