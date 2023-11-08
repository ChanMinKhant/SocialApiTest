const router = require('express').Router();
const { verifyJWT } = require('../middleware/verifyJWT');
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  logoutAllDevices,
  verifyEmail,
} = require('../controllers/authController');

router.route('/register').post(register);

router.route('/verifyemail/:token').get(verifyEmail);

router.route('/login').post(login);

router.route('/logout').get(verifyJWT, logout);

router.route('/forgotpassword').post(forgotPassword);

router.route('/resetpassword/:resetToken').patch(resetPassword);

router.route('/changepassword').patch(verifyJWT, changePassword);

router.route('/logoutalldevices').get(verifyJWT, logoutAllDevices);
module.exports = router;
