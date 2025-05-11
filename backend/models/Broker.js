const mongoose = require('mongoose');

const brokerSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    address: {
        type: String
    },
    commission: { 
        type: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('Broker', brokerSchema);
