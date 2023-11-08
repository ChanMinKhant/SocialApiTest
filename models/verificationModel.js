const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide email'],
  },
  token: {
    type: String,
    required: [true, 'Please provide token'],
  },
  expiresAt: {
    type: Date,
    default: Date.now + 1000 * 60 * 10, // 10 minutes
    index: { expires: '1s' },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60, // this is 10 seconds in seconds
  },
});

const Verification = mongoose.model('Verification', verificationSchema);

module.exports = Verification;
