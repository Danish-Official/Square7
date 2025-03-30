const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const authenticate = require("../middleware/authenticate");

router.post("/", authenticate(), async (req, res) => {
  try {
    const { booking } = req.body;
    const invoice = new Invoice({ booking, subsequentPayments: [] });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/:id/add-payment", authenticate(), async (req, res) => {
  try {
    const { amount, paymentDate, paymentType } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.subsequentPayments.push({ amount, paymentDate, paymentType });
    await invoice.save();

    res.status(200).json(invoice);
  } catch (error) {
    console.error("Error adding payment:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/", authenticate(), async (req, res) => {
  try {
    const invoices = await Invoice.find().populate("booking");
    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/:id", authenticate(), async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
