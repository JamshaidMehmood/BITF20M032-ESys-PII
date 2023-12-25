// FormDataModel.js
const mongoose = require('mongoose');

const interest = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  rollNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  interest: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// for the activity indicator
const activity = new mongoose.Schema({
  activityType: {
    type: String,
    required: true,
  },
  visitedAt : {
    type: Date,
    default: Date.now,
  }
});

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);
const stdInterest = mongoose.model('stdInterest', interest);
const stdActivity = mongoose.model('stdActivity', activity);

module.exports = {
  stdInterest,
  stdActivity,
  User,
};
