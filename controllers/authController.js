const Account = require('../models/accountModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const CustomError = require('../utils/CustomError');
const Token = require('../models/tokenModel');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
// import { v4 as uuidv4 } from "uuid";
const { v4: uuidv4 } = require('uuid');
const Verification = require('../models/verificationModel');
const {
  signToken,
  saveToken,
  forgotPasswordEmailTemplate,
  sendEmail,
  verifyEmailTemplate,
} = require('../utils/index');

exports.register = asyncErrorHandler(async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    const err = new CustomError('Password does not match', 400);
    return next(err);
  }

  let user = await Account.findOne({ email });
  const isPendingToVerify = await Verification.find({ email }); //many
  if (user?.verify) {
    const err = new CustomError('Email already exists', 400);
    return next(err);
  }
  // ma phit pal register loke yin user lo update lote mal and delete all token and resend token.

  if (user) {
    if (isPendingToVerify.length > 0) {
      await Verification.deleteMany({ email });
    }
    //update password
    user.password = password;
    await user.save();
  } else {
    user = await Account.create({ email, password });
  }

  //sent verification message here.
  const token = uuidv4();
  const link = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/verifyemail/${token}`; //i will change frontend url later
  const message = verifyEmailTemplate(link);
  const hashToken = crypto.createHash('sha256').update(token).digest('hex');
  const verification = await Verification.create({
    email,
    token: hashToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 10, // 6 seconds
  });
  if (!verification) {
    const err = new CustomError('Something went wrong', 500);
    return next(err);
  }
  console.log('here');
  try {
    console.log('here');
    sendEmail({
      email: user.email,
      subject: 'Verify Your Email',
      message,
    });
    console.log('here');
  } catch (error) {
    console.log('here');
    //must clear verification token
    await user.deleteOne();
    await verification.deleteOne();
    const err = new CustomError('Email could not be sent', 500);
    return next(err);
  }
  res.status(201).send({
    success: 'PENDING',
    link,
    message:
      'Verification email has been sent to your account. Check your email for further instructions.',
  });
});

exports.verifyEmail = asyncErrorHandler(async (req, res, next) => {
  const { token } = req.params;
  //decrypt token and search from database
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const verification = await Verification.findOne({ token: hashedToken });

  if (!verification) {
    const err = new CustomError('Token is invalid or has expired', 400);
    return next(err);
  }
  const account = await Account.findOne({ email: verification.email });
  console.log(account);
  if (!account) {
    const err = new CustomError('Account is not found', 400);
    return next(err);
  }
  if (account?.verify) {
    const err = new CustomError('Email already verified', 400);
    return next(err);
  }
  if (verification.expiresAt < Date.now()) {
    console.log('here');
    await verification.deleteOne();
    await account.deleteOne();
    const err = new CustomError('Token is invalid or has expired', 400);
    return next(err);
  }
  account.verify = true;
  await account.save();
  await verification.deleteOne();

  const accessToken = signToken(account.id);
  res.cookie('jwt', accessToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * parseInt(process.env.EXPIRES_IN || 7),
  });
  saveToken(account._id, accessToken);
  res.status(201).json({
    status: 'success',
    user: account,
    message: 'User created successfully',
    accessToken,
    redirect: '/', //something
  });
});

exports.login = asyncErrorHandler(async (req, res, next) => {
  //if cookie exists, cant login
  // if (req.cookies?.jwt) {
  //   const err = new CustomError('You are already logged in', 400);
  //   return next(err);
  // }
  const { email, password } = req.body;

  if (!email) {
    const err = new CustomError('Please provide email', 400);
    return next(err);
  }
  if (!password) {
    const err = new CustomError('Please provide password', 400);
    return next(err);
  }

  const user = await Account.findOne({ email }).select('+password');
  if (!(user && user?.verify)) {
    //custom error handler later
    return res.status(404).json({
      status: 'fail',
      message: 'This email is not registered! Please sigup',
    });
  }

  if (!(await user.comparePassword(password, user.password))) {
    //custom error handler later
    const err = new CustomError('Incorrect password', 401);
    return next(err);
  }

  const accessToken = signToken(user.id);
  res.cookie('jwt', accessToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * parseInt(process.env.EXPIRES_IN || 7),
  });
  saveToken(user._id, accessToken);
  res.status(200).json({
    status: 'success',
    accessToken,
    message: 'User logged in successfully',
  });
});

exports.logout = asyncErrorHandler(async (req, res, next) => {
  const cookie = req.cookies;
  if (!cookie?.jwt) return res.sendStatus(204); //no content
  const accessToken = cookie.jwt;
  const foundUser = await Token.findOne({ token: accessToken });
  if (!foundUser) {
    return res.sendStatus(401); //unauthorized
  }
  //delete refresh token from db
  await Token.findOneAndDelete({ token: accessToken });
  //clear cookie
  res.clearCookie('jwt');
  res.sendStatus(204); //no content
});

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    const err = new CustomError('Please provide email', 400);
    return next(err);
  }
  const user = await Account.findOne({ email });
  if (!user) {
    const err = new CustomError('This email is not registered', 404);
    return next(err);
  }
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });
  //send email with reset token
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;
  const message = forgotPasswordEmailTemplate(resetURL);

  try {
    sendEmail({
      email: user.email,
      subject: 'Reset Your Password',
      message,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new CustomError('Email could not be sent', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Reset token sent to email',
    resetURL,
  });
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
  const { resetToken } = req.params;
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const user = await Account.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: Date.now() },
  });
  if (!user) {
    const err = new CustomError('Token is invalid or has expired', 400);
    return next(err);
  }
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword) {
    const err = new CustomError('Please provide password', 400);
    return next(err);
  }
  if (password !== confirmPassword) {
    const err = new CustomError('Password does not match', 400);
    return next(err);
  }
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  user.password = password;
  user.passwordChangedAt = Date.now();
  await user.save();
  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully',
  });
});

exports.changePassword = asyncErrorHandler(async (req, res, next) => {
  const user = await Account.findById(req.account_id).select('+password');
  if (!user)
    return next(new CustomError('Please login to change password', 401));
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword) {
    const err = new CustomError('Please provide current password', 400);
    return next(err);
  }
  if (!newPassword) {
    const err = new CustomError('Please provide new password', 400);
    return next(err);
  }
  if (!confirmPassword) {
    const err = new CustomError('Please confirm new password', 400);
    return next(err);
  }
  if (newPassword !== confirmPassword) {
    const err = new CustomError('Password does not match', 400);
    return next(err);
  }
  // const user = await Account.findById(req.user.id).select('+password');
  if (!(await user.comparePassword(currentPassword, user.password))) {
    const err = new CustomError('Incorrect password', 401);
    return next(err);
  }
  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();
  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
});

exports.logoutAllDevices = asyncErrorHandler(async (req, res, next) => {
  const currentToken = req?.cookies?.jwt; // i am not sure authorization or cookie when i use frontend

  await Token.deleteMany({
    account_id: req.account_id,
    token: { $ne: currentToken },
  });

  res.status(200).json({ message: 'Logged out from all devices.' });
});
