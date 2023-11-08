const CustomError = require('../utils/CustomError');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const Profile = require('../models/profileModel');
const Post = require('../models/postModel');
const mongoose = require('mongoose');

exports.createPost = asyncErrorHandler(async (req, res, next) => {
  const { caption, image, privacy } = req.body;

  const profile = await Profile.findOne({ account_id: req.account_id });
  const account_id = new mongoose.Types.ObjectId(req.account_id);
  if (!profile) {
    return next(new CustomError('Profile not found', 404));
  }
  if (!caption && !image) {
    return next(new CustomError('Caption or image is required', 400));
  }
  const newPost = new Post({
    account_id,
    caption,
    image,
    privacy,
  });

  const savedPost = await newPost.save();

  if (!savedPost) {
    return res.status(400).json({
      success: false,
      message: 'Post could not be created',
    });
  }
  profile.posts.push(savedPost._id);
  await profile.save();
  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: savedPost,
  });
});

exports.getPost = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);

  if (!post) {
    return next(new CustomError('Post not found', 404));
  }

  const postAccountId = post.account_id ? post.account_id.toString() : null;

  if (post.privacy === 'private' && postAccountId !== req.account_id) {
    return next(new CustomError('You cannot access this private post', 401));
  }

  if (post.privacy === 'friends' && postAccountId !== req.account_id) {
    const [postOwnerProfile, requestUserProfile] = await Promise.all([
      Profile.findOne({ account_id: post.account_id }).select(
        'followers following'
      ),
      Profile.findOne({ account_id: req.account_id }).select(
        'followers following'
      ),
    ]);

    // Check if the current user is a friend of the post owner
    const isFriend =
      postOwnerProfile &&
      requestUserProfile &&
      postOwnerProfile.following.map(String).includes(requestUserProfile.id) &&
      requestUserProfile.following.map(String).includes(postOwnerProfile.id);

    if (!isFriend) {
      return next(new CustomError('You cannot access this post', 401));
    }
  }

  res.status(200).json({
    success: true,
    message: 'Post found',
    data: post,
  });
});

exports.updatePost = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const { caption, image, privacy } = req.body;
  const post = await Post.findById(id);

  if (!post) {
    return next(new CustomError('Post not found', 404));
  }

  // Check if the user has permission to update the post
  if (post.account_id.toString() !== req.account_id) {
    return next(
      new CustomError('You are not authorized to update this post', 403)
    );
  }

  // Update the post properties if provided in the request body
  if (caption) post.caption = caption;
  if (image) post.image = image;
  if (privacy) post.privacy = privacy;

  const updatedPost = await post.save();

  res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    data: updatedPost,
  });
});

exports.deletePost = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    return next(new CustomError('Post not found', 404));
  }

  // Check if the user has permission to delete the post
  if (post.account_id.toString() !== req.account_id) {
    return next(
      new CustomError('You are not authorized to delete this post', 403)
    );
  }

  // Delete the post
  await post.deleteOne();

  // Remove the post reference from the user's profile
  const profile = await Profile.findOne({ account_id: req.account_id });
  if (profile) {
    profile.posts.pull(post._id);
    await profile.save();
  }

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
    data: post,
  });
});
