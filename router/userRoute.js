const router = require('express').Router();
const { verifyJWT } = require('../middleware/verifyJWT');
const {
  updateProfile,
  getProfile,
  followUser,
  unfollowUser,
} = require('../controllers/userController');

router.route('/updateprofile').put(verifyJWT, updateProfile);
router.route('/getprofile/:username').get(verifyJWT, getProfile);
router.route('/follow/:username').put(verifyJWT, followUser);
router.route('/unfollow/:username').put(verifyJWT, unfollowUser);
module.exports = router;
