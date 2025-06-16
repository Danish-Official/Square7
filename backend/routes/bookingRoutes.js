const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Booking = require("../models/Booking");
const Plot = require("../models/Plot");
const Invoice = require("../models/Invoice");
const Broker = require("../models/Broker");
const DeletedContact = require("../models/DeletedContact");
const authenticate = require("../middleware/authenticate");

// Configure multer for document upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/documents';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

// Update the file upload configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG and PDF are allowed.'));
    }
    
    // Validate file field name
    const validFields = ['aadharCardFront', 'aadharCardBack', 'panCard'];
    if (!validFields.includes(file.fieldname)) {
      return cb(new Error('Invalid document type'));
    }
    
    cb(null, true);
  }
}).fields([
  { name: 'aadharCardFront', maxCount: 1 },
  { name: 'aadharCardBack', maxCount: 1 },
  { name: 'panCard', maxCount: 1 }
]);

// Add error handling middleware for file uploads
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size should be less than 2MB' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  next(err);
};

// Create Booking with document upload
router.post("/", authenticate(), (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      handleUploadError(err, req, res, next);
      return;
    }
    next();
  });
}, async (req, res) => {
  try {
    const {
      buyerName,
      address,
      phoneNumber,
      gender,
      dateOfBirth,
      plot: plotId,
      paymentType,
      narration,
      totalCost,
      firstPayment,
      bookingDate,
      email,
      brokerData,
      documentType,
      ratePerSqFt, // Add this field
    } = req.body;
    // Validate required fields
    if (!buyerName || !address || !phoneNumber || !plotId || !totalCost || !firstPayment || !ratePerSqFt) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate phone number
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Phone number should be exactly 10 digits" });
    }

    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate Booking Payment
    if (Number(firstPayment) <= 0 || Number(firstPayment) > Number(totalCost)) {
      return res.status(400).json({ 
        message: "Booking Payment must be greater than 0 and less than or equal to total cost" 
      });
    }

    // Check if plot exists and is available
    const plot = await Plot.findById(plotId);
    if (!plot) {
      return res.status(404).json({ message: "Plot not found" });
    }
    if (plot.status === "sold") {
      return res.status(400).json({ message: "Plot is already sold" });
    }

    // Handle broker if provided
    let brokerId = null;
    if (brokerData) {
      const brokerInfo = typeof brokerData === 'string' ? JSON.parse(brokerData) : brokerData;
      const broker = new Broker({
        ...brokerInfo,
        date: bookingDate ? new Date(bookingDate) : new Date()
      });
      await broker.save();
      brokerId = broker._id;
    }

    // Handle uploaded documents
    const documents = [];
    const serverUrl = `${req.protocol}://${req.get('host')}`;

    if (req.files) {
      if (req.files.aadharCardFront) {
        const file = req.files.aadharCardFront[0];
        documents.push({
          type: 'aadharCardFront',
          filename: file.filename,
          originalName: file.originalname,
          url: `${serverUrl}/uploads/documents/${file.filename}`
        });
      }
      if (req.files.aadharCardBack) {
        const file = req.files.aadharCardBack[0];
        documents.push({
          type: 'aadharCardBack',
          filename: file.filename,
          originalName: file.originalname,
          url: `${serverUrl}/uploads/documents/${file.filename}`
        });
      }
      if (req.files.panCard) {
        const file = req.files.panCard[0];
        documents.push({
          type: 'panCard',
          filename: file.filename,
          originalName: file.originalname,
          url: `${serverUrl}/uploads/documents/${file.filename}`
        });
      }
    }

    // Create booking
    const booking = new Booking({
      buyerName,
      address,
      phoneNumber,
      gender,
      dateOfBirth: dateOfBirth || undefined,
      plot: plotId,
      paymentType,
      narration,
      totalCost: Number(totalCost),
      ratePerSqFt: Number(ratePerSqFt),
      firstPayment: Number(firstPayment),
      bookingDate: bookingDate ? new Date(bookingDate) : new Date(),
      email: email || undefined,
      broker: brokerId,
      documents: documents
    });

    await booking.save();
    plot.status = "sold";
    await plot.save();
    const populatedBooking = await Booking.findById(booking._id)
      .populate('plot')
      .populate('broker');

    res.status(201).json(populatedBooking);

  } catch (error) {
    console.error("Booking creation error details:", {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: "Failed to create booking",
      error: error.message
    });
  }
});

// Get all bookings
router.get("/", authenticate(), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("plot")
      .populate("broker")
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get booking by ID
router.get("/:id", authenticate(), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('plot')
      .populate('broker')
      .lean();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get all bookings for a specific layout
router.get("/layout/:layoutId", authenticate(), async (req, res) => {
  try {
    const { layoutId } = req.params;
    const plots = await Plot.find({ layoutId }).lean();
    const plotIds = plots.map((plot) => plot._id);

    const bookings = await Booking.find({ plot: { $in: plotIds } })
      .populate("plot")
      .populate("broker")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(
      bookings.map((booking) => ({
        ...booking,
        bookingDate: booking.bookingDate,
      }))
    );
  } catch (error) {
    console.error("Error fetching bookings for layout:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Update Booking
router.put("/:id", authenticate(), (req, res, next) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `File upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: `Unknown upload error: ${err.message}` });
    }

    try {
      const existingBooking = await Booking.findById(req.params.id);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Handle uploaded documents
      let documents = [...existingBooking.documents];
      const serverUrl = `${req.protocol}://${req.get('host')}`;

      if (req.files) {
        for (const docType of ['aadharCardFront', 'aadharCardBack', 'panCard']) {
          if (req.files[docType]?.[0]) {
            const file = req.files[docType][0];

            // Remove old document if exists
            const oldDoc = documents.find(doc => doc.type === docType);
            if (oldDoc?.filename) {
              const oldPath = path.join(__dirname, '..', 'uploads', 'documents', oldDoc.filename);
              if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
              }
            }

            // Update document list
            documents = documents.filter(doc => doc.type !== docType);
            documents.push({
              type: docType,
              filename: file.filename,
              originalName: file.originalname,
              url: `${serverUrl}/uploads/documents/${file.filename}`,
              uploadDate: new Date()
            });
          }
        }
      }

      // Handle broker data
      let brokerId = existingBooking.broker;
      if (req.body.brokerData) {
        const brokerInfo = JSON.parse(req.body.brokerData);
        
        if (brokerInfo._id) {
          // Update existing broker
          await Broker.findByIdAndUpdate(brokerInfo._id, {
            name: brokerInfo.name,
            phoneNumber: brokerInfo.phoneNumber,
            address: brokerInfo.address,
            commission: brokerInfo.commission,
            date: req.body.bookingDate ? new Date(req.body.bookingDate) : existingBooking.bookingDate
          });
          brokerId = brokerInfo._id;
        } else if (brokerInfo.name) {
          // Create new broker
          const broker = new Broker({
            ...brokerInfo,
            date: req.body.bookingDate ? new Date(req.body.bookingDate) : existingBooking.bookingDate
          });
          await broker.save();
          brokerId = broker._id;
        }
      }

      // Prepare update data
      const updateData = {
        ...req.body,
        broker: brokerId,
        documents
      };

      // Remove unnecessary fields
      delete updateData.brokerData;
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) delete updateData[key];
      });

      // Update booking
      const updatedBooking = await Booking.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('plot').populate('broker');

      res.status(200).json(updatedBooking);

    } catch (error) {
      console.error("Error updating booking:", error);
      // Cleanup uploaded files on error
      if (req.files) {
        Object.values(req.files).forEach(files => {
          files.forEach(file => {
            const filePath = path.join(__dirname, '..', 'uploads', 'documents', file.filename);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          });
        });
      }
      res.status(500).json({ message: "Error updating booking", error: error.message });
    }
  });
});

// Update broker for a booking
router.put("/:id/broker", authenticate(), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const {
      name,
      phoneNumber,
      commission,
      tdsPercentage,
      date
    } = req.body;

    // Validate broker data
    if (!name || typeof name !== 'string' || !/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({ message: "Invalid broker name" });
    }

    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Phone number must be 10 digits" });
    }

    const parsedCommission = parseFloat(commission);
    if (isNaN(parsedCommission) || parsedCommission < 0 || parsedCommission > 100) {
      return res.status(400).json({ message: "Commission must be between 0 and 100" });
    }

    const parsedTDS = parseFloat(tdsPercentage);
    if (isNaN(parsedTDS) || parsedTDS < 0 || parsedTDS > 100) {
      return res.status(400).json({ message: "TDS percentage must be between 0 and 100" });
    }

    // Update or create broker
    let broker;
    if (booking.broker) {
      broker = await Broker.findByIdAndUpdate(
        booking.broker,
        {
          name,
          phoneNumber,
          commission: parsedCommission,
          tdsPercentage: parsedTDS,
          date: date || new Date()
        },
        { new: true, runValidators: true }
      );
    } else {
      broker = new Broker({
        name,
        phoneNumber,
        commission: parsedCommission,
        tdsPercentage: parsedTDS,
        date: date || new Date()
      });
      await broker.save();
      booking.broker = broker._id;
      await booking.save();
    }

    res.status(200).json(broker);
  } catch (error) {
    console.error("Error updating broker:", error);
    res.status(500).json({ 
      message: "Failed to update broker",
      error: error.message 
    });
  }
});

// Delete Booking
router.delete("/:id", authenticate('superadmin'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Create deleted contact record
    const deletedContact = new DeletedContact({
      originalId: booking._id,
      buyerName: booking.buyerName,
      phoneNumber: booking.phoneNumber,
      plot: booking.plot,
      deletedBy: req.user.id
    });
    await deletedContact.save();

    await Invoice.deleteOne({ booking: booking._id });
    await Booking.deleteOne({ _id: booking._id });

    const plot = await Plot.findById(booking.plot);
    if (plot) {
      plot.status = "available";
      await plot.save();
    }

    res.status(200).json({ message: "Booking and related data deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Serve uploaded documents
router.get("/documents/:filename", authenticate(), (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '..', 'uploads', 'documents', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Document not found" });
  }

  // Set content disposition to force download
  res.setHeader('Content-Disposition', 'attachment');
  res.sendFile(filePath);
});

// Get broker details by booking ID
router.get("/:id/broker", authenticate(), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'broker',
        select: 'name phoneNumber commission tdsPercentage date'
      })
      .lean();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.broker) {
      return res.status(404).json({ message: "No broker associated with this booking" });
    }

    // Calculate broker's commission for this booking
    const commission = booking.broker.commission || 0;
    const tdsPercentage = booking.broker.tdsPercentage || 5;
    const totalCost = booking.totalCost || 0;
    const amount = (totalCost * commission) / 100;
    const tdsAmount = (amount * tdsPercentage) / 100;
    const netAmount = amount - tdsAmount;

    const brokerDetails = {
      ...booking.broker,
      bookingAmount: totalCost,
      commissionAmount: Math.round(amount),
      tdsAmount: Math.round(tdsAmount),
      netAmount: Math.round(netAmount)
    };

    res.status(200).json(brokerDetails);
  } catch (error) {
    console.error("Error fetching broker details:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
