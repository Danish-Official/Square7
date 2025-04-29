const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const authenticate = require("../middleware/authenticate");

router.post("/", authenticate(), async (req, res) => {
  try {
    const { booking, payments } = req.body;
    const invoice = new Invoice({ booking, payments });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/:id/add-payment", authenticate(), async (req, res) => {
  try {
    const { amount, paymentDate, paymentType, paymentIndex } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (paymentIndex !== undefined && paymentIndex >= 0 && paymentIndex < invoice.payments.length) {
      // Update existing payment
      invoice.payments[paymentIndex] = { amount, paymentDate, paymentType };
    } else {
      // Add new payment
      invoice.payments.push({ amount, paymentDate, paymentType });
    }
    
    await invoice.save();
    res.status(200).json(invoice);
  } catch (error) {
    console.error("Error managing payment:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/", authenticate(), async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("booking")
      .sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get invoices by layout
router.get("/layout/:layoutId", authenticate(), async (req, res) => {
  try {
    const { layoutId } = req.params;
    const invoices = await Invoice.find()
      .populate({
        path: 'booking',
        match: { layoutId: layoutId },
        populate: 'plot'
      })
      .sort({ createdAt: -1 });

    // Filter out null bookings (those that didn't match layoutId)
    const filteredInvoices = invoices.filter(invoice => invoice.booking);
    res.status(200).json(filteredInvoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/revenue", authenticate(), async (req, res) => {
  try {
    const revenueData = await Invoice.calculateMonthlyRevenue();
    res.status(200).json(revenueData);
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/revenue/:layoutId", authenticate(), async (req, res) => {
  try {
    const { layoutId } = req.params;
    const revenueData = await Invoice.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "booking",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      {
        $lookup: {
          from: "plots",
          localField: "booking.plot",
          foreignField: "_id",
          as: "plot",
        },
      },
      { $unwind: "$plot" },
      { $match: { "plot.layoutId": layoutId } },
      { $unwind: "$payments" },
      {
        $group: {
          _id: { $month: "$payments.paymentDate" },
          totalRevenue: { $sum: "$payments.amount" },
        },
      },
      {
        $project: {
          month: "$_id",
          totalRevenue: 1,
          _id: 0,
        },
      },
      { $sort: { month: 1 } },
    ]);

    res.status(200).json(revenueData);
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/:id", authenticate(), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    await Invoice.deleteOne({ _id: invoice._id });
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete(
  "/:id/payments/:paymentIndex",
  authenticate(),
  async (req, res) => {
    try {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const paymentIndex = parseInt(req.params.paymentIndex);
      if (paymentIndex < 0 || paymentIndex >= invoice.payments.length) {
        return res.status(400).json({ message: "Invalid payment index" });
      }

      invoice.payments.splice(paymentIndex, 1);
      await invoice.save();

      res.status(200).json(invoice);
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

module.exports = router;
