const mongoose = require('mongoose');

const labCatalogTestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Test name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Test code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    sampleType: {
      type: String,
      required: [true, 'Specimen / Sample type is required'],
      trim: true,
      default: 'Blood',
    },
    fastingRequired: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
      default: 500,
    },
    turnaround: {
      type: String,
      default: '12-24 Hours',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    isCustom: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LabCatalogTest', labCatalogTestSchema);

