const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  otp: String,
  otpExpiry: Date,
  isVerified: {
    type: Boolean,
    default: false
  },
  password: String,
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple docs with null email
    validate: {
      validator: function (v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  mobile: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple docs with null mobile
    match: /^[0-9]{10}$/,
    required: function () {
      return !this.email;
    }
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  transactions: [
    {
      type: {
        type: String,
        enum: ["credit", "debit"],
      },
      amount: Number,
      date: {
        type: Date,
        default: Date.now,
      },
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
