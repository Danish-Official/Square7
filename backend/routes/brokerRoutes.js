const express = require('express');
const router = express.Router();
const Broker = require('../models/Broker');
const Booking = require('../models/Booking');
const authenticate = require('../middleware/authenticate');

// Get all brokers with their plot details
router.get('/', authenticate(), async (req, res) => {
    try {
        // Get all brokers
        const brokers = await Broker.find().lean();
        
        // Get bookings for each broker with plot details
        const brokersWithPlots = await Promise.all(brokers.map(async (broker) => {
            const bookings = await Booking.find({ 
                broker: broker._id,
                status: { $ne: 'cancelled' } // Only get active bookings
            })
            .populate('plot', 'plotNumber layoutId')
            .lean();
            
            const plots = bookings
                .filter(booking => booking.plot)
                .map(booking => ({
                    _id: booking.plot._id,
                    plotNumber: booking.plot.plotNumber,
                    layoutId: booking.plot.layoutId
                }));
            
            return {
                ...broker,
                plots: plots || []
            };
        }));

        console.log('Sending brokers data:', brokersWithPlots); // Debug log
        res.status(200).json(brokersWithPlots);
    } catch (error) {
        console.error('Error in /brokers route:', error);
        res.status(500).json({ 
            message: "Failed to fetch brokers", 
            error: error.message 
        });
    }
});

// Update broker
router.put('/:id', authenticate(), async (req, res) => {
    try {
        const { name, phoneNumber, address, commission } = req.body;

        // Validation
        if (name && (typeof name !== 'string' || !/^[A-Za-z\s]+$/.test(name))) {
            return res.status(400).json({ message: 'Invalid broker name. Only alphabets and spaces are allowed.' });
        }
        if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
            return res.status(400).json({ message: 'Phone number should be exactly 10 digits.' });
        }
        if (address && typeof address !== 'string') {
            return res.status(400).json({ message: 'Invalid address format.' });
        }
        if (commission && (isNaN(commission) || commission < 0 || commission > 100)) {
            return res.status(400).json({ message: 'Commission must be a number between 0 and 100.' });
        }

        const broker = await Broker.findByIdAndUpdate(
            req.params.id, 
            { name, phoneNumber, address, commission },
            { new: true, runValidators: true }
        );
        if (!broker) return res.status(404).json({ message: 'Broker not found' });
        res.status(200).json(broker);
    } catch (error) {
        console.error('Error updating broker:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});

// Delete broker
router.delete('/:id', authenticate(), async (req, res) => {
    try {
        // Remove broker reference from all associated bookings
        await Booking.updateMany(
            { broker: req.params.id },
            { $unset: { broker: 1 } }
        );

        const broker = await Broker.findByIdAndDelete(req.params.id);
        if (!broker) return res.status(404).json({ message: 'Broker not found' });
        res.status(200).json({ message: 'Broker deleted successfully' });
    } catch (error) {
        console.error('Error deleting broker:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
