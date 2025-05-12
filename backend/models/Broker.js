const mongoose = require('mongoose');

const brokerSchema = new mongoose.Schema({
    name: { 
        type: String
    },
    phoneNumber: {
        type: String
    },
    address: {
        type: String
    },
    commission: { 
        type: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('Broker', brokerSchema);
