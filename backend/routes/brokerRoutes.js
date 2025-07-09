const express = require('express');
const router = express.Router();
const Broker = require('../models/Broker');
const Booking = require('../models/Booking');
const authenticate = require('../middleware/authenticate');
// Add broker to a booking
router.post('/booking/:bookingId', authenticate(), async (req, res) => {
  try {
    const { brokerId, name, phoneNumber, address, commissionRate, tdsPercentage } = req.body;

    let broker;
    // If brokerId is provided, associate existing broker
    if (brokerId) {
      broker = await Broker.findById(brokerId);
      if (!broker) {
        return res.status(404).json({ message: 'Broker not found' });
      }
    } else {
      // Validate required fields for new broker
      if (!name || typeof name !== 'string' || !/^[A-Za-z\s]+$/.test(name)) {
        return res.status(400).json({ message: 'Invalid or missing broker name' });
      }
      // Only include optional fields if provided
      const brokerData = { name };
      if (phoneNumber) brokerData.phoneNumber = phoneNumber;
      if (address) brokerData.address = address;
      broker = new Broker(brokerData);
      await broker.save();
    }

    // Update booking with broker, commissionRate, tdsPercentage (optional)
    const bookingUpdate = {
      broker: broker._id
    };
    if (commissionRate !== undefined && commissionRate !== null && commissionRate !== '') {
      bookingUpdate.commissionRate = commissionRate;
    }
    if (tdsPercentage !== undefined && tdsPercentage !== null && tdsPercentage !== '') {
      bookingUpdate.tdsPercentage = tdsPercentage;
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      bookingUpdate,
      { new: true, runValidators: true }
    );
    if (!booking) {
      // Rollback broker creation if booking not found and broker was just created
      if (!brokerId) await Broker.findByIdAndDelete(broker._id);
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(201).json(broker);
  } catch (error) {
    console.error('Error adding broker to booking:', error);
    res.status(500).json({ message: 'Failed to add broker' });
  }
});

// Get all brokers with their plot details, filtered by layout if provided
router.get('/', authenticate(), async (req, res) => {
  try {
    const { layoutId } = req.query;
    const brokers = await Broker.find().lean().sort({ createdAt: -1 });

    const brokersWithPlots = await Promise.all(
      brokers.map(async (broker) => {
        // If broker is null/undefined (shouldn't happen, but defensive)
        if (!broker) return null;
        // Find the latest booking for this broker (not cancelled)
        // If layoutId is provided, filter bookings by layoutId
        const bookingQuery = {
          broker: broker._id,
          status: { $ne: 'cancelled' }
        };
        if (layoutId) {
          // Find plots for this layout
          const Plot = require('../models/Plot');
          const plots = await Plot.find({ layoutId }).select('_id').lean();
          const plotIds = plots.map(p => p._id);
          bookingQuery.plot = { $in: plotIds };
        }
        const booking = await Booking.findOne(bookingQuery)
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

    // Filter out null/undefined brokers before sending response
    res.status(200).json(brokersWithPlots.filter(b => b && typeof b === 'object'));
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

    // If booking exists but broker is null/undefined, return null (not 404)
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // If broker is missing (deleted), return null
    if (!booking.broker) {
      return res.status(200).json(null);
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
