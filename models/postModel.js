const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required for a post'],
    },
    caption: String,
    image: [String],
    privacy: {
      type: String,
      enum: ['public', 'private', 'friends'],
      default: 'public',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Like',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
