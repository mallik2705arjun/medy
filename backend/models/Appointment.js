const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
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
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    consultationType: {
      type: String,
      enum: ['In-Person Consultation', 'Teleconsultation', 'Emergency / Urgent', 'Follow-up'],
      default: 'In-Person Consultation',
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Completed', 'Cancelled', 'In-Progress'],
      default: 'Confirmed',
      index: true,
    },
    symptoms: {
      type: String,
      default: 'General health consultation',
      trim: true,
    },
    tokenNumber: {
      type: String,
      default: '',
    },
    doctorFee: {
      type: Number,
      default: 800,
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

module.exports = mongoose.model('Appointment', appointmentSchema);

