const express = require("express");
const router = express.Router();
const Plot = require("../models/Plot");
const authenticate = require("../middleware/authenticate");


// Get all plots
router.get("/get-plots", authenticate(), async (req, res) => {
  try {
    // const plots = await Plot.find();
    // res.status(200).json(plots);
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
module.exports = router;
