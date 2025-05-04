const express = require('express');
const router = express.Router();
const Broker = require('../models/Broker');
const authenticate = require('../middleware/authenticate');

// Get all brokers
router.get('/', authenticate(), async (req, res) => {
    try {
        const brokers = await Broker.find().sort({ createdAt: -1 });
        res.status(200).json(brokers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create broker
router.post('/', authenticate(), async (req, res) => {
    try {
        const { name, phoneNumber, address, commission } = req.body;

        // Validation
        if (!name || typeof name !== 'string' || !/^[A-Za-z\s]+$/.test(name)) {
            return res.status(400).json({ message: 'Invalid broker name. Only alphabets and spaces are allowed.' });
        }
        if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
            return res.status(400).json({ message: 'Phone number should be exactly 10 digits.' });
        }
        if (!address || typeof address !== 'string') {
            return res.status(400).json({ message: 'Address is required.' });
        }
        if (!commission || isNaN(commission) || commission < 0 || commission > 100) {
            return res.status(400).json({ message: 'Commission must be a number between 0 and 100.' });
        }

        const broker = new Broker({ name, phoneNumber, address, commission });
        await broker.save();
        res.status(201).json(broker);
    } catch (error) {
        console.error('Error creating broker:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
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
        const broker = await Broker.findByIdAndDelete(req.params.id);
        if (!broker) return res.status(404).json({ message: 'Broker not found' });
        res.status(200).json({ message: 'Broker deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
