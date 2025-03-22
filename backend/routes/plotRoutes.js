const express = require("express");
const router = express.Router();
const Plot = require("../models/Plot");
const authenticate = require("../middleware/authenticate");

// Create Plot (Super Admin only)
router.post("/add-plot", authenticate("superadmin"), async (req, res) => {
  try {
    const plot = new Plot(req.body);
    await plot.save();
    res.status(201).json(plot);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all plots
router.get("/get-plots", authenticate(), async (req, res) => {
  try {
    const plots = await Plot.find();
    res.status(200).json(plots);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Get a single plot by ID
router.get("/:id", authenticate(), async (req, res) => {
  try {
    const plot = await Plot.findById(req.params.id);
    if (!plot) {
      return res.status(404).json({ message: "Plot not found" });
    }
    res.status(200).json(plot);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Update Plot (Super Admin only)
router.put("/:id", authenticate("superadmin"), async (req, res) => {
  try {
    const updatedPlot = await Plot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(updatedPlot);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete Plot (Super Admin only)
router.delete("/:id", authenticate("superadmin"), async (req, res) => {
  try {
    await Plot.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Plot deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
