const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

dotenv.config();

async function createSuperAdmin() {
  const existingSuperAdmin = await User.findOne({ role: "superadmin" });
  if (existingSuperAdmin) return;

  const hashedPassword = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD, 10);
  const superAdmin = new User({
    name: process.env.SUPERADMIN_NAME,
    email: process.env.SUPERADMIN_EMAIL,
    password: hashedPassword,
    role: "superadmin",
  });
  await superAdmin.save();
  console.log("Super Admin created successfully");
}

// Middleware to check if the user is a superadmin
const authenticate = require("../middleware/authenticate");

router.post("/create-admin", authenticate("superadmin"), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Hash the password and create the admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();
    res.status(201).json({ message: "Admin user created successfully" });
  } catch (error) {
    console.error("Error creating admin user:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Fetch all users
router.get("/users", authenticate("superadmin"), async (req, res) => {
  try {
    const users = await User.find(
      { role: { $ne: "superadmin" } },
      { password: 0 }
    );
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete user
router.delete("/users/:id", authenticate("superadmin"), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = { router, createSuperAdmin };
