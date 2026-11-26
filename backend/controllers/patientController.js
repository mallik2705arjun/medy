const Patient = require('../models/Patient');
const Hospital = require('../models/Hospital');
const MediCard = require('../models/MediCard');
const AuditLog = require('../models/AuditLog');

// Helper to match phone numbers flexibly (handles +91, spaces, dashes, country codes)
const getPhoneQuery = (phoneStr) => {
  if (!phoneStr) return {};
  const trimmed = phoneStr.trim();
  const digits = trimmed.replace(/\D/g, '');
  const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
  if (!last10) return { phone: trimmed };

  // Allows flexible spacing/dashes between digits
  const flexibleRegex = new RegExp(last10.split('').join('[\\s-]*') + '$');

  return {
    $or: [
      { phone: trimmed },
      { phone: flexibleRegex },
      { phone: `+91 ${last10}` },
      { phone: `+91${last10}` },
      { phone: last10 },
    ],
  };
};

// @desc    Apply for a Medy Card (Public - only registered hospital patients can apply)
// @route   POST /api/patients/apply
// @access  Public
const applyForCard = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      phone,
      email,
      hospitalName,
      requestedPlan,
      requestedCoverage,
      address,
    } = req.body;

    if (!phone || !hospitalName) {
      return res.status(400).json({
        message: 'Phone number and hospital name are required.',
      });
    }

    // Verify hospital exists or normalize name
    const hospital = await Hospital.findOne({
      name: new RegExp(`^${hospitalName.trim()}$`, 'i'),
    });
    const finalHospitalName = hospital ? hospital.name : hospitalName.trim();

    // Check if patient is already registered at this hospital using flexible phone matching
    const phoneFilter = getPhoneQuery(phone);
    let existing = await Patient.findOne({
      hospitalName: new RegExp(`^${finalHospitalName}$`, 'i'),
      ...phoneFilter,
    });

    // STRICT RULE: Only patients who have registered in the hospital can apply for a Medy Card
    if (!existing) {
      return res.status(403).json({
        message: `You are not registered as a patient at ${finalHospitalName}. Only patients who have registered in the hospital can apply for a Medy Card. Please contact or visit ${finalHospitalName} to register first.`,
        notRegistered: true,
      });
    }

    // If patient already has an active Medy card
    if (existing.hasMedyCard && existing.cardId) {
      return res.status(400).json({
        message: `An active Medy Card (${existing.cardId}) is already issued for this registered patient at ${finalHospitalName}.`,
        cardId: existing.cardId,
        alreadyHasCard: true,
      });
    }

    // If patient already has a pending application
    if (existing.applicationStatus === 'Pending') {
      return res.status(200).json({
        message: `Your Medy Card application is already received and is pending approval by ${finalHospitalName}.`,
        patient: existing,
        alreadyPending: true,
      });
    }

    // Update the registered patient's record with application details
    if (name && name.trim()) existing.name = name.trim();
    if (age) existing.age = Number(age);
    if (gender) existing.gender = gender;
    if (email && email.trim()) existing.email = email.trim();
    if (address && address.trim()) existing.address = address.trim();

    existing.requestedPlan = requestedPlan || existing.requestedPlan || 'Silver';
    existing.requestedCoverage = requestedCoverage
      ? Number(requestedCoverage)
      : existing.requestedCoverage || 500000;
    existing.appliedForCard = true;
    existing.applicationStatus = 'Pending';
    existing.appliedAt = new Date();
    existing.rejectionReason = '';
    await existing.save();

    try {
      await AuditLog.create({
        action: 'PATIENT_CARD_APPLICATION',
        actor: existing.phone || 'patient_portal',
        role: 'Patient Applicant',
        target: `${existing.name} (${finalHospitalName})`,
        details: `Submitted application for Medy Card (${existing.requestedPlan || 'Silver'} Plan, ₹${Number(existing.requestedCoverage || 500000).toLocaleString()})`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    return res.status(200).json({
      message: `Medy Card application successfully submitted for registered patient ${existing.name}! ${finalHospitalName} will review and issue your card.`,
      patient: existing,
    });
  } catch (error) {
    console.error('Apply For Card Error:', error);
    res.status(500).json({ message: error.message || 'Failed to submit application.' });
  }
};

// @desc    Verify if a patient is registered at a hospital (Public)
// @route   GET /api/patients/check-registered
// @access  Public
const checkRegisteredPatient = async (req, res) => {
  try {
    const { phone, hospitalName } = req.query;

    if (!phone || !hospitalName) {
      return res.status(400).json({ message: 'Phone number and hospital name are required.' });
    }

    const hospital = await Hospital.findOne({
      name: new RegExp(`^${hospitalName.trim()}$`, 'i'),
    });
    const finalHospitalName = hospital ? hospital.name : hospitalName.trim();

    const phoneFilter = getPhoneQuery(phone);
    const patient = await Patient.findOne({
      hospitalName: new RegExp(`^${finalHospitalName}$`, 'i'),
      ...phoneFilter,
    });

    if (!patient) {
      return res.json({
        registered: false,
        message: `No registration found for ${phone} at ${finalHospitalName}. Only patients registered at the hospital can apply for a Medy Card.`,
      });
    }

    return res.json({
      registered: true,
      patient: {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email || '',
        address: patient.address || '',
        hospitalName: patient.hospitalName,
        hasMedyCard: patient.hasMedyCard,
        cardId: patient.cardId,
        applicationStatus: patient.applicationStatus,
      },
      message: `Verified: Patient ${patient.name} is officially registered at ${finalHospitalName}.`,
    });
  } catch (error) {
    console.error('Check Registered Patient Error:', error);
    res.status(500).json({ message: 'Failed to verify patient registration.' });
  }
};

// @desc    Register a new patient at a specific hospital (Admin)
// @route   POST /api/patients
// @access  Private
const registerPatient = async (req, res) => {
  try {
    const { name, age, gender, phone, email, hospitalName, address, requestedPlan, requestedCoverage, appliedForCard: wantsApply } = req.body;

    if (!name || !age || !gender || !phone || !hospitalName) {
      return res.status(400).json({
        message: 'Patient name, age, gender, phone, and hospital name are required',
      });
    }

    // Verify hospital exists
    const hospital = await Hospital.findOne({
      name: new RegExp(`^${hospitalName.trim()}$`, 'i'),
    });
    const finalHospitalName = hospital ? hospital.name : hospitalName.trim();

    // Check if patient already registered at this hospital using flexible phone matching
    const phoneFilter = getPhoneQuery(phone);
    let patient = await Patient.findOne({
      hospitalName: new RegExp(`^${finalHospitalName}$`, 'i'),
      ...phoneFilter,
    });

    if (patient) {
      return res.status(400).json({
        message: `Patient with phone ${phone.trim()} is already registered at ${finalHospitalName}.`,
        patient,
      });
    }

    const shouldApply = Boolean(wantsApply);

    patient = await Patient.create({
      name: name.trim(),
      age: Number(age),
      gender,
      phone: phone.trim(),
      email: email ? email.trim() : '',
      address: address ? address.trim() : '',
      hospitalName: finalHospitalName,
      requestedPlan: requestedPlan || 'Silver',
      requestedCoverage: requestedCoverage ? Number(requestedCoverage) : 500000,
      appliedForCard: shouldApply,
      applicationStatus: shouldApply ? 'Pending' : undefined,
      appliedAt: shouldApply ? new Date() : undefined,
    });

    try {
      await AuditLog.create({
        action: 'PATIENT_REGISTERED',
        actor: req.admin?.email || 'admin@medy.com',
        role: 'Super Administrator',
        target: `${patient.name} (${finalHospitalName})`,
        details: `Registered new patient with plan ${patient.requestedPlan || 'Silver'}${shouldApply ? ' and initiated Medy Card application' : ''}`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    res.status(201).json({
      patient,
      message: `Patient registered successfully at ${finalHospitalName}.${shouldApply ? ' Medy Card application has also been submitted.' : ''}`,
    });
  } catch (error) {
    console.error('Register Patient Error:', error);
    res.status(500).json({ message: error.message || 'Failed to register patient' });
  }
};

// @desc    Get patients (filterable by hospital and applicationStatus)
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res) => {
  try {
    const { hospital, status, appliedOnly, q } = req.query;
    const filter = {};

    if (hospital && hospital !== 'All') {
      filter.hospitalName = new RegExp(`^${hospital.trim()}$`, 'i');
    }

    if (status && status !== 'All') {
      if (status === 'Pending') {
        filter.applicationStatus = 'Pending';
        // Once card is issued, applicant is NO LONGER pending
        filter.hasMedyCard = { $ne: true };
        filter.cardId = { $in: [null, ''] };
      } else if (status === 'Approved') {
        filter.$or = [
          { applicationStatus: 'Approved' },
          { hasMedyCard: true },
          { cardId: { $ne: null, $nin: [''] } },
        ];
      } else {
        filter.applicationStatus = status.trim();
      }
    }

    if (appliedOnly === 'true') {
      filter.appliedForCard = true;
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { cardId: searchRegex },
      ];
    }

    const patients = await Patient.find(filter).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error('Get Patients Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch patients' });
  }
};

// @desc    Reject a patient application
// @route   PATCH /api/patients/:id/reject
// @access  Private
const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient application not found' });
    }

    patient.applicationStatus = 'Rejected';
    patient.rejectionReason = reason ? reason.trim() : 'Hospital declined the application';
    await patient.save();

    try {
      await AuditLog.create({
        action: 'PATIENT_APPLICATION_REJECTED',
        actor: req.admin?.email || 'admin@medy.com',
        role: req.admin?.role === 'HOSPITAL_ADMIN' ? 'Hospital Administrator' : 'Super Administrator',
        target: `${patient.name} (${patient.hospitalName})`,
        details: `Medy Card application rejected. Reason: ${patient.rejectionReason}`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Warning',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    res.json({
      message: 'Application rejected',
      patient,
    });
  } catch (error) {
    console.error('Reject Application Error:', error);
    res.status(500).json({ message: error.message || 'Failed to reject application' });
  }
};

// @desc    Check application status by phone and hospital (Public)
// @route   GET /api/patients/status
// @access  Public
const checkApplicationStatus = async (req, res) => {
  try {
    const { phone, hospital } = req.query;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const phoneFilter = getPhoneQuery(phone);
    const filter = { ...phoneFilter };
    if (hospital && hospital !== 'All') {
      filter.hospitalName = new RegExp(`^${hospital.trim()}$`, 'i');
    }

    const patient = await Patient.findOne(filter).sort({ updatedAt: -1 });
    if (!patient) {
      return res.status(404).json({ message: 'No application found for this phone number' });
    }

    let cardDetails = null;
    if (patient.hasMedyCard && patient.cardId) {
      cardDetails = await MediCard.findOne({ cardId: patient.cardId });
    }

    res.json({
      patient,
      cardDetails,
    });
  } catch (error) {
    console.error('Check Status Error:', error);
    res.status(500).json({ message: error.message || 'Failed to check status' });
  }
};

// @desc    Calculate health status from vitals
const calculateHealthStatus = ({ systolic, diastolic, bloodSugar, spo2, bmi, heartRate }) => {
  const sys = Number(systolic) || 120;
  const dia = Number(diastolic) || 80;
  const sugar = Number(bloodSugar) || 95;
  const oxygen = Number(spo2) || 98;
  const b = Number(bmi) || 22;
  const hr = Number(heartRate) || 72;

  if (oxygen < 92 || sys >= 160 || dia >= 100 || sugar >= 200 || sugar < 60 || hr > 120 || hr < 45) {
    return 'Critical';
  }
  if (sys >= 135 || dia >= 88 || sugar >= 130 || oxygen < 95 || b >= 28 || hr > 100) {
    return 'Elevated';
  }
  if (sys >= 125 || dia >= 83 || sugar >= 105 || b >= 25) {
    return 'Borderline';
  }
  return 'Normal';
};

// @desc    Update patient biomarkers / vitals
// @route   PUT /api/patients/:id/biomarkers
// @access  Private (Admin/Doctor)
const updatePatientBiomarkers = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      systolic,
      diastolic,
      heartRate,
      bloodSugar,
      spo2,
      temperature,
      bmi,
      cholesterol,
      hemoglobin,
      notes,
      healthStatus: userProvidedStatus,
    } = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const calculatedStatus = calculateHealthStatus({
      systolic: systolic !== undefined ? systolic : patient.biomarkers?.bloodPressure?.systolic,
      diastolic: diastolic !== undefined ? diastolic : patient.biomarkers?.bloodPressure?.diastolic,
      bloodSugar: bloodSugar !== undefined ? bloodSugar : patient.biomarkers?.bloodSugar,
      spo2: spo2 !== undefined ? spo2 : patient.biomarkers?.spo2,
      bmi: bmi !== undefined ? bmi : patient.biomarkers?.bmi,
      heartRate: heartRate !== undefined ? heartRate : patient.biomarkers?.heartRate,
    });

    patient.biomarkers = {
      bloodPressure: {
        systolic: systolic !== undefined ? Number(systolic) : (patient.biomarkers?.bloodPressure?.systolic || 120),
        diastolic: diastolic !== undefined ? Number(diastolic) : (patient.biomarkers?.bloodPressure?.diastolic || 80),
      },
      heartRate: heartRate !== undefined ? Number(heartRate) : (patient.biomarkers?.heartRate || 72),
      bloodSugar: bloodSugar !== undefined ? Number(bloodSugar) : (patient.biomarkers?.bloodSugar || 95),
      spo2: spo2 !== undefined ? Number(spo2) : (patient.biomarkers?.spo2 || 98),
      temperature: temperature !== undefined ? Number(temperature) : (patient.biomarkers?.temperature || 98.6),
      bmi: bmi !== undefined ? Number(bmi) : (patient.biomarkers?.bmi || 22.5),
      cholesterol: cholesterol !== undefined ? Number(cholesterol) : (patient.biomarkers?.cholesterol || 180),
      hemoglobin: hemoglobin !== undefined ? Number(hemoglobin) : (patient.biomarkers?.hemoglobin || 14.5),
      healthStatus: userProvidedStatus || calculatedStatus,
      notes: notes !== undefined ? notes.trim() : (patient.biomarkers?.notes || ''),
      lastChecked: new Date(),
    };

    await patient.save();

    res.json({
      message: `Biomarkers updated successfully for ${patient.name}`,
      patient,
    });
  } catch (error) {
    console.error('Update Patient Biomarkers Error:', error);
    res.status(500).json({ message: error.message || 'Failed to update biomarkers' });
  }
};

// @desc    Get summary statistics of biomarkers
// @route   GET /api/patients/biomarkers/summary
// @access  Private (Admin)
const getBiomarkersSummary = async (req, res) => {
  try {
    const { hospital } = req.query;
    const filter = {};
    if (hospital && hospital !== 'All') {
      filter.hospitalName = new RegExp(`^${hospital.trim()}$`, 'i');
    }

    const totalPatients = await Patient.countDocuments(filter);
    const normalCount = await Patient.countDocuments({ ...filter, 'biomarkers.healthStatus': 'Normal' });
    const borderlineCount = await Patient.countDocuments({ ...filter, 'biomarkers.healthStatus': 'Borderline' });
    const elevatedCount = await Patient.countDocuments({ ...filter, 'biomarkers.healthStatus': 'Elevated' });
    const criticalCount = await Patient.countDocuments({ ...filter, 'biomarkers.healthStatus': 'Critical' });

    res.json({
      total: totalPatients,
      normal: normalCount,
      borderline: borderlineCount,
      elevated: elevatedCount,
      critical: criticalCount,
    });
  } catch (error) {
    console.error('Get Biomarkers Summary Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch biomarkers summary' });
  }
};

module.exports = {
  applyForCard,
  registerPatient,
  getPatients,
  rejectApplication,
  checkApplicationStatus,
  checkRegisteredPatient,
  updatePatientBiomarkers,
  getBiomarkersSummary,
};

