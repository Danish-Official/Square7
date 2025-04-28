const mongoose = require('mongoose');

const layoutResourceSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    layoutId: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    url: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('LayoutResource', layoutResourceSchema);
