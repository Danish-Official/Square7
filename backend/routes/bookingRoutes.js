const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Plot = require("../models/Plot"); // Ensure Plot model is imported
const authenticate = require("../middleware/authenticate");

// Create Booking
router.post("/", authenticate(), async (req, res) => {
  try {
    console.log("Received booking data:", req.body); // Log incoming data for debugging
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
    console.error("Error saving booking:", error.message); // Log error details
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

// Update Booking
router.put("/:id", authenticate(), async (req, res) => {
  try {
    // Retrieve the existing booking
    const existingBooking = await Booking.findById(req.params.id);
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    // Convert numeric fields if provided, else use existing values
    const updatedFirstPayment =
      req.body.firstPayment !== undefined
        ? Number(req.body.firstPayment)
        : existingBooking.firstPayment;
    const updatedTotalCost =
      req.body.totalCost !== undefined
        ? Number(req.body.totalCost)
        : existingBooking.totalCost;

    // Check that firstPayment is greater than 0 and less than or equal to totalCost
    if (updatedFirstPayment <= 0 || updatedFirstPayment > updatedTotalCost) {
      return res.status(400).json({
        message:
          "First payment must be greater than 0 and less than or equal to the total cost.",
      });
    }

    // Merge the incoming data with the safe numeric values
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
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
