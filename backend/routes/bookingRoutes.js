const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Booking = require("../models/Booking");
const Plot = require("../models/Plot");
const Invoice = require("../models/Invoice");
const Broker = require("../models/Broker");
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

// Update multer configuration to handle multiple files
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and PDF are allowed.'));
    }
  }
}).fields([
  { name: 'aadharCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 }
]);

// Create Booking with document upload
router.post("/", authenticate(), (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `File upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: `Unknown upload error: ${err.message}` });
    }
    next();
  });
}, async (req, res) => {
  console.log("========= NEW BOOKING REQUEST =========");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  console.log("Request files:", req.files);
  
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
      documentType
    } = req.body;

    console.log("Parsed booking data:", {
      buyerName,
      address,
      phoneNumber,
      plotId,
      totalCost,
      firstPayment,
      bookingDate
    });

    // Validate required fields
    if (!buyerName || !address || !phoneNumber || !plotId || !totalCost || !firstPayment) {
      console.log("Missing required fields:", {
        buyerName: !!buyerName,
        address: !!address,
        phoneNumber: !!phoneNumber,
        plotId: !!plotId,
        totalCost: !!totalCost,
        firstPayment: !!firstPayment
      });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate phone number
    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate first payment
    if (Number(firstPayment) <= 0 || Number(firstPayment) > Number(totalCost)) {
      return res.status(400).json({ 
        message: "First payment must be greater than 0 and less than or equal to total cost" 
      });
    }

    console.log("Received booking data:", req.body);
    
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
      const broker = new Broker(brokerInfo);
      await broker.save();
      brokerId = broker._id;
    }

    // Handle uploaded documents
    const documents = [];
    const serverUrl = `${req.protocol}://${req.get('host')}`;

    if (req.files) {
      if (req.files.aadharCard) {
        const file = req.files.aadharCard[0];
        documents.push({
          type: 'aadharCard',
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
      firstPayment: Number(firstPayment),
      bookingDate: bookingDate ? new Date(bookingDate) : new Date(),
      email: email || undefined,
      broker: brokerId,
      documents: documents
    });

    // Log before saving
    console.log("About to save booking:", booking);
    await booking.save();
    console.log("Booking saved successfully");

    // Log before updating plot
    console.log("Updating plot status:", plot._id);
    plot.status = "sold";
    await plot.save();
    console.log("Plot status updated successfully");

    // Return populated booking
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
router.put("/:id", authenticate(), async (req, res) => {
  try {
    const existingBooking = await Booking.findById(req.params.id);
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const updatedFirstPayment =
      req.body.firstPayment !== undefined
        ? Number(req.body.firstPayment)
        : existingBooking.firstPayment;
    const updatedTotalCost =
      req.body.totalCost !== undefined
        ? Number(req.body.totalCost)
        : existingBooking.totalCost;

    if (updatedFirstPayment <= 0 || updatedFirstPayment > updatedTotalCost) {
      return res.status(400).json({
        message:
          "First payment must be greater than 0 and less than or equal to the total cost.",
      });
    }

    const updateData = {
      ...req.body,
      firstPayment: updatedFirstPayment,
      totalCost: updatedTotalCost,
    };

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Delete Booking
router.delete("/:id", authenticate(), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await Invoice.deleteOne({ booking: booking._id });
    await Booking.deleteOne({ _id: booking._id });

    const plot = await Plot.findById(booking.plot);
    if (plot) {
      plot.status = "available";
      await plot.save();
    }

    res
      .status(200)
      .json({ message: "Booking and related data deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
