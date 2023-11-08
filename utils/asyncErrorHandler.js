const asyncErrorHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch((err) => {
    next(err);
  });
};

// module.exports = (func) => {
//   return (req, res, next) => {
//     func(req, res, next).catch(next);
//   };
// };

module.exports = asyncErrorHandler;
