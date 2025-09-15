const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ✅ Send OTP
router.post('/send-otp', async (req, res) => {
  const { email, mobile } = req.body;
  if (!email && !mobile) {
    return res.status(400).json({ message: "Email or mobile required" });
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    let user = await User.findOne({ $or: [{ email }, { mobile }] });

    if (!user) {
      user = new User({ email, mobile });
    }

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    // TODO: Integrate with Email/SMS gateway here
    console.log(`OTP for ${email || mobile}: ${otp}`);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "OTP verified. You can now complete registration." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Register after OTP verification
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "OTP not verified or user not found" });
    }

    if (user.password) {
      return res.status(409).json({ message: "User already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.name = name;
    user.password = hashedPassword;

    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Add money
router.post('/add-money', async (req, res) => {
  const { email, amount } = req.body;

  if (!email || !amount) {
    return res.status(400).json({ message: "email and amount are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.walletBalance += amount;

    user.transactions.push({
      type: 'credit',
      amount,
      details: `Added money to wallet`,
      timestamp: new Date()
    });

    await user.save();

    res.json({
      message: "Money added",
      amount,
      newBalance: user.walletBalance
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Recharge
router.post('/recharge', async (req, res) => {
  const { email, mobile, amount } = req.body;

  if (!email || !mobile || !amount) {
    return res.status(400).json({ message: "email, mobile, and amount are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.walletBalance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    user.walletBalance -= amount;

    user.transactions.push({
      type: 'debit',
      amount,
      details: `Recharge done to mobile number ${mobile}`,
      timestamp: new Date()
    });

    await user.save();

    res.json({
      message: "Recharge successful",
      rechargedTo: mobile,
      amount,
      remainingBalance: user.walletBalance
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Transaction History
router.get('/transactions/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ transactions: user.transactions });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
