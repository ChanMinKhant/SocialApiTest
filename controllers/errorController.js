const CustomError = require('../utils/CustomError');

const devError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const prodError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR 💥');
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new CustomError(message, 400);
};

//change it later or use like this
// const value = err.keyValue.name;
// const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]; //regular expression

// const handleDuplicateFieldsDB = (err) => {
//   const message = `Duplicate field value: ${}. Please use another value!`; // generate pyan lote ya mal
//   return new CustomError(message, 400);
// };
const handleDuplicateFieldsDB = (err) => {
  const duplicateValue = Object.values(err.keyValue)[0];
  const message = `${duplicateValue} is already exist. Please use another value!`;
  return new CustomError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message); //Object.values() return array of values
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new CustomError(message, 400);
};

const handleJWTError = () =>
  new CustomError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new CustomError('Something went! Please log in again.', 401);

// const handleCustomError = (err) => err; // You might not need a separate handler

module.exports = (err, req, res, next) => {
  const environment = process.env.NODE_ENV || 'development';
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // // res.status(err.statusCode).json({
  //   error: err.name,
  // });

  if (environment === 'development') {
    // console.log('error is here', err);
    devError(err, res);
  } else if (environment === 'production') {
    let error;
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();
    // if (error.name === 'CustomError') err = handleCustomError(error);
    prodError(err, res);
  }
};
