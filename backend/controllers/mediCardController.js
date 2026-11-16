const crypto = require('crypto');
const MediCard = require('../models/MediCard');
const Patient = require('../models/Patient');
const Hospital = require('../models/Hospital');
const AuditLog = require('../models/AuditLog');

// Helper to match phone numbers flexibly (handles +91, spaces, dashes, country codes)
const getPhoneQuery = (phoneStr) => {
  if (!phoneStr) return {};
  const trimmed = phoneStr.trim();
  const digits = trimmed.replace(/\D/g, '');
  const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
  if (!last10) return { phone: trimmed };

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

// Helper to get clean hospital code and next serial number for that hospital
const getHospitalCodeAndNextSerial = async (hospitalName) => {
  const hosp = await Hospital.findOne({
    name: new RegExp('^' + hospitalName.trim() + '$', 'i'),
  });

  let rawCode = hosp?.code ? hosp.code.trim().toUpperCase() : '';
  if (rawCode.startsWith('HOSP-')) {
    rawCode = rawCode.replace('HOSP-', '');
  }
  let cleanCode = rawCode.replace(/[^A-Z0-9]/g, '');
  if (!cleanCode) {
    cleanCode = hospitalName
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 4) || 'MED';
  }

  // Find highest serial number for this hospital
  const lastCard = await MediCard.findOne({
    hospitalName: new RegExp('^' + hospitalName.trim() + '$', 'i'),
  }).sort({ serialNumber: -1 });

  let nextSerial = 1;
  if (lastCard && typeof lastCard.serialNumber === 'number' && !isNaN(lastCard.serialNumber)) {
    nextSerial = lastCard.serialNumber + 1;
  }

  return { cleanCode, nextSerial, hospital: hosp };
};

// Helper to generate a random unique Medy Card ID fallback: MEDY-XXXX-XXXX
const generateUniqueCardId = async () => {
  let unique = false;
  let cardId = '';

  while (!unique) {
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    cardId = `MEDY-${randomHex.substring(0, 4)}-${randomHex.substring(4, 8)}`;
    const existing = await MediCard.findOne({ cardId });
    if (!existing) {
      unique = true;
    }
  }

  return cardId;
};

// @desc    Issue a batch of limited Medi Cards with serial numbers to a specific hospital
// @route   POST /api/medicards/issue-to-hospital
// @access  Private (Admin)
const issueCardsToHospital = async (req, res) => {
  try {
    const {
      hospitalName,
      quantity,
      coverageAmount,
      validUntil,
      cardColor,
      note,
    } = req.body;

    if (!hospitalName || !hospitalName.trim()) {
      return res.status(400).json({ message: 'Hospital name is required' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1 card' });
    }
    if (qty > 500) {
      return res.status(400).json({ message: 'Maximum 500 cards can be issued in a single batch' });
    }

    const { cleanCode, nextSerial, hospital } = await getHospitalCodeAndNextSerial(hospitalName);
    const targetHospitalName = hospital ? hospital.name : hospitalName.trim();
    const finalCardColor = cardColor || hospital?.cardColor || '';

    if (cardColor && hospital && hospital.cardColor !== cardColor) {
      hospital.cardColor = cardColor;
      await hospital.save();
    }

    const coverage = coverageAmount ? Number(coverageAmount) : 500000;

    const validityDate = validUntil
      ? new Date(validUntil)
      : new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000);

    const cardsToInsert = [];
    for (let i = 0; i < qty; i++) {
      const serial = nextSerial + i;
      const serialStr = String(serial).padStart(4, '0');
      const cardId = `MEDY-${cleanCode}-${serialStr}`;

      cardsToInsert.push({
        cardId,
        serialNumber: serial,
        hospitalName: targetHospitalName,
        hospitalCode: cleanCode,
        patientName: 'Unassigned',
        patientAge: 0,
        patientGender: 'Unassigned',
        patientPhone: '',
        patientEmail: '',
        isAssigned: false,
        insurancePlan: 'Standard',
        cardColor: finalCardColor,
        coverageAmount: coverage,
        validUntil: validityDate,
        status: 'Active',
        history: [
          {
            action: 'CREATED',
            performedBy: req.admin?.email || 'Super Admin',
            timestamp: new Date(),
            note: note || `Batch card (Serial #${serialStr}) allocated to ${targetHospitalName}`,
          },
        ],
      });
    }

    const createdCards = await MediCard.insertMany(cardsToInsert);

    const fromSerial = String(nextSerial).padStart(4, '0');
    const toSerial = String(nextSerial + qty - 1).padStart(4, '0');

    try {
      await AuditLog.create({
        action: 'MEDY_CARD_BATCH_ISSUED',
        actor: req.admin?.email || 'admin@medy.com',
        role: 'Super Administrator',
        target: `${targetHospitalName} (${qty} Cards)`,
        details: `Issued batch of ${qty} serialized Medy Cards (${cleanCode}-${fromSerial} to ${cleanCode}-${toSerial})`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    res.status(201).json({
      message: `Successfully issued ${qty} Medi Cards to ${targetHospitalName}`,
      hospitalName: targetHospitalName,
      hospitalCode: cleanCode,
      quantity: qty,
      serialRange: `MEDY-${cleanCode}-${fromSerial} to MEDY-${cleanCode}-${toSerial}`,
      fromSerial: nextSerial,
      toSerial: nextSerial + qty - 1,
      cards: createdCards,
    });
  } catch (error) {
    console.error('Issue Cards to Hospital Error:', error);
    res.status(500).json({ message: error.message || 'Failed to issue cards to hospital' });
  }
};

// @desc    Issue a single Medi Card (with patient details or next hospital serial)
// @route   POST /api/medicards
// @access  Private (Admin)
const createCard = async (req, res) => {
  try {
    const {
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      patientEmail,
      insurancePlan,
      coverageAmount,
      validUntil,
    } = req.body;

    const rawHospitalName =
      (req.body.hospitalName && req.body.hospitalName.trim()) ||
      req.admin?.hospitalName ||
      'City Care Hospital';

    const { cleanCode, nextSerial, hospital } = await getHospitalCodeAndNextSerial(rawHospitalName);
    const targetHospital = hospital ? hospital.name : rawHospitalName;

    // Use requested cardId or generate structured serial ID: MEDY-[HOSP_CODE]-[SERIAL]
    let cardId = req.body.cardId ? req.body.cardId.trim().toUpperCase() : '';
    let serialNumber = nextSerial;

    if (!cardId) {
      cardId = `MEDY-${cleanCode}-${String(nextSerial).padStart(4, '0')}`;
    }

    // Check duplicate
    const existing = await MediCard.findOne({ cardId });
    if (existing) {
      cardId = await generateUniqueCardId();
    }

    const validityDate = validUntil
      ? new Date(validUntil)
      : new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000);

    const isAssigned = Boolean(patientName && patientName.trim() && patientName.trim() !== 'Unassigned');

    const initialHistory = {
      action: 'CREATED',
      performedBy: req.admin?.email || 'Admin',
      timestamp: new Date(),
      note: isAssigned
        ? `Card (Serial #${String(serialNumber).padStart(4, '0')}) issued for patient ${patientName} at ${targetHospital}`
        : `Card (Serial #${String(serialNumber).padStart(4, '0')}) issued to ${targetHospital}`,
    };

    const newCard = await MediCard.create({
      cardId,
      serialNumber,
      hospitalName: targetHospital,
      hospitalCode: cleanCode,
      patientName: isAssigned ? patientName.trim() : 'Unassigned',
      patientAge: patientAge ? Number(patientAge) : 0,
      patientGender: patientGender || 'Unassigned',
      patientPhone: patientPhone ? patientPhone.trim() : '',
      patientEmail: patientEmail ? patientEmail.trim() : '',
      isAssigned,
      insurancePlan: insurancePlan || 'Standard',
      coverageAmount: coverageAmount ? Number(coverageAmount) : 500000,
      validUntil: validityDate,
      status: 'Active',
      history: [initialHistory],
    });

    // If assigned to a patient, update patient record
    if (isAssigned && patientPhone) {
      try {
        const cleanPhone = patientPhone.trim();
        const phoneFilter = getPhoneQuery(cleanPhone);

        let patient = null;
        if (req.body.patientId) {
          patient = await Patient.findById(req.body.patientId);
        }
        if (!patient) {
          patient = await Patient.findOne({
            hospitalName: new RegExp(`^${targetHospital}$`, 'i'),
            ...phoneFilter,
          });
        }
        if (!patient) {
          patient = await Patient.findOne(phoneFilter);
        }

        if (patient) {
          patient.hasMedyCard = true;
          patient.cardId = cardId;
          patient.applicationStatus = 'Approved';
          patient.appliedForCard = true;
          await patient.save();
        } else {
          await Patient.create({
            name: patientName.trim(),
            age: Number(patientAge) || 0,
            gender: patientGender || 'Other',
            phone: cleanPhone,
            email: patientEmail ? patientEmail.trim() : '',
            hospitalName: targetHospital,
            hasMedyCard: true,
            cardId: cardId,
            applicationStatus: 'Approved',
            appliedForCard: true,
          });
        }
      } catch (patientErr) {
        console.warn('Error linking patient with card:', patientErr.message);
      }
    }

    try {
      await AuditLog.create({
        action: 'MEDY_CARD_ISSUED',
        actor: req.admin?.email || 'admin@medy.com',
        role: 'Super Administrator',
        target: `${newCard.cardId} (${newCard.patientName || 'Unassigned'})`,
        details: `Issued Medy Card for ${newCard.patientName || 'Unassigned'} at ${newCard.hospitalName} with ₹${(newCard.coverageAmount || 0).toLocaleString()} coverage`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    res.status(201).json(newCard);
  } catch (error) {
    console.error('Create Card Error:', error);
    res.status(500).json({ message: error.message || 'Failed to create card' });
  }
};

// @desc    Assign an unassigned hospital card to a registered/new patient
// @route   PATCH /api/medicards/:id/assign-patient
// @access  Private (Admin)
const assignPatientToCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { patientName, patientAge, patientGender, patientPhone, patientEmail } = req.body;

    if (!patientName || !patientName.trim()) {
      return res.status(400).json({ message: 'Patient name is required' });
    }
    if (!patientPhone || !patientPhone.trim()) {
      return res.status(400).json({ message: 'Patient phone number is required' });
    }

    const card = await MediCard.findById(id);
    if (!card) {
      return res.status(404).json({ message: 'Medi Card not found' });
    }

    card.patientName = patientName.trim();
    card.patientAge = patientAge ? Number(patientAge) : 0;
    card.patientGender = patientGender || 'Other';
    card.patientPhone = patientPhone.trim();
    card.patientEmail = patientEmail ? patientEmail.trim() : '';
    card.isAssigned = true;

    card.history.unshift({
      action: 'ACTIVATED',
      performedBy: req.admin?.email || 'Admin',
      timestamp: new Date(),
      note: `Card assigned to patient ${card.patientName} (${card.patientPhone}) at ${card.hospitalName}`,
    });

    await card.save();

    // Link/update Patient record
    try {
      const cleanPhone = card.patientPhone;
      const phoneFilter = getPhoneQuery(cleanPhone);
      let patient = await Patient.findOne({
        hospitalName: new RegExp(`^${card.hospitalName}$`, 'i'),
        ...phoneFilter,
      });

      if (!patient) {
        patient = await Patient.findOne(phoneFilter);
      }

      if (patient) {
        patient.hasMedyCard = true;
        patient.cardId = card.cardId;
        patient.applicationStatus = 'Approved';
        patient.appliedForCard = true;
        await patient.save();
      } else {
        await Patient.create({
          name: card.patientName,
          age: card.patientAge,
          gender: card.patientGender,
          phone: cleanPhone,
          email: card.patientEmail,
          hospitalName: card.hospitalName,
          hasMedyCard: true,
          cardId: card.cardId,
          applicationStatus: 'Approved',
          appliedForCard: true,
        });
      }
    } catch (pe) {
      console.warn('Patient link warning:', pe.message);
    }

    res.json(card);
  } catch (error) {
    console.error('Assign Patient Error:', error);
    res.status(500).json({ message: error.message || 'Failed to assign patient to card' });
  }
};

// @desc    Get all Medy Cards with search & filters
// @route   GET /api/medicards
// @access  Private (Admin)
const getCards = async (req, res) => {
  try {
    const { q, status, hospital, assignment } = req.query;

    const filter = {};

    if (hospital && hospital !== 'All') {
      filter.hospitalName = hospital;
    }

    if (status && ['Active', 'Inactive', 'Blocked'].includes(status)) {
      filter.status = status;
    }

    if (assignment === 'Assigned') {
      filter.isAssigned = true;
    } else if (assignment === 'Unassigned') {
      filter.isAssigned = { $ne: true };
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { cardId: searchRegex },
        { hospitalName: searchRegex },
        { hospitalCode: searchRegex },
        { patientName: searchRegex },
        { patientPhone: searchRegex },
        { patientEmail: searchRegex },
      ];
    }

    const cards = await MediCard.find(filter).sort({ hospitalName: 1, serialNumber: 1, createdAt: -1 });

    const totalCount = await MediCard.countDocuments(filter.hospitalName ? { hospitalName: filter.hospitalName } : {});
    const activeCount = await MediCard.countDocuments({
      ...(filter.hospitalName ? { hospitalName: filter.hospitalName } : {}),
      status: 'Active',
    });
    const inactiveCount = await MediCard.countDocuments({
      ...(filter.hospitalName ? { hospitalName: filter.hospitalName } : {}),
      status: 'Inactive',
    });
    const blockedCount = await MediCard.countDocuments({
      ...(filter.hospitalName ? { hospitalName: filter.hospitalName } : {}),
      status: 'Blocked',
    });
    const assignedCount = await MediCard.countDocuments({
      ...(filter.hospitalName ? { hospitalName: filter.hospitalName } : {}),
      isAssigned: true,
    });
    const unassignedCount = await MediCard.countDocuments({
      ...(filter.hospitalName ? { hospitalName: filter.hospitalName } : {}),
      isAssigned: { $ne: true },
    });

    res.json({
      cards,
      stats: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        blocked: blockedCount,
        assigned: assignedCount,
        unassigned: unassignedCount,
      },
    });
  } catch (error) {
    console.error('Get Cards Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch cards' });
  }
};

// @desc    Get inventory and allocation breakdown per hospital
// @route   GET /api/medicards/hospital-allocations
// @access  Private (Admin)
const getHospitalAllocations = async (req, res) => {
  try {
    const hospitals = await Hospital.find({}).sort({ name: 1 });
    const allCards = await MediCard.find({}).select('hospitalName hospitalCode serialNumber isAssigned status cardId');

    const allocations = hospitals.map((hosp) => {
      const hospCards = allCards.filter(
        (c) => (c.hospitalName || '').trim().toLowerCase() === hosp.name.trim().toLowerCase()
      );

      const total = hospCards.length;
      const active = hospCards.filter((c) => c.status === 'Active').length;
      const inactive = hospCards.filter((c) => c.status === 'Inactive').length;
      const blocked = hospCards.filter((c) => c.status === 'Blocked').length;

      const serials = hospCards
        .map((c) => c.serialNumber)
        .filter((s) => typeof s === 'number' && !isNaN(s))
        .sort((a, b) => a - b);

      let cleanCode = (hosp.code || '').replace(/^HOSP-/, '').trim().toUpperCase();
      if (!cleanCode) {
        cleanCode = hosp.name.slice(0, 3).toUpperCase();
      }

      let serialRange = 'None Issued';
      if (serials.length > 0) {
        const minS = String(serials[0]).padStart(4, '0');
        const maxS = String(serials[serials.length - 1]).padStart(4, '0');
        serialRange = `MEDY-${cleanCode}-${minS} to MEDY-${cleanCode}-${maxS}`;
      }

      return {
        hospitalId: hosp._id,
        hospitalName: hosp.name,
        hospitalCode: cleanCode,
        hospitalCity: hosp.city,
        hospitalPhone: hosp.phone || '',
        cardColor: hosp.cardColor || '',
        totalIssued: total,
        activeCards: active,
        inactiveCards: inactive,
        blockedCards: blocked,
        serialRange,
        latestSerial: serials.length > 0 ? serials[serials.length - 1] : 0,
      };
    });

    res.json(allocations);
  } catch (error) {
    console.error('Get Hospital Allocations Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch allocations' });
  }
};

// @desc    Get single card by ID or Card ID
// @route   GET /api/medicards/:id
// @access  Private (Admin)
const getCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await MediCard.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { cardId: id.toUpperCase() }],
    });

    if (!card) {
      return res.status(404).json({ message: 'Medi Card not found' });
    }

    res.json(card);
  } catch (error) {
    console.error('Get Card By ID Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch card' });
  }
};

// @desc    Update card status (Activate, Deactivate, Block)
// @route   PATCH /api/medicards/:id/status
// @access  Private (Admin)
const updateCardStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['Active', 'Inactive', 'Blocked'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const card = await MediCard.findById(id);
    if (!card) {
      return res.status(404).json({ message: 'Medi Card not found' });
    }

    let action = 'ACTIVATED';
    if (status === 'Inactive') action = 'DEACTIVATED';
    if (status === 'Blocked') action = 'BLOCKED';

    const historyEntry = {
      action,
      performedBy: req.admin?.email || 'Admin',
      timestamp: new Date(),
      note: reason || `Status updated from ${card.status} to ${status}`,
    };

    card.status = status;
    if (status === 'Blocked') {
      card.blockReason = reason || 'Blocked due to loss or security precaution';
    } else {
      card.blockReason = '';
    }

    card.history.unshift(historyEntry);
    await card.save();

    try {
      await AuditLog.create({
        action: 'MEDY_CARD_STATUS_CHANGED',
        actor: req.admin?.email || 'admin@medy.com',
        role: 'Super Administrator',
        target: `${card.cardId} (${card.patientName || 'Unassigned'})`,
        details: reason || `Medy Card status updated to ${status} at ${card.hospitalName}`,
        ipAddress: req.ip || '127.0.0.1',
        status: status === 'Active' ? 'Success' : 'Warning',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    res.json(card);
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ message: error.message || 'Failed to update status' });
  }
};

// @desc    Assign / Reassign card to a hospital
// @route   PATCH /api/medicards/:id/assign
// @access  Private (Admin)
const assignHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const { hospitalName, note } = req.body;

    if (!hospitalName || !hospitalName.trim()) {
      return res.status(400).json({ message: 'Hospital name is required' });
    }

    const card = await MediCard.findById(id);
    if (!card) {
      return res.status(404).json({ message: 'Medi Card not found' });
    }

    const prevHospital = card.hospitalName;
    const { cleanCode } = await getHospitalCodeAndNextSerial(hospitalName);

    card.hospitalName = hospitalName.trim();
    card.hospitalCode = cleanCode;

    card.history.unshift({
      action: 'ASSIGNED',
      performedBy: req.admin?.email || 'Admin',
      timestamp: new Date(),
      note: note || `Card assigned from ${prevHospital || 'None'} to ${card.hospitalName}`,
    });

    await card.save();
    res.json(card);
  } catch (error) {
    console.error('Assign Hospital Error:', error);
    res.status(500).json({ message: error.message || 'Failed to assign hospital' });
  }
};

module.exports = {
  createCard,
  issueCardsToHospital,
  assignPatientToCard,
  getCards,
  getHospitalAllocations,
  getCardById,
  updateCardStatus,
  assignHospital,
};
