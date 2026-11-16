const crypto = require('crypto');
const Hospital = require('../models/Hospital');
const MediCard = require('../models/MediCard');
const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');

// Helper to generate hospital code if not provided
const generateHospitalCode = async () => {
  let unique = false;
  let code = '';
  while (!unique) {
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    code = `HOSP-${randomHex}`;
    const exists = await Hospital.findOne({ code });
    if (!exists) unique = true;
  }
  return code;
};

// @desc    Register a new hospital
// @route   POST /api/hospitals
// @access  Private
const createHospital = async (req, res) => {
  try {
    const { name, code, city, address, phone, email } = req.body;

    if (!name || !city || !phone) {
      return res.status(400).json({ message: 'Hospital name, city, and phone are required' });
    }

    const existingName = await Hospital.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existingName) {
      return res.status(400).json({ message: 'A hospital with this name is already registered' });
    }

    const hospitalCode = (code && code.trim()) ? code.trim().toUpperCase() : await generateHospitalCode();
    const existingCode = await Hospital.findOne({ code: hospitalCode });
    if (existingCode) {
      return res.status(400).json({ message: 'Hospital code already exists' });
    }

    const newHospital = await Hospital.create({
      name: name.trim(),
      code: hospitalCode,
      city: city.trim(),
      address: address ? address.trim() : '',
      phone: phone.trim(),
      email: email ? email.trim() : '',
      status: 'Active',
    });

    try {
      await AuditLog.create({
        action: 'HOSPITAL_CREATED',
        actor: req.admin?.email || 'admin@medy.com',
        role: 'Super Administrator',
        target: `${newHospital.name} (${newHospital.code})`,
        details: `Registered partner hospital in ${newHospital.city} with status Active`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    res.status(201).json(newHospital);
  } catch (error) {
    console.error('Create Hospital Error:', error);
    res.status(500).json({ message: error.message || 'Failed to create hospital' });
  }
};

// @desc    Get all registered hospitals with issued card counts and pending applications
// @route   GET /api/hospitals
// @access  Private
const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 }).lean();

    // Aggregate cards count per hospital
    const cardCounts = await MediCard.aggregate([
      {
        $group: {
          _id: { $toLower: { $ifNull: ['$hospitalName', ''] } },
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    cardCounts.forEach((c) => {
      if (c._id) {
        countMap[c._id.trim()] = c.count;
      }
    });

    // Aggregate total patients count per hospital
    const patientCounts = await Patient.aggregate([
      {
        $group: {
          _id: { $toLower: { $ifNull: ['$hospitalName', ''] } },
          count: { $sum: 1 },
        },
      },
    ]);

    const patientMap = {};
    patientCounts.forEach((c) => {
      if (c._id) {
        patientMap[c._id.trim()] = c.count;
      }
    });

    // Aggregate pending patient applications count per hospital (only actual pending applications without active card)
    const pendingCounts = await Patient.aggregate([
      {
        $match: {
          applicationStatus: 'Pending',
          hasMedyCard: { $ne: true },
          cardId: { $in: [null, ''] },
        },
      },
      {
        $group: {
          _id: { $toLower: { $ifNull: ['$hospitalName', ''] } },
          count: { $sum: 1 },
        },
      },
    ]);

    const pendingMap = {};
    pendingCounts.forEach((c) => {
      if (c._id) {
        pendingMap[c._id.trim()] = c.count;
      }
    });

    const hospitalsWithCount = hospitals.map((h) => {
      const nameKey = (h.name || '').toLowerCase().trim();
      return {
        ...h,
        totalPatientsCount: patientMap[nameKey] || 0,
        cardsIssuedCount: countMap[nameKey] || 0,
        pendingApplicationsCount: pendingMap[nameKey] || 0,
      };
    });

    res.json(hospitalsWithCount);
  } catch (error) {
    console.error('Get Hospitals Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch hospitals' });
  }
};

// @desc    Get active hospitals for public application form
// @route   GET /api/hospitals/public
// @access  Public
const getPublicHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ status: 'Active' })
      .select('name city code address phone')
      .sort({ name: 1 })
      .lean();
    res.json(hospitals);
  } catch (error) {
    console.error('Get Public Hospitals Error:', error);
    res.status(500).json({ message: 'Failed to fetch network hospitals' });
  }
};

// @desc    Update hospital's distinct card color
// @route   PATCH /api/hospitals/:id/card-color
// @access  Private (Admin)
const updateHospitalCardColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { cardColor } = req.body;

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.cardColor = cardColor || '';
    await hospital.save();

    // Also update existing cards for this hospital
    if (cardColor) {
      await MediCard.updateMany(
        { hospitalName: hospital.name },
        { $set: { cardColor } }
      );
    }

    res.json(hospital);
  } catch (error) {
    console.error('Update Hospital Card Color Error:', error);
    res.status(500).json({ message: error.message || 'Failed to update card color' });
  }
};

// @desc    Update hospital details
// @route   PUT /api/hospitals/:id
// @access  Private (Super Admin)
const updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, address, phone, email, code, status } = req.body;

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const oldName = hospital.name;

    if (name && name.trim()) hospital.name = name.trim();
    if (city && city.trim()) hospital.city = city.trim();
    if (address !== undefined) hospital.address = address.trim();
    if (phone && phone.trim()) hospital.phone = phone.trim();
    if (email !== undefined) hospital.email = email.trim();
    if (code && code.trim()) hospital.code = code.trim().toUpperCase();
    if (status && ['Active', 'Inactive'].includes(status)) hospital.status = status;

    await hospital.save();

    // If hospital name changed, cascade update to patients and cards
    if (name && name.trim() !== oldName) {
      await Patient.updateMany(
        { hospitalName: oldName },
        { $set: { hospitalName: hospital.name } }
      );
      await MediCard.updateMany(
        { hospitalName: oldName },
        { $set: { hospitalName: hospital.name } }
      );
    }

    try {
      await AuditLog.create({
        action: 'HOSPITAL_UPDATED',
        actor: req.admin?.email || 'admin@medy.com',
        role: 'Super Administrator',
        target: `${hospital.name} (${hospital.code})`,
        details: `Updated facility parameters in ${hospital.city}`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    res.json({
      message: `Hospital ${hospital.name} updated successfully`,
      hospital,
    });
  } catch (error) {
    console.error('Update Hospital Error:', error);
    res.status(500).json({ message: error.message || 'Failed to update hospital' });
  }
};

// @desc    Activate or deactivate a hospital
// @route   PATCH /api/hospitals/:id/status
// @access  Private (Super Admin)
const toggleHospitalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const newStatus = status || (hospital.status === 'Active' ? 'Inactive' : 'Active');
    hospital.status = newStatus;
    await hospital.save();

    try {
      await AuditLog.create({
        action: 'HOSPITAL_STATUS_CHANGED',
        actor: req.admin?.email || 'admin@medy.com',
        role: 'Super Administrator',
        target: `${hospital.name} (${hospital.code})`,
        details: `Hospital status set to ${newStatus}`,
        ipAddress: req.ip || '127.0.0.1',
        status: newStatus === 'Active' ? 'Success' : 'Warning',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    res.json({
      message: `Hospital ${hospital.name} is now ${newStatus}`,
      hospital,
    });
  } catch (error) {
    console.error('Toggle Hospital Status Error:', error);
    res.status(500).json({ message: error.message || 'Failed to toggle hospital status' });
  }
};

// @desc    Get single hospital by ID
// @route   GET /api/hospitals/:id
// @access  Private (Super Admin)
const getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findById(id).lean();
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const nameKey = new RegExp(`^${hospital.name.trim()}$`, 'i');
    const [patientCount, cardsCount] = await Promise.all([
      Patient.countDocuments({ hospitalName: nameKey }),
      MediCard.countDocuments({ hospitalName: nameKey }),
    ]);

    res.json({
      ...hospital,
      totalPatientsCount: patientCount,
      cardsIssuedCount: cardsCount,
    });
  } catch (error) {
    console.error('Get Hospital Details Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch hospital details' });
  }
};

// @desc    Delete a hospital facility
// @route   DELETE /api/hospitals/:id
// @access  Private (Super Admin)
const deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const hospitalName = hospital.name;
    const hospitalCode = hospital.code;

    // Check if there are active patients or cards assigned
    const nameRegex = new RegExp(`^${hospitalName.trim()}$`, 'i');
    const [patientCount, cardCount] = await Promise.all([
      Patient.countDocuments({ hospitalName: nameRegex }),
      MediCard.countDocuments({ hospitalName: nameRegex }),
    ]);

    // Safety guard: if ?force=true is NOT specified and there are associated records
    if ((patientCount > 0 || cardCount > 0) && req.query.force !== 'true') {
      return res.status(400).json({
        message: `Facility "${hospitalName}" has ${patientCount} registered patient(s) and ${cardCount} issued Medy card(s). Deactivate the facility instead, or confirm force delete.`,
        patientCount,
        cardCount,
        canForceDelete: true,
      });
    }

    // Delete hospital
    await Hospital.findByIdAndDelete(id);

    try {
      await AuditLog.create({
        action: 'HOSPITAL_DELETED',
        actor: req.admin?.email || 'admin@medy.com',
        role: 'Super Administrator',
        target: `${hospitalName} (${hospitalCode})`,
        details: `Deleted partner hospital from network directory (Associated: ${patientCount} patients, ${cardCount} cards)`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Warning',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    res.json({
      message: `Hospital "${hospitalName}" was successfully deleted`,
      deletedId: id,
    });
  } catch (error) {
    console.error('Delete Hospital Error:', error);
    res.status(500).json({ message: error.message || 'Failed to delete hospital' });
  }
};

module.exports = {
  createHospital,
  getHospitals,
  getHospitalById,
  getPublicHospitals,
  updateHospitalCardColor,
  updateHospital,
  toggleHospitalStatus,
  deleteHospital,
};

