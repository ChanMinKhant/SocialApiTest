const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Account is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      minLength: 3,
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    semester: {
      type: Number,
      enum: [1, 2],
      required: [true, 'Semester is required'],
    },
    year: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      require: [true, 'year is required'],
    },
    major: {
      type: String,
      enum: ['CS', 'CT'],
    },
    section: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      // required: [true, 'Section is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'Other',
    },
    bio: {
      type: String,
      maxLength: 160,
    },
    avatar: {
      type: String,
      default: '',
    },
    coverPhtoto: {
      type: String,
      default: '',
    },
    birthday: {
      type: Date,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    role: {
      type: String,
      enum: ['student', 'teacher'],
      default: 'student',
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
