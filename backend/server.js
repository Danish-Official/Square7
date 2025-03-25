const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db"); // Import the reusable DB connection
const { router: authRoutes, createSuperAdmin } = require("./routes/authRoutes");
const plotRoutes = require("./routes/plotRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" })); // Allow requests from the frontend

(async () => {
  try {
    await connectDB(); // Connect to the database
    createSuperAdmin(); // Ensure super admin is created after DB connection
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    process.exit(1); // Exit the application if DB connection fails
  }
})();

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
