const mongoose = require('mongoose');

const offeredTestSubSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabCatalogTest',
      default: null,
    },
    testName: {
      type: String,
      required: true,
      trim: true,
    },
    testCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    sampleType: {
      type: String,
      default: 'Blood',
      trim: true,
    },
    basePrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    labPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    turnaround: {
      type: String,
      default: '12-24 Hours',
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    fastingRequired: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const partneredLabSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Laboratory name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    labCode: {
      type: String,
      required: [true, 'Laboratory code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'License or Registration number is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Multi-Specialty Diagnostics',
        'Pathology & Biochemistry',
        'Microbiology & Serology',
        'Molecular Diagnostics',
        'Radiology & Imaging',
        'Genetics & Genomics',
      ],
      default: 'Multi-Specialty Diagnostics',
    },
    contactPerson: {
      name: { type: String, default: '', trim: true },
      designation: { type: String, default: '', trim: true },
      phone: { type: String, default: '', trim: true },
      email: { type: String, default: '', trim: true },
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      default: 'Maharashtra',
      trim: true,
    },
    pincode: {
      type: String,
      default: '',
      trim: true,
    },
    operatingHours: {
      type: String,
      default: '07:00 AM - 09:00 PM',
      trim: true,
    },
    accreditations: {
      type: [String],
      default: ['NABL Accredited'],
    },
    partnershipStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Suspended'],
      default: 'Pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      index: true,
    },
    // Array of network hospitals this lab is affiliated with (one lab to multiple hospitals)
    hospitals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
      },
    ],
    // Tests offered by this lab with custom pricing, turnaround and availability
    offeredTests: [offeredTestSubSchema],
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    commissionRate: {
      type: Number,
      default: 10, // 10% network partnership revenue share
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PartneredLab', partneredLabSchema);
