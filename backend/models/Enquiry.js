const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    message: { type: String },
    layoutId: { type: String, required: true },
    date: { type: Date, required: true }, // Add date field
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);