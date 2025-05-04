const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Plot = require("../models/Plot");
const Invoice = require("../models/Invoice");
const Broker = require("../models/Broker");
const authenticate = require("../middleware/authenticate");

// Create Booking
router.post("/", authenticate(), async (req, res) => {
  try {
    console.log("Received booking data:", req.body);
    const { plotId, ratePerSqFt, areaSqFt, brokerData, ...rest } = req.body;

    // Check if any existing booking already uses this plot
    const existingBooking = await Booking.findOne({ plot: plotId });
    if (existingBooking) {
      return res.status(400).json({
        message: "This plot is already booked. Please select a different plot.",
      });
    }

    // Validate that the plot exists and is available
    const plot = await Plot.findById(plotId);
    if (!plot || plot.status !== "available") {
      return res.status(400).json({ message: "Plot is not available" });
    }

    // Create and save broker if brokerData exists
    let brokerId = null;
    if (brokerData) {
      const broker = new Broker(brokerData);
      await broker.save();
      brokerId = broker._id;
    }

    // Create booking with broker reference if exists
    const booking = new Booking({
      plot: plotId,
      broker: brokerId,
      ...rest,
    });

    await booking.save();
    plot.status = "sold";
    await plot.save();

    // Return the populated booking
    const populatedBooking = await Booking.findById(booking._id)
      .populate("plot")
      .populate("broker");

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error("Error saving booking:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
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
