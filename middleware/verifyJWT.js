const jwt = require('jsonwebtoken');
const CustomError = require('../utils/CustomError');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const Account = require('../models/accountModel');
const Token = require('../models/tokenModel');

exports.verifyJWT = asyncErrorHandler(async (req, res, next) => {
  const token = req?.cookies?.jwt; // cookies.jwt // iam not sure cookie or authrization
  if (!token) {
    const err = new CustomError('Authentication failed', 401);
    return next(err);
  }

  //
  // const token = cookie?.split(' ')[1];
  // if (!token) {
  //   const err = new CustomError('Authentication failed2', 401);
  //   return next(err);
  // }
  // seaarch token in db
  const foundToken = await Token.findOne({ token });
  if (!foundToken) {
    res.clearCookie('jwt');
    const msg = 'Your session has expired. Please log in again.';
    const err = new CustomError(msg, 401);
    return next(err);
  }

  // verify token
  jwt.verify(token, process.env.TOKEN_SECRET, (err, decodedToken) => {
    if (err || decodedToken.id !== foundToken.account_id.toString()) {
      const err = new CustomError('Authentication failed', 401);
      return next(err);
    }
    req.account_id = decodedToken.id;
    console.log('exe');
    next();
  });
});
