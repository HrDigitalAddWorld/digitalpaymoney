// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = "digitalwallet"; // Ideally from .env

// // Register API
// router.post('/register', async (req, res) => {
//   const { name, email, mobile, password } = req.body;
//   try {
//     const userExists = await User.findOne({ email });
//     if (userExists) return res.status(400).json({ message: "User already exists" });

//     const hashed = await bcrypt.hash(password, 10);
//     const user = new User({ name, email, mobile, password: hashed });
//     await user.save();
//     res.status(201).json({ message: "User registered" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Login API
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//     const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
//     res.json({ message: "Login successful", token });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

module.exports = router;
