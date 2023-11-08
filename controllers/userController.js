const Profile = require('../models/profileModel');
const Account = require('../models/accountModel');
const CustomError = require('../utils/CustomError');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

exports.updateProfile = asyncErrorHandler(async (req, res, next) => {
  const {
    name,
    username,
    semester,
    major,
    section,
    gender,
    bio,
    avatar,
    coverPhoto,
  } = req.body;
  // const {avatar, coverPhoto} = req.files;
  // const avatarPath = avatar[0].path;
  // const coverPhotoPath = coverPhoto[0].path;
  // const avatarFilename

  const currentProfile = await Profile.findOne({ account_id: req.account_id });
  if (!currentProfile) {
    await Profile.create({
      account_id: req.account_id,
      name,
      username,
      semester,
      major,
      section,
      gender,
      bio,
      avatar,
      coverPhoto,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Profile created successfully',
    });
  }

  for (let key in req.body) {
    if (req.body[key]) {
      currentProfile[key] = req.body[key];
    }
  }
  await currentProfile.save();
  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
  });
});

exports.getProfile = asyncErrorHandler(async (req, res, next) => {
  //i can add some user control setting here. eg., user can choose to show their profile to public or not
  // and show the followers or not
  const { username } = req.params;
  const profile = await Profile.findOne({ username }).populate(
    'account_id',
    'id'
  );
  if (!profile) {
    const error = new CustomError('Profile not found', 404);
    return next(error);
  }
  let isFollowing = false;
  const isOwnProfile = profile.account_id.id === req.account_id;
  if (!isOwnProfile) {
    //if not own profile, then check if the user is following the profile
    const userProfile = await Profile.findOne({ account_id: req.account_id });
    isFollowing = userProfile.following.includes(profile.id);
  }
  res.status(200).json({
    success: true,
    profile: {
      ...profile.toObject(),
      isOwnProfile,
      isFollowing,
    },
  });
});

// exports.getOwnProfile = asyncErrorHandler(async (req, res, next) => {
//   const profile = await Profile.findOne({ account_id: req.account_id });
//   if (!profile) {
//     const error = new CustomError('Profile not found', 404);
//     return next(error);
//   }
//   res.status(200).json({
//     success: true,
//     profile,
//     isOwnProfile: true,
//   });
// });

exports.followUser = asyncErrorHandler(async (req, res, next) => {
  const { username } = req.params;

  const profile = await Profile.findOne({ username });

  if (!profile) {
    const error = new CustomError('Profile not found', 404);
    return next(error);
  }

  const userAcc = await Profile.findOne({ account_id: req.account_id });

  if (!userAcc) {
    const error = new CustomError(
      'Your session has expired! Please login again',
      404
    );
    return next(error);
  }
  //cant follow yourself
  if (profile.account_id.toString() === userAcc.account_id.toString()) {
    const error = new CustomError('You cannot follow yourself', 400);
    return next(error);
  }

  if (userAcc.following.includes(profile.id)) {
    const error = new CustomError('Already following this user', 400);
    return next(error);
  }

  userAcc.following.push(profile._id);
  profile.followers.push(userAcc._id);

  await userAcc.save();
  await profile.save();

  res.status(200).json({
    success: true,
    message: `You are now following ${username}`,
  });
});

exports.unfollowUser = asyncErrorHandler(async (req, res, next) => {
  const { username } = req.params;
  const userAcc = await Profile.findOne({ account_id: req.account_id });
  const profile = await Profile.findOne({ username });

  if (!userAcc || !profile) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const followingIndex = userAcc.following.indexOf(profile._id);
  const followersIndex = profile.followers.indexOf(userAcc._id);

  if (followingIndex > -1) {
    userAcc.following.splice(followingIndex, 1);
  }

  if (followersIndex > -1) {
    profile.followers.splice(followersIndex, 1);
  }

  await userAcc.save();
  await profile.save();

  res.status(200).json({
    success: true,
    message: `You are no longer following ${username}`,
  });
});
