const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const LayoutResource = require('../models/LayoutResource');
const authenticate = require('../middleware/authenticate');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/resources';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and PDF are allowed.'));
        }
    }
});

// Upload file
router.post('/upload', authenticate('superadmin'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Get server URL from request
        const serverUrl = `${req.protocol}://${req.get('host')}`;

        const resource = new LayoutResource({
            filename: req.file.filename,
            originalName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            layoutId: req.body.layoutId,
            url: `${serverUrl}/uploads/resources/${req.file.filename}`  // Use full URL
        });

        await resource.save();
        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Get files by layout
router.get('/layout/:layoutId', authenticate('superadmin'), async (req, res) => {
    try {
        const resources = await LayoutResource.find({ layoutId: req.params.layoutId })
            .sort({ uploadDate: -1 });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete file
router.delete('/:id', authenticate('superadmin'), async (req, res) => {
    try {
        const resource = await LayoutResource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Extract filename from full URL
        const filename = resource.url.split('/').pop();
        const filePath = path.join(__dirname, '..', 'uploads', 'resources', filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await LayoutResource.deleteOne({ _id: req.params.id });
        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
