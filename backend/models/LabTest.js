const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    testBookingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientAge: {
      type: Number,
      required: true,
    },
    patientGender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other'],
    },
    patientPhone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    patientEmail: {
      type: String,
      trim: true,
      default: '',
    },
    cardId: {
      type: String,
      default: null,
    },
    hospitalName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    testName: {
      type: String,
      required: true,
      trim: true,
    },
    testCode: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: [
        'Hematology',
        'Biochemistry',
        'Endocrinology',
        'Pathology',
        'Microbiology',
        'Cardiology',
        'Renal Panel',
        'General Health',
      ],
      default: 'Biochemistry',
    },
    sampleType: {
      type: String,
      enum: ['Blood', 'Serum', 'Plasma', 'Urine', 'Nasal/Throat Swab', 'Stool', 'Tissue'],
      default: 'Blood',
    },
    collectionType: {
      type: String,
      enum: ['Hospital Lab Visit', 'Home Sample Collection'],
      default: 'Hospital Lab Visit',
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending Collection', 'Sample Collected', 'In-Analysis', 'Report Completed', 'Cancelled'],
      default: 'Pending Collection',
      index: true,
    },
    fastingRequired: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 500,
    },
    reportTurnaround: {
      type: String,
      default: '12-24 Hours',
    },
    reportUrl: {
      type: String,
      default: '',
    },
    reportFileName: {
      type: String,
      default: '',
    },
    reportUploadedAt: {
      type: Date,
      default: null,
    },
    resultSummary: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

labTestSchema.index({ hospitalName: 1, status: 1 });

const LabTest = mongoose.model('LabTest', labTestSchema);

module.exports = LabTest;
