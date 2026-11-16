const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['CREATED', 'ACTIVATED', 'DEACTIVATED', 'BLOCKED', 'ASSIGNED'],
    },
    performedBy: {
      type: String,
      default: 'Admin',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const mediCardSchema = new mongoose.Schema(
  {
    cardId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    serialNumber: {
      type: Number,
      required: true,
      default: 1,
      index: true,
    },
    hospitalName: {
      type: String,
      required: true,
      index: true,
    },
    hospitalCode: {
      type: String,
      uppercase: true,
      trim: true,
      default: '',
      index: true,
    },
    patientName: {
      type: String,
      default: 'Unassigned',
      trim: true,
    },
    patientAge: {
      type: Number,
      default: 0,
    },
    patientGender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Unassigned'],
      default: 'Unassigned',
    },
    patientPhone: {
      type: String,
      trim: true,
      default: '',
    },
    patientEmail: {
      type: String,
      trim: true,
      default: '',
    },
    isAssigned: {
      type: Boolean,
      default: false,
      index: true,
    },
    insurancePlan: {
      type: String,
      required: true,
      enum: ['Standard', 'Silver', 'Gold', 'Platinum'],
      default: 'Standard',
    },
    coverageAmount: {
      type: Number,
      required: true,
      default: 500000,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Blocked'],
      default: 'Active',
      index: true,
    },
    cardColor: {
      type: String,
      default: '',
    },
    blockReason: {
      type: String,
      default: '',
    },
    history: [historySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MediCard', mediCardSchema);
