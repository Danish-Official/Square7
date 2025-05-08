const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db");
const { router: authRoutes, createSuperAdmin } = require("./routes/authRoutes");
const plotRoutes = require("./routes/plotRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const layoutResourceRoutes = require("./routes/layoutResourceRoutes");
const brokerRoutes = require("./routes/brokerRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const path = require("path");

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
app.use("/api/brokers", brokerRoutes);
app.use("/api/layout-resources", layoutResourceRoutes);
app.use("/api/expenses", expenseRoutes);

// Serve uploaded files statically - move this BEFORE the catch-all route
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Error Handling Middleware
app.use((err, req, res, next) => {
  res.status(500).json({ message: "Internal Server Error" });
});

// This should come last
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);
