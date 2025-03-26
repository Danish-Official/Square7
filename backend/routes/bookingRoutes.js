const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Plot = require("../models/Plot"); // Ensure Plot model is imported
const authenticate = require("../middleware/authenticate");

// Create Booking
router.post("/", authenticate(), async (req, res) => {
  try {
    const { plotId, ratePerSqFt, areaSqFt, ...rest } = req.body; // Exclude unnecessary fields

    // Validate that the plot exists and is available
    const plot = await Plot.findById(plotId);
    if (!plot || plot.status !== "available") {
      return res.status(400).json({ message: "Plot is not available" });
    }

    // Create booking and update plot status
    const booking = new Booking({ plot: plotId, ...rest });
    await booking.save();
    plot.status = "sold";
    await plot.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error saving booking:", error); // Log the error for debugging
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get all bookings
router.get("/", authenticate(), async (req, res) => {
  try {
    const bookings = await Booking.find().populate("plot");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete Booking
router.delete("/:id", authenticate(), async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update plot status to "available"
    const plot = await Plot.findById(booking.plot);
    if (plot) {
      plot.status = "available";
      await plot.save();
    }

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
