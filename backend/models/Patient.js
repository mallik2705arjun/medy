const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other'],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    hospitalName: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    hasMedyCard: {
      type: Boolean,
      default: false,
    },
    cardId: {
      type: String,
      default: null,
    },
    appliedForCard: {
      type: Boolean,
      default: false,
    },
    applicationStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Registered', null],
      default: null,
      index: true,
    },
    requestedPlan: {
      type: String,
      enum: ['Silver', 'Gold', 'Platinum', 'Standard'],
      default: 'Silver',
    },
    requestedCoverage: {
      type: Number,
      default: 500000,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    biomarkers: {
      bloodPressure: {
        systolic: { type: Number, default: 120 },
        diastolic: { type: Number, default: 80 },
      },
      heartRate: { type: Number, default: 72 },
      bloodSugar: { type: Number, default: 95 },
      spo2: { type: Number, default: 98 },
      temperature: { type: Number, default: 98.6 },
      bmi: { type: Number, default: 22.5 },
      cholesterol: { type: Number, default: 180 },
      hemoglobin: { type: Number, default: 14.5 },
      healthStatus: {
        type: String,
        enum: ['Normal', 'Borderline', 'Elevated', 'Critical'],
        default: 'Normal',
        index: true,
      },
      lastChecked: { type: Date, default: Date.now },
      notes: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// Index to prevent duplicate patient registration with same phone at the same hospital
patientSchema.index({ hospitalName: 1, phone: 1 });

module.exports = mongoose.model('Patient', patientSchema);

