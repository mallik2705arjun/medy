const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      default: 'MEDY-ADM-001',
    },
    fullName: {
      type: String,
      default: 'Super Administrator',
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'MEDY_ADMIN',
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    status: {
      type: String,
      default: 'Active',
      enum: ['Active', 'Inactive'],
    },
    avatar: {
      type: String,
      default: '',
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
    },
    hospitalName: {
      type: String,
      default: 'Medy Healthcare Central Network',
    },
    hospitalCode: {
      type: String,
      default: '',
      trim: true,
    },
    designation: {
      type: String,
      default: 'Administrator',
      trim: true,
    },
    dateJoined: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Admin', adminSchema);
