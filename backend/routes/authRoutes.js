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

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(user);
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
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = { router, createSuperAdmin };
