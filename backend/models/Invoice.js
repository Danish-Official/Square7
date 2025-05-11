const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    payments: [
      {
        amount: { type: Number, required: true },
        paymentDate: { type: Date, default: Date.now },
        paymentType: {
          type: String,
          enum: ["Cash", "Cheque", "Online"],
          required: true,
        },
        narration: { type: String },
      },
    ],
  },
  { timestamps: true }
);

invoiceSchema.statics.calculateMonthlyRevenue = async function () {
  return this.aggregate([
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
};

module.exports = mongoose.model("Invoice", invoiceSchema);
