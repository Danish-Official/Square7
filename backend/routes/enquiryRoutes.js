const express = require("express");
const router = express.Router();
const Enquiry = require("../models/Enquiry");
const authenticate = require("../middleware/authenticate");

// Create Enquiry
router.post("/", authenticate(), async (req, res) => {
  try {
    const { name, phoneNumber, message, layoutId, date, address } = req.body;

    // Validation
    if (!name || typeof name !== "string" || !/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({ message: "Invalid name" });
    }
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Phone number should be exactly 10 digits" });
    }
    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Invalid message" });
    }
    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const enquiry = new Enquiry({ name, phoneNumber, message, layoutId, date, address });
    await enquiry.save();
    res.status(201).json(enquiry);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Fetch all enquiries
router.get("/", authenticate(), async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json(enquiries);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Fetch all enquiries for a layout
router.get("/layout/:layoutId", authenticate(), async (req, res) => {
  try {
    const { layoutId } = req.params;
    const enquiries = await Enquiry.find({ layoutId }).sort({ createdAt: -1 });
    res.status(200).json(enquiries);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Update Enquiry
router.put("/:id", authenticate(), async (req, res) => {
  try {
    const { name, phoneNumber, message, date, address } = req.body;

    // Validation
    if (!name || typeof name !== "string" || !/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({ message: "Invalid name" });
    }
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Phone number should be exactly 10 digits" });
    }
    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Invalid message" });
    }
    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { name, phoneNumber, message, date, address },
      { new: true }
    );

    if (!updatedEnquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.status(200).json(updatedEnquiry);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete Enquiry
router.delete("/:id", authenticate(), async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEnquiry = await Enquiry.findByIdAndDelete(id);

    if (!deletedEnquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.status(200).json({ message: "Enquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
