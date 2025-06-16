const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const authenticate = require("../middleware/authenticate");
const Booking = require("../models/Booking");

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
    const { amount, paymentDate, paymentType, paymentIndex, narration } = req.body;
    
    if (!amount || !paymentDate || !paymentType) {
      return res.status(400).json({ message: "Missing required payment information" });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Convert amount to number and validate
    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    // Create and validate payment date
    const paymentDateObj = new Date(paymentDate);
    if (isNaN(paymentDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid payment date" });
    }

    const paymentObj = {
      amount: paymentAmount,
      paymentDate: paymentDateObj,
      paymentType,
      narration// Add this line
    };

    if (typeof paymentIndex === 'number' && paymentIndex >= 0 && paymentIndex < invoice.payments.length) {
      // Update existing payment
      invoice.payments[paymentIndex] = paymentObj;
    } else {
      // Add new payment
      invoice.payments.push(paymentObj);
    }

    await invoice.save();
    
    const updatedInvoice = await Invoice.findById(invoice._id)
      .populate({
        path: 'booking',
        populate: 'plot'
      });

    res.status(200).json(updatedInvoice);
  } catch (error) {
    console.error("Error managing payment:", error);
    res.status(500).json({ message: error.message || "Server Error" });
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
        populate: {
          path: 'plot',
        }
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Filter invoices for the specific layout
    const filteredInvoices = invoices.filter(invoice => 
      invoice.booking && 
      invoice.booking.plot && 
      invoice.booking.plot.layoutId === layoutId
    );

    res.status(200).json(filteredInvoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ 
      message: "Failed to fetch invoices",
      error: error.message 
    });
  }
});

// Get invoice by plot ID
router.get("/plot/:plotId", authenticate(), async (req, res) => {
  try {
    const { plotId } = req.params;

    // Find bookings with the correct plot
    const booking = await Booking.findOne({ plot: plotId });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found for this plot" });
    }

    // Now find the invoice with that booking
    const invoice = await Invoice.findOne({ booking: booking._id })
      .populate({
        path: 'booking',
        populate: { path: 'plot' }
      });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found for this plot" });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


router.get("/:id", authenticate(), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: 'booking',
        populate: {
          path: 'plot'
        }
      });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
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

// Get invoice by booking ID
router.get("/booking/:bookingId", authenticate(), async (req, res) => {
  try {
    const { bookingId } = req.params;

    const invoice = await Invoice.findOne({ booking: bookingId })
      .populate({
        path: 'booking',
        populate: { path: 'plot' }
      });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found for this booking" });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
