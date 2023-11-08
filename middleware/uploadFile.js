const multer = require('multer');
const customError = require('../utils/customError');
const path = require('path');
const fs = require('fs');
// uuidv4 = require('uuid').v4;

const storage = (customPath) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      const userFilePath = req.user?.filePath || 'allFiles';
      const dest = path.join(__dirname, 'uploads', customPath, userFilePath);
      if (!fs.existsSync(dest)) {
        //crate folder if doesnot exist
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      req.uniqueFilename = `${uuidv4()}${file.originalname.substring(
        file.originalname.lastIndexOf('.')
      )}`;
      cb(null, req.uniqueFilename);
    },
  });

const limits = (req) => {
  const nonPremiumMB = process.env.NON_PREMIUM_MB || 20;
  const premiumMB = process.env.PREMIUM_MB || 2048;
  const isPremiumUser = req.user?.isPremium || false;
  const fileSizeLimit = isPremiumUser ? premiumMB : nonPremiumMB;
  return { fileSize: fileSizeLimit * 1024 * 1024 };
};
const upload = (customPath) =>
  multer({
    storage: storage(customPath),
    fileFilter,
    limits,
  });

const errorChecker = (err, next) => {
  if (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const err = new customError('File size too large.', 400);
        next(err);
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        const err = new customError('Too many files to upload.', 400);
        next(err);
      } else {
        const err = new customError(
          'An error occurred during file upload.',
          500
        );
        next(err);
      }
    } else {
      const err = new customError('An error occurred during file upload.', 500);
      next(err);
    }
  }
};

exports.multiUpload = (customPath) => (req, res, next) => {
  upload(customPath).array('files', 12)(req, res, (err) => {
    errorChecker(err, next);
  });
  next();
};

exports.singleUpload = (customPath) => (req, res, next) => {
  upload(customPath).single('file')(req, res, (err) => {
    errorChecker(err, next);
  });
  next();
};
