const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const accountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please enter an email'],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      trim: true,
      select: false,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpiresAt: Date,
  },
  {
    timestamps: true,
  }
);

accountSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    throw new Error(err.message);
  }
});

accountSchema.methods.comparePassword = async function (
  userPassword,
  dbPassword
) {
  try {
    return await bcrypt.compare(userPassword, dbPassword);
  } catch (err) {
    throw new Error(err.msg);
  }
};

accountSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000; //10 minutes
  return resetToken;
};

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;
