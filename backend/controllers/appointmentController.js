const crypto = require('crypto');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Hospital = require('../models/Hospital');

// Helper to generate appointment ID
const generateAppointmentId = async () => {
  let unique = false;
  let appointmentId = '';
  while (!unique) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    appointmentId = `APT-2026-${randomNum}`;
    const exists = await Appointment.findOne({ appointmentId });
    if (!exists) unique = true;
  }
  return appointmentId;
};

// @desc    Get all appointments (filterable by hospital, status, search query)
// @route   GET /api/appointments
// @access  Private (Admin)
const getAppointments = async (req, res) => {
  try {
    const { hospital, status, q, date } = req.query;
    const filter = {};

    if (hospital && hospital !== 'All') {
      filter.hospitalName = new RegExp(`^${hospital.trim()}$`, 'i');
    }

    if (status && status !== 'All') {
      filter.status = status.trim();
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { appointmentId: searchRegex },
        { patientName: searchRegex },
        { patientPhone: searchRegex },
        { patientEmail: searchRegex },
        { doctorName: searchRegex },
        { department: searchRegex },
        { hospitalName: searchRegex },
        { cardId: searchRegex },
      ];
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(filter).sort({ appointmentDate: -1, createdAt: -1 });

    // Aggregate summary stats (respecting hospital filter if chosen)
    const baseHospitalFilter = hospital && hospital !== 'All' ? { hospitalName: new RegExp(`^${hospital.trim()}$`, 'i') } : {};

    const totalCount = await Appointment.countDocuments(baseHospitalFilter);
    const confirmedCount = await Appointment.countDocuments({ ...baseHospitalFilter, status: 'Confirmed' });
    const completedCount = await Appointment.countDocuments({ ...baseHospitalFilter, status: 'Completed' });
    const cancelledCount = await Appointment.countDocuments({ ...baseHospitalFilter, status: 'Cancelled' });

    // Breakdown per hospital
    const hospitalAgg = await Appointment.aggregate([
      {
        $group: {
          _id: { $toLower: { $ifNull: ['$hospitalName', ''] } },
          total: { $sum: 1 },
          confirmed: {
            $sum: { $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
        },
      },
    ]);

    const hospitalBreakdown = {};
    hospitalAgg.forEach((h) => {
      if (h._id) {
        hospitalBreakdown[h._id.trim()] = {
          total: h.total,
          confirmed: h.confirmed,
          completed: h.completed,
        };
      }
    });

    res.json({
      appointments,
      stats: {
        total: totalCount,
        confirmed: confirmedCount,
        completed: completedCount,
        cancelled: cancelledCount,
      },
      hospitalBreakdown,
    });
  } catch (error) {
    console.error('Get Appointments Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch appointments' });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    console.error('Get Appointment Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch appointment' });
  }
};

// @desc    Create a new doctor appointment
// @route   POST /api/appointments
// @access  Private (Admin)
const createAppointment = async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      patientEmail,
      hospitalName,
      doctorName,
      department,
      appointmentDate,
      timeSlot,
      consultationType,
      symptoms,
      doctorFee,
      notes,
    } = req.body;

    if (!patientName || !patientPhone || !hospitalName || !doctorName || !department || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        message: 'Patient name, phone, hospital name, doctor name, department, date, and time slot are required',
      });
    }

    // Verify hospital exists or normalize name
    const hospital = await Hospital.findOne({
      name: new RegExp(`^${hospitalName.trim()}$`, 'i'),
    });
    const finalHospitalName = hospital ? hospital.name : hospitalName.trim();

    // Check if patient exists in system
    let existingPatient = null;
    if (patientId && mongoose.Types.ObjectId.isValid(patientId)) {
      existingPatient = await Patient.findById(patientId);
    }
    if (!existingPatient && patientPhone) {
      existingPatient = await Patient.findOne({
        phone: patientPhone.trim(),
        hospitalName: new RegExp(`^${finalHospitalName}$`, 'i'),
      });
    }

    const appointmentId = await generateAppointmentId();
    const tokenNumber = `T-${Math.floor(100 + Math.random() * 900)}`;

    const appointment = await Appointment.create({
      appointmentId,
      patient: existingPatient ? existingPatient._id : null,
      patientName: patientName.trim(),
      patientAge: Number(patientAge) || (existingPatient ? existingPatient.age : 30),
      patientGender: patientGender || (existingPatient ? existingPatient.gender : 'Male'),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail ? patientEmail.trim() : (existingPatient?.email || ''),
      cardId: existingPatient?.cardId || null,
      hospitalName: finalHospitalName,
      doctorName: doctorName.trim(),
      department: department.trim(),
      appointmentDate: new Date(appointmentDate),
      timeSlot: timeSlot.trim(),
      consultationType: consultationType || 'In-Person Consultation',
      status: 'Confirmed',
      symptoms: symptoms ? symptoms.trim() : 'General consultation',
      tokenNumber,
      doctorFee: Number(doctorFee) || 800,
      notes: notes ? notes.trim() : '',
    });

    res.status(201).json({
      message: `Doctor appointment booked successfully! Token: ${tokenNumber} (ID: ${appointmentId})`,
      appointment,
    });
  } catch (error) {
    console.error('Create Appointment Error:', error);
    res.status(500).json({ message: error.message || 'Failed to create appointment' });
  }
};

// @desc    Update appointment status (Confirmed -> Completed / Cancelled)
// @route   PATCH /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!['Confirmed', 'Completed', 'Cancelled', 'In-Progress'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    await appointment.save();

    res.json({
      message: `Appointment ${appointment.appointmentId} marked as ${status}`,
      appointment,
    });
  } catch (error) {
    console.error('Update Appointment Status Error:', error);
    res.status(500).json({ message: error.message || 'Failed to update status' });
  }
};

// @desc    Delete / Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await appointment.deleteOne();
    res.json({ message: `Appointment ${appointment.appointmentId} removed successfully` });
  } catch (error) {
    console.error('Delete Appointment Error:', error);
    res.status(500).json({ message: error.message || 'Failed to remove appointment' });
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
};

