const express = require('express');
const router = express.Router();
const Broker = require('../models/Broker');
const Booking = require('../models/Booking');
const authenticate = require('../middleware/authenticate');

// Get all brokers with their plot details
router.get('/', authenticate(), async (req, res) => {
  try {
    const brokers = await Broker.find().lean().sort({ createdAt: -1 });

    const brokersWithPlots = await Promise.all(
      brokers.map(async (broker) => {
        // Find the latest booking for this broker (not cancelled)
        const booking = await Booking.findOne({
          broker: broker._id,
          status: { $ne: 'cancelled' }
        })
          .populate('plot', 'plotNumber layoutId')
          .lean()
          .sort({ bookingDate: -1 });

        return {
          ...broker,
          plot: booking?.plot || null,
          totalCost: booking?.totalCost || 0
        };
      })
    );

    res.status(200).json(brokersWithPlots);
  } catch (error) {
    console.error('Error in /brokers route:', error);
    res.status(500).json({ message: 'Failed to fetch brokers' });
  }
});

// Update broker
router.put('/:id', authenticate(), async (req, res) => {
  try {
    const { name, phoneNumber, address, commissionRate, tdsPercentage, bookingId } = req.body;

    if (name && (typeof name !== 'string' || !/^[A-Za-z\s]+$/.test(name))) {
      return res.status(400).json({ message: 'Invalid broker name' });
    }

    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }

    if (address && typeof address !== 'string') {
      return res.status(400).json({ message: 'Invalid address' });
    }

    const booking = await Booking.findByIdAndUpdate(bookingId, { commissionRate, tdsPercentage }, { new: true, runValidators: true })


    const broker = await Broker.findByIdAndUpdate(
      req.params.id,
      { name, phoneNumber, address },
      { new: true, runValidators: true }
    );

    if (!broker) {
      return res.status(404).json({ message: 'Broker not found' });
    }

    res.status(200).json(broker);
  } catch (error) {
    console.error('Error updating broker:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete broker
router.delete('/:id', authenticate(), async (req, res) => {
  try {
    await Booking.updateMany({ broker: req.params.id }, { $unset: { broker: 1 } });

    const broker = await Broker.findByIdAndDelete(req.params.id);
    if (!broker) {
      return res.status(404).json({ message: 'Broker not found' });
    }

    res.status(200).json({ message: 'Broker deleted successfully' });
  } catch (error) {
    console.error('Error deleting broker:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get broker details by booking ID
router.get('/booking/:bookingId', authenticate(), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('broker')
      .lean();

    if (!booking || !booking.broker) {
      return res.status(404).json({ message: 'Broker not found for this booking' });
    }

    res.status(200).json(booking.broker);
  } catch (error) {
    console.error('Error in /brokers/booking route:', error);
    res.status(500).json({ message: 'Failed to fetch broker details' });
  }
});

// Get broker details by booking ID
router.get('/booking/:bookingId', authenticate(), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('broker')
      .lean();

    if (!booking || !booking.broker) {
      return res.status(404).json({ message: 'Broker not found for this booking' });
    }

    res.status(200).json(booking.broker);
  } catch (error) {
    console.error('Error in /brokers/booking route:', error);
    res.status(500).json({ message: 'Failed to fetch broker details' });
  }
});

module.exports = router;
