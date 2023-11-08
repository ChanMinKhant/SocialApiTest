const mongoose = require('mongoose');
const geoip = require('geoip-lite');

const tokenSchema = new mongoose.Schema(
  {
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Account is required for a token'],
    },
    token: {
      type: String,
      required: [true, 'Token is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'ExpiresAt is required'],
      index: { expires: '1s' },
    },
  },
  { timestamps: true }
);

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
