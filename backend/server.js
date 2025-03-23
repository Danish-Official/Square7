const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { router: authRoutes, createSuperAdmin } = require("./routes/authRoutes");
const plotRoutes = require("./routes/plotRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" })); // Allow requests from the frontend

if (!process.env.MONGO_URI) {
  console.error(
    "Error: MONGO_URI is not defined in the environment variables."
  );
  process.exit(1); // Exit the application if MONGO_URI is missing
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    createSuperAdmin(); // Moved here to ensure it runs after DB connection
  })
  .catch((err) => console.log("DB not connected", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/plots", plotRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/enquiries", enquiryRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
