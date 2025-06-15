const express = require('express');
const router = express.Router();
const Broker = require('../models/Broker');
const Booking = require('../models/Booking');
const authenticate = require('../middleware/authenticate');

// Get all brokers with their plot details and calculated amounts per booking
router.get('/', authenticate(), async (req, res) => {
  try {
    const brokers = await Broker.find().lean().sort({ createdAt: -1 });

    const brokersWithPlots = await Promise.all(
      brokers.map(async (broker) => {
        // Find bookings for this broker (not cancelled)
        const bookings = await Booking.find({
          broker: broker._id,
          status: { $ne: 'cancelled' }
        })
          .populate('plot', 'plotNumber layoutId') // Only get plotNumber and layoutId from plot
          .lean();

        // For each booking, calculate commission, tds, netAmount individually
        const plots = bookings
          .filter((booking) => booking.plot)
          .map((booking) => {
            const commission = broker.commission || 0;
            const tdsPercentage = broker.tdsPercentage || 5;
            const totalCost = booking.totalCost || 0;
            const amount = (totalCost * commission) / 100;
            const tdsAmount = (amount * tdsPercentage) / 100;
            const netAmount = amount - tdsAmount;
            return {
              _id: booking.plot._id,
              plotNumber: booking.plot.plotNumber,
              layoutId: booking.plot.layoutId,
              totalCost,
              commission,
              tdsPercentage,
              amount: Math.round(amount),
              tdsAmount: Math.round(tdsAmount),
              netAmount: Math.round(netAmount),
              bookingId: booking._id,
              bookingDate: booking.bookingDate
            };
          });

        return {
          ...broker,
          plots // each plot/booking has its own calculated values
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
    const { name, phoneNumber, commission, tdsPercentage, date } = req.body;

    if (name && (typeof name !== 'string' || !/^[A-Za-z\s]+$/.test(name))) {
      return res.status(400).json({ message: 'Invalid broker name' });
    }

    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }

    if (commission && (isNaN(commission) || commission < 0 || commission > 100)) {
      return res.status(400).json({ message: 'Commission must be 0–100' });
    }

    if (
      tdsPercentage !== undefined &&
      (isNaN(tdsPercentage) || tdsPercentage < 0 || tdsPercentage > 100)
    ) {
      return res.status(400).json({ message: 'TDS must be 0–100' });
    }

    if (date && isNaN(Date.parse(date))) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const broker = await Broker.findByIdAndUpdate(
      req.params.id,
      { name, phoneNumber, commission, tdsPercentage, date },
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

module.exports = router;
