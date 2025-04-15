const express = require("express");
const router = express.Router();
const Plot = require("../models/Plot");
const Booking = require("../models/Booking");
const authenticate = require("../middleware/authenticate");

// Get all plots
router.get("/get-plots", authenticate(), async (req, res) => {
  try {
    const plots = await Plot.find().lean(); // Fetch all plots
    const bookings = await Booking.find().populate("plot").lean(); // Fetch all bookings with plot details

    // Map buyer details to plots
    const plotsWithBuyerDetails = plots.map((plot) => {
      const booking = bookings.find(
        (b) => b.plot._id.toString() === plot._id.toString()
      );
      if (booking) {
        return {
          ...plot,
          buyer: booking.buyerName,
          contact: booking.phoneNumber,
        };
      }
      return plot;
    });

    res.status(200).json(plotsWithBuyerDetails);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all plots for a specific layout
router.get("/get-plots/:layoutId", authenticate(), async (req, res) => {
  try {
    const { layoutId } = req.params;
    const plots = await Plot.find({ layoutId }).lean();
    const bookings = await Booking.find().populate("plot").lean();

    const plotsWithBuyerDetails = plots.map((plot) => {
      const booking = bookings.find(
        (b) => b.plot._id.toString() === plot._id.toString()
      );
      if (booking) {
        return {
          ...plot,
          status: "sold", // Set status to sold if there's a booking
          buyer: booking.buyerName,
          contact: booking.phoneNumber,
        };
      }
      return {
        ...plot,
        status: plot.status || "available" // Ensure status is set
      };
    });

    res.status(200).json(plotsWithBuyerDetails);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Get available plots
router.get("/available-plots", authenticate(), async (req, res) => {
  try {
    const availablePlots = await Plot.find({ status: { $ne: "sold" } });
    res.status(200).json(availablePlots);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Get available plots for a specific layout
router.get("/available-plots/:layoutId", authenticate(), async (req, res) => {
  try {
    const { layoutId } = req.params;
    const availablePlots = await Plot.find({
      layoutId,
      status: { $ne: "sold" },
    });
    res.status(200).json(availablePlots);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Get plot statistics
router.get("/stats", authenticate(), async (req, res) => {
  try {
    const totalPlots = await Plot.countDocuments();
    const soldPlots = await Plot.countDocuments({ status: "sold" });
    const availablePlots = totalPlots - soldPlots;

    res.status(200).json({ totalPlots, soldPlots, availablePlots });
  } catch (error) {
    console.error("Error fetching plot stats:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get plot statistics for specific layout
router.get("/stats/:layoutId", authenticate(), async (req, res) => {
  try {
    const { layoutId } = req.params;
    const totalPlots = await Plot.countDocuments({ layoutId });
    const soldPlots = await Plot.countDocuments({ layoutId, status: "sold" });
    const availablePlots = totalPlots - soldPlots;

    res.status(200).json({ totalPlots, soldPlots, availablePlots });
  } catch (error) {
    console.error("Error fetching plot stats:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get layouts list
router.get("/layouts", authenticate(), async (req, res) => {
  try {
    const layouts = await Plot.distinct("layoutId");
    res.status(200).json(layouts);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
