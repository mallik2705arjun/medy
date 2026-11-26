const mongoose = require('mongoose');
const LabTest = require('../models/LabTest');
const Patient = require('../models/Patient');
const Hospital = require('../models/Hospital');
const LabCatalogTest = require('../models/LabCatalogTest');
const AuditLog = require('../models/AuditLog');

// Standard Lab Test Catalog
const LAB_CATALOG = [
  {
    name: 'Complete Blood Count (CBC)',
    code: 'LAB-CBC',
    category: 'Hematology',
    sampleType: 'Blood',
    fastingRequired: false,
    price: 350,
    turnaround: '6-8 Hours',
    description: 'Comprehensive analysis of RBC, WBC, Platelets, Hemoglobin, and Hematocrit.',
  },
  {
    name: 'Comprehensive Lipid Profile',
    code: 'LAB-LIPID',
    category: 'Biochemistry',
    sampleType: 'Blood',
    fastingRequired: true,
    price: 650,
    turnaround: '12 Hours',
    description: 'Total Cholesterol, HDL, LDL, VLDL, and Triglycerides for cardiovascular assessment.',
  },
  {
    name: 'Liver Function Test (LFT)',
    code: 'LAB-LFT',
    category: 'Biochemistry',
    sampleType: 'Blood',
    fastingRequired: true,
    price: 750,
    turnaround: '12 Hours',
    description: 'SGOT, SGPT, Bilirubin (Total & Direct), Alkaline Phosphatase, Total Protein, and Albumin.',
  },
  {
    name: 'Kidney Function Test (KFT / RFT)',
    code: 'LAB-KFT',
    category: 'Renal Panel',
    sampleType: 'Blood',
    fastingRequired: false,
    price: 700,
    turnaround: '12 Hours',
    description: 'Blood Urea Nitrogen (BUN), Serum Creatinine, Uric Acid, and Electrolytes.',
  },
  {
    name: 'HbA1c (Glycated Hemoglobin)',
    code: 'LAB-HBA1C',
    category: 'Endocrinology',
    sampleType: 'Blood',
    fastingRequired: false,
    price: 450,
    turnaround: '8-12 Hours',
    description: 'Gold standard 3-month average plasma glucose control evaluation.',
  },
  {
    name: 'Thyroid Profile (Total T3, T4, TSH)',
    code: 'LAB-THYROID',
    category: 'Endocrinology',
    sampleType: 'Blood',
    fastingRequired: false,
    price: 550,
    turnaround: '12 Hours',
    description: 'Triiodothyronine (T3), Thyroxine (T4), and Thyroid Stimulating Hormone (TSH).',
  },
  {
    name: 'Vitamin D (25-OH) & B12 Vitality Combo',
    code: 'LAB-VIT-COMBO',
    category: 'General Health',
    sampleType: 'Blood',
    fastingRequired: false,
    price: 1200,
    turnaround: '24 Hours',
    description: 'Essential micronutrient screen evaluating bone density and nervous system health.',
  },
  {
    name: 'Urine Routine & Microscopic Examination',
    code: 'LAB-URINE',
    category: 'Pathology',
    sampleType: 'Urine',
    fastingRequired: false,
    price: 250,
    turnaround: '4-6 Hours',
    description: 'Detects urinary tract infections, renal disorders, and metabolic conditions.',
  },
  {
    name: 'Cardiac Risk Biomarker Panel (Troponin-I + hs-CRP)',
    code: 'LAB-CARDIO',
    category: 'Cardiology',
    sampleType: 'Blood',
    fastingRequired: false,
    price: 1400,
    turnaround: '6 Hours',
    description: 'High-sensitivity quantitative marker for acute myocardial risk and systemic inflammation.',
  },
  {
    name: 'RT-PCR Viral Screen (Respiratory Panel)',
    code: 'LAB-RTPCR',
    category: 'Microbiology',
    sampleType: 'Nasal/Throat Swab',
    fastingRequired: false,
    price: 900,
    turnaround: '12-18 Hours',
    description: 'Molecular diagnostic assay detecting respiratory viral RNA with high specificity.',
  },
];

// Helper to retrieve catalog tests from DB or seed if empty
const getAllCatalogTests = async () => {
  try {
    const count = await LabCatalogTest.countDocuments();
    if (count === 0) {
      await LabCatalogTest.insertMany(
        LAB_CATALOG.map((item) => ({ ...item, isCustom: false }))
      );
    }
    const tests = await LabCatalogTest.find().sort({ createdAt: 1 }).lean();
    return tests;
  } catch (err) {
    console.error('Error fetching catalog tests from DB:', err);
    return LAB_CATALOG;
  }
};

// Helper to match phone numbers flexibly (handles +91, spaces, dashes)
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

// Helper to generate lab test booking ID
const generateLabBookingId = async () => {
  let unique = false;
  let testBookingId = '';
  while (!unique) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    testBookingId = `LAB-2026-${randomNum}`;
    const exists = await LabTest.findOne({ testBookingId });
    if (!exists) unique = true;
  }
  return testBookingId;
};

// @desc    Get all lab test bookings with per-hospital patient & test details
// @route   GET /api/lab-tests
// @access  Private (Admin)
const getLabTests = async (req, res) => {
  try {
    const { hospital, status, collectionType, q, date } = req.query;
    const filter = {};

    if (hospital && hospital !== 'All') {
      filter.hospitalName = new RegExp(`^${hospital.trim()}$`, 'i');
    }

    if (status && status !== 'All') {
      filter.status = status.trim();
    }

    if (collectionType && collectionType !== 'All') {
      filter.collectionType = collectionType.trim();
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { testBookingId: searchRegex },
        { patientName: searchRegex },
        { patientPhone: searchRegex },
        { patientEmail: searchRegex },
        { testName: searchRegex },
        { testCode: searchRegex },
        { category: searchRegex },
        { hospitalName: searchRegex },
        { cardId: searchRegex },
      ];
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.bookingDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const labTests = await LabTest.find(filter).sort({ bookingDate: -1, createdAt: -1 });

    // Aggregate summary stats (respecting hospital filter if chosen)
    const baseHospitalFilter = hospital && hospital !== 'All' ? { hospitalName: new RegExp(`^${hospital.trim()}$`, 'i') } : {};

    const totalCount = await LabTest.countDocuments(baseHospitalFilter);
    const pendingCollectionCount = await LabTest.countDocuments({ ...baseHospitalFilter, status: 'Pending Collection' });
    const sampleCollectedCount = await LabTest.countDocuments({ ...baseHospitalFilter, status: 'Sample Collected' });
    const inAnalysisCount = await LabTest.countDocuments({ ...baseHospitalFilter, status: 'In-Analysis' });
    const reportCompletedCount = await LabTest.countDocuments({ ...baseHospitalFilter, status: 'Report Completed' });
    const cancelledCount = await LabTest.countDocuments({ ...baseHospitalFilter, status: 'Cancelled' });

    // Aggregate unique patients count across all bookings
    const uniquePatientsAgg = await LabTest.aggregate([
      { $match: baseHospitalFilter },
      { $group: { _id: { $toLower: { $ifNull: ['$patientPhone', ''] } } } },
    ]);
    const totalPatientsBooked = uniquePatientsAgg.length;

    // Detailed Breakdown per hospital:
    // Shows how many patients booked and which specific lab tests for each hospital
    const hospitalAgg = await LabTest.aggregate([
      {
        $group: {
          _id: { $toLower: { $ifNull: ['$hospitalName', ''] } },
          hospitalName: { $first: '$hospitalName' },
          totalTests: { $sum: 1 },
          pendingCollection: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending Collection'] }, 1, 0] },
          },
          sampleCollected: {
            $sum: { $cond: [{ $eq: ['$status', 'Sample Collected'] }, 1, 0] },
          },
          inAnalysis: {
            $sum: { $cond: [{ $eq: ['$status', 'In-Analysis'] }, 1, 0] },
          },
          reportCompleted: {
            $sum: { $cond: [{ $eq: ['$status', 'Report Completed'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] },
          },
          // All test bookings for this hospital
          bookings: {
            $push: {
              testBookingId: '$testBookingId',
              patientName: '$patientName',
              patientPhone: '$patientPhone',
              patientAge: '$patientAge',
              patientGender: '$patientGender',
              cardId: '$cardId',
              testName: '$testName',
              testCode: '$testCode',
              category: '$category',
              sampleType: '$sampleType',
              collectionType: '$collectionType',
              price: '$price',
              status: '$status',
              bookingDate: '$bookingDate',
              timeSlot: '$timeSlot',
            },
          },
        },
      },
    ]);

    const hospitalBreakdown = {};
    hospitalAgg.forEach((h) => {
      if (h._id) {
        // Calculate unique patients for this hospital
        const patientPhoneSet = new Set();
        const uniquePatientsList = [];
        const testsCountMap = {};

        (h.bookings || []).forEach((b) => {
          const phoneKey = (b.patientPhone || b.patientName || '').trim();
          if (phoneKey && !patientPhoneSet.has(phoneKey)) {
            patientPhoneSet.add(phoneKey);
            uniquePatientsList.push({
              name: b.patientName,
              phone: b.patientPhone,
              age: b.patientAge,
              gender: b.patientGender,
              cardId: b.cardId,
            });
          }

          // Count which lab tests were booked
          const tName = b.testName || 'Unknown Test';
          if (!testsCountMap[tName]) {
            testsCountMap[tName] = {
              testName: tName,
              category: b.category,
              sampleType: b.sampleType,
              count: 1,
              price: b.price,
            };
          } else {
            testsCountMap[tName].count += 1;
          }
        });

        hospitalBreakdown[h._id.trim()] = {
          hospitalName: h.hospitalName || h._id,
          totalTests: h.totalTests,
          uniquePatientsCount: uniquePatientsList.length,
          patients: uniquePatientsList,
          testsSummary: Object.values(testsCountMap),
          testsCountMap,
          bookings: h.bookings,
          pendingCollection: h.pendingCollection,
          sampleCollected: h.sampleCollected,
          inAnalysis: h.inAnalysis,
          reportCompleted: h.reportCompleted,
          cancelled: h.cancelled,
        };
      }
    });

    // Ensure all existing network hospitals are included even if 0 tests booked yet
    const allHospitals = await Hospital.find().lean();
    allHospitals.forEach((h) => {
      const key = (h.name || '').toLowerCase().trim();
      if (!hospitalBreakdown[key]) {
        hospitalBreakdown[key] = {
          hospitalName: h.name,
          hospitalCode: h.code,
          city: h.city,
          phone: h.phone,
          totalTests: 0,
          uniquePatientsCount: 0,
          patients: [],
          testsSummary: [],
          testsCountMap: {},
          bookings: [],
          pendingCollection: 0,
          sampleCollected: 0,
          inAnalysis: 0,
          reportCompleted: 0,
          cancelled: 0,
        };
      } else {
        hospitalBreakdown[key].hospitalCode = h.code;
        hospitalBreakdown[key].city = h.city;
        hospitalBreakdown[key].phone = h.phone;
      }
    });

    const activeCatalog = await getAllCatalogTests();

    res.json({
      labTests,
      tests: labTests,
      stats: {
        total: totalCount,
        totalPatientsBooked,
        pendingCollection: pendingCollectionCount,
        sampleCollected: sampleCollectedCount,
        inAnalysis: inAnalysisCount,
        reportCompleted: reportCompletedCount,
        cancelled: cancelledCount,
      },
      hospitalBreakdown,
      catalog: activeCatalog,
    });
  } catch (error) {
    console.error('Error in getLabTests:', error);
    res.status(500).json({ message: 'Server error retrieving lab tests', error: error.message });
  }
};

// @desc    Get lab test catalog
// @route   GET /api/lab-tests/catalog
// @access  Public or Private
const getCatalog = async (req, res) => {
  try {
    const catalog = await getAllCatalogTests();
    res.json(catalog);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving catalog', error: error.message });
  }
};

// @desc    Get single lab test by ID
// @route   GET /api/lab-tests/:id
// @access  Private (Admin)
const getLabTestById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid lab test ID format' });
    }

    const labTest = await LabTest.findById(id);
    if (!labTest) {
      return res.status(404).json({ message: 'Lab test booking not found' });
    }

    res.json(labTest);
  } catch (error) {
    console.error('Error in getLabTestById:', error);
    res.status(500).json({ message: 'Server error retrieving lab test', error: error.message });
  }
};

// @desc    Book a new lab test
// @route   POST /api/lab-tests
// @access  Private (Admin)
const createLabTest = async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      patientEmail,
      cardId,
      hospitalName,
      testName,
      testCode,
      category,
      sampleType,
      collectionType,
      bookingDate,
      timeSlot,
      fastingRequired,
      price,
      notes,
    } = req.body;

    if (!patientName || !patientAge || !patientPhone || !hospitalName || !testName || !bookingDate || !timeSlot) {
      return res.status(400).json({
        message: 'Please provide all required fields: patientName, patientAge, patientPhone, hospitalName, testName, bookingDate, timeSlot',
      });
    }

    // Verify or normalize hospital name
    const matchedHospital = await Hospital.findOne({
      name: new RegExp(`^${hospitalName.trim()}$`, 'i'),
    });
    const finalHospitalName = matchedHospital ? matchedHospital.name : hospitalName.trim();

    const testBookingId = await generateLabBookingId();

    // Link patient safely (checking ObjectId format to avoid CastError)
    let linkedPatient = null;
    if (patientId && mongoose.Types.ObjectId.isValid(patientId)) {
      linkedPatient = await Patient.findById(patientId);
    }
    if (!linkedPatient && patientPhone) {
      const phoneFilter = getPhoneQuery(patientPhone);
      linkedPatient = await Patient.findOne({
        hospitalName: new RegExp(`^${finalHospitalName}$`, 'i'),
        ...phoneFilter,
      });
      if (!linkedPatient) {
        linkedPatient = await Patient.findOne(phoneFilter);
      }
    }

    // Auto-match details from catalog if omitted
    const matchedCatalog = LAB_CATALOG.find(
      (c) => c.name.toLowerCase() === testName.toLowerCase() || (testCode && c.code === testCode)
    );

    const resolvedCategory = category || matchedCatalog?.category || 'Biochemistry';
    const resolvedSampleType = sampleType || matchedCatalog?.sampleType || 'Blood';
    const resolvedFasting = fastingRequired !== undefined ? fastingRequired : matchedCatalog?.fastingRequired || false;
    const resolvedPrice = price !== undefined && price !== null ? Number(price) : matchedCatalog?.price || 500;
    const resolvedTurnaround = matchedCatalog?.turnaround || '12-24 Hours';
    const resolvedCode = testCode || matchedCatalog?.code || 'LAB-GEN';

    const labTest = new LabTest({
      testBookingId,
      patient: (linkedPatient && linkedPatient._id) ? linkedPatient._id : null,
      patientName: patientName.trim(),
      patientAge: Number(patientAge),
      patientGender: patientGender || linkedPatient?.gender || 'Male',
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail ? patientEmail.trim() : linkedPatient?.email || '',
      cardId: cardId || linkedPatient?.cardId || null,
      hospitalName: finalHospitalName,
      testName: testName.trim(),
      testCode: resolvedCode,
      category: resolvedCategory,
      sampleType: resolvedSampleType,
      collectionType: collectionType || 'Hospital Lab Visit',
      bookingDate: new Date(bookingDate),
      timeSlot: timeSlot.trim(),
      fastingRequired: resolvedFasting,
      price: resolvedPrice,
      reportTurnaround: resolvedTurnaround,
      status: 'Pending Collection',
      notes: notes ? notes.trim() : '',
    });

    const savedLabTest = await labTest.save();

    try {
      await AuditLog.create({
        action: 'LAB_TEST_ORDERED',
        actor: req.admin?.email || 'admin@medy.com',
        role: req.admin?.role === 'HOSPITAL_ADMIN' ? 'Hospital Administrator' : 'Super Administrator',
        target: `${testName.trim()} (${patientName.trim()})`,
        details: `Diagnostic test booking #${labTest.testBookingId} (${resolvedCategory}) scheduled at ${finalHospitalName} on ${new Date(bookingDate).toLocaleDateString('en-GB')}`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    res.status(201).json({
      message: 'Lab test booked successfully',
      labTest: savedLabTest,
    });
  } catch (error) {
    console.error('Error in createLabTest:', error);
    res.status(500).json({ message: 'Server error booking lab test', error: error.message });
  }
};

// @desc    Update lab test status / results
// @route   PATCH /api/lab-tests/:id/status
// @access  Private (Admin)
const updateLabTestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid lab test ID format' });
    }

    const { status, resultSummary, reportUrl, reportFileName, reportUploadedAt, notes } = req.body;

    const labTest = await LabTest.findById(id);
    if (!labTest) {
      return res.status(404).json({ message: 'Lab test booking not found' });
    }

    if (status) {
      const validStatuses = ['Pending Collection', 'Sample Collected', 'In-Analysis', 'Report Completed', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }
      labTest.status = status;
    }

    if (resultSummary !== undefined) labTest.resultSummary = resultSummary;
    if (reportUrl !== undefined) labTest.reportUrl = reportUrl;
    if (reportFileName !== undefined) labTest.reportFileName = reportFileName;
    if (reportUploadedAt !== undefined) {
      labTest.reportUploadedAt = reportUploadedAt;
    } else if (reportUrl) {
      labTest.reportUploadedAt = new Date();
    }
    if (notes !== undefined) labTest.notes = notes;

    const updated = await labTest.save();

    try {
      await AuditLog.create({
        action: status === 'Report Completed' ? 'LAB_REPORT_COMPLETED' : 'LAB_TEST_STATUS_CHANGED',
        actor: req.admin?.email || 'admin@medy.com',
        role: req.admin?.role === 'HOSPITAL_ADMIN' ? 'Hospital Administrator' : 'Super Administrator',
        target: `${labTest.testBookingId} (${labTest.testName} • ${labTest.patientName})`,
        details: `Diagnostic test status updated to "${status}" at ${labTest.hospitalName}${resultSummary ? ` • Result: ${resultSummary}` : ''}`,
        ipAddress: req.ip || '127.0.0.1',
        status: status === 'Cancelled' ? 'Warning' : 'Success',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    res.json({
      message: 'Lab test status updated successfully',
      labTest: updated,
    });
  } catch (error) {
    console.error('Error in updateLabTestStatus:', error);
    res.status(500).json({ message: 'Server error updating lab test', error: error.message });
  }
};

// @desc    Delete lab test booking
// @route   DELETE /api/lab-tests/:id
// @access  Private (Admin)
const deleteLabTest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid lab test ID format' });
    }

    const labTest = await LabTest.findById(id);
    if (!labTest) {
      return res.status(404).json({ message: 'Lab test booking not found' });
    }

    const { testBookingId, testName, patientName, hospitalName } = labTest;
    await LabTest.findByIdAndDelete(id);

    try {
      await AuditLog.create({
        action: 'LAB_TEST_DELETED',
        actor: req.admin?.email || 'admin@medy.com',
        role: req.admin?.role === 'HOSPITAL_ADMIN' ? 'Hospital Administrator' : 'Super Administrator',
        target: `${testBookingId} (${testName} • ${patientName})`,
        details: `Deleted diagnostic lab test booking record from ${hospitalName}`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Warning',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    res.json({ message: 'Lab test booking deleted successfully' });
  } catch (error) {
    console.error('Error in deleteLabTest:', error);
    res.status(500).json({ message: 'Server error deleting lab test', error: error.message });
  }
};

// @desc    Add a new laboratory test to the network catalog
// @route   POST /api/lab-tests/catalog
// @access  Private (Admin)
const addCatalogTest = async (req, res) => {
  try {
    const {
      name,
      code,
      category,
      sampleType,
      fastingRequired,
      price,
      turnaround,
      description,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Test name is required' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ message: 'Category is required' });
    }

    // Ensure initial catalog is seeded first
    await getAllCatalogTests();

    // Generate code if missing
    let finalCode = (code || '').trim().toUpperCase();
    if (!finalCode) {
      const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();
      const rand = Math.floor(100 + Math.random() * 900);
      finalCode = `LAB-${cleanName || 'TEST'}-${rand}`;
    }

    // Check for duplicate name or code
    const existing = await LabCatalogTest.findOne({
      $or: [
        { name: new RegExp(`^${name.trim()}$`, 'i') },
        { code: finalCode },
      ],
    });

    if (existing) {
      return res.status(400).json({
        message:
          existing.name.toLowerCase() === name.trim().toLowerCase()
            ? `Laboratory test '${name.trim()}' already exists in the catalog.`
            : `Test code '${finalCode}' is already in use. Please provide a unique code.`,
      });
    }

    const newTest = await LabCatalogTest.create({
      name: name.trim(),
      code: finalCode,
      category: category.trim(),
      sampleType: (sampleType || 'Blood').trim(),
      fastingRequired: Boolean(fastingRequired),
      price: Number(price) >= 0 ? Number(price) : 500,
      turnaround: (turnaround || '12-24 Hours').trim(),
      description: (description || '').trim(),
      isCustom: true,
    });

    res.status(201).json({
      message: 'Laboratory test added successfully to catalog',
      test: newTest,
    });
  } catch (error) {
    console.error('Error adding catalog test:', error);
    res.status(500).json({ message: 'Server error adding laboratory test', error: error.message });
  }
};

// @desc    Delete custom lab test from catalog
// @route   DELETE /api/lab-tests/catalog/:id
// @access  Private (Admin)
const deleteCatalogTest = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await LabCatalogTest.findById(id);
    if (!test) {
      return res.status(404).json({ message: 'Laboratory test not found' });
    }

    await LabCatalogTest.findByIdAndDelete(id);
    res.json({ message: 'Laboratory test removed from catalog', id });
  } catch (error) {
    console.error('Error deleting catalog test:', error);
    res.status(500).json({ message: 'Server error removing test from catalog', error: error.message });
  }
};

// @desc    Generate a realistic demo lab test booking or seed demo tests
// @route   POST /api/lab-tests/seed-demo
// @access  Private (Admin)
const seedDemoLabTests = async (req, res) => {
  try {
    const hospitals = await Hospital.find().lean();
    const hospitalNames = hospitals.length > 0 
      ? hospitals.map((h) => h.name) 
      : ['Apollo Specialty Hospital', 'City Care Hospital', 'Metro Care Multi-Specialty'];

    const demoPatients = [
      { name: 'Dr. Aryan Saxena', age: 42, gender: 'Male', phone: '+91 98201 44821', email: 'aryan.saxena@example.com', cardId: 'MEDY-4821' },
      { name: 'Meenakshi Sundaram', age: 29, gender: 'Female', phone: '+91 97405 88219', email: 'meenakshi.s@example.com', cardId: 'MEDY-8821' },
      { name: 'Vikramaditya Roy', age: 58, gender: 'Male', phone: '+91 94330 19823', email: 'vikram.roy@example.com', cardId: 'MEDY-1982' },
      { name: 'Ananya Deshmukh', age: 33, gender: 'Female', phone: '+91 98902 33412', email: 'ananya.d@example.com', cardId: 'MEDY-3341' },
      { name: 'Kabir Malhotra', age: 26, gender: 'Male', phone: '+91 98112 99482', email: 'kabir.m@example.com', cardId: 'MEDY-9948' },
      { name: 'Pooja Bhattacharya', age: 47, gender: 'Female', phone: '+91 93310 55194', email: 'pooja.b@example.com', cardId: 'MEDY-5519' },
    ];

    const catalogTests = await getAllCatalogTests();
    const targetCatalog = catalogTests.length > 0 ? catalogTests : LAB_CATALOG;

    // Pick random patient or use requested patient
    const randomPatient = demoPatients[Math.floor(Math.random() * demoPatients.length)];
    const randomTest = targetCatalog[Math.floor(Math.random() * targetCatalog.length)];
    const randomHospital = hospitalNames[Math.floor(Math.random() * hospitalNames.length)];
    
    const statuses = ['Pending Collection', 'Sample Collected', 'In-Analysis', 'Report Completed'];
    const chosenStatus = req.body?.status || statuses[Math.floor(Math.random() * statuses.length)];
    const collectionTypes = ['Hospital Lab Visit', 'Home Sample Collection'];
    const chosenCollection = req.body?.collectionType || collectionTypes[Math.floor(Math.random() * collectionTypes.length)];
    const slots = ['08:00 AM - 09:00 AM', '09:30 AM - 10:30 AM', '11:00 AM - 12:00 PM', '02:00 PM - 03:00 PM', '04:30 PM - 05:30 PM'];
    const chosenSlot = req.body?.timeSlot || slots[Math.floor(Math.random() * slots.length)];

    const testBookingId = await generateLabBookingId();

    const sampleSummaries = {
      'Complete Blood Count (CBC)': 'Hb: 14.1 g/dL (Normal: 13-17), WBC: 7,200 /uL (Normal), Platelets: 240,000 /uL (Normal). Overall hemogram optimal.',
      'Comprehensive Lipid Profile': 'Total Cholesterol: 184 mg/dL (<200), HDL: 52 mg/dL (>40), LDL: 108 mg/dL (<100 desirable), Triglycerides: 130 mg/dL (<150). Normal lipid balance.',
      'Liver Function Test (LFT)': 'SGOT (AST): 24 U/L, SGPT (ALT): 28 U/L, Bilirubin Total: 0.8 mg/dL, Albumin: 4.4 g/dL. Normal hepatic enzyme levels.',
      'Kidney Function Test (KFT / RFT)': 'Serum Creatinine: 0.9 mg/dL (Normal 0.7-1.3), BUN: 14 mg/dL, Uric Acid: 5.2 mg/dL. Renal filtration within normal range.',
      'HbA1c (Glycated Hemoglobin)': 'HbA1c: 5.4% (<5.7% Non-Diabetic), Estimated Average Glucose: 108 mg/dL. Excellent glycemic control.',
      'Thyroid Profile (Total T3, T4, TSH)': 'TSH: 2.15 uIU/mL (Normal 0.4-4.5), Free T4: 1.2 ng/dL, Total T3: 110 ng/dL. Euthyroid state confirmed.',
      'Vitamin D (25-OH) & B12 Vitality Combo': 'Vitamin D (25-OH): 38 ng/mL (Sufficient >30), Vitamin B12: 480 pg/mL (Normal 200-900). Good vitality score.',
    };

    const resultSummary = chosenStatus === 'Report Completed'
      ? (sampleSummaries[randomTest.name] || 'All diagnostic parameters tested and verified within standard physiological reference ranges.')
      : (chosenStatus === 'In-Analysis' ? 'Specimen under automated spectrophotometry analysis.' : '');

    const newLabTest = await LabTest.create({
      testBookingId,
      patientName: req.body?.patientName || randomPatient.name,
      patientAge: req.body?.patientAge || randomPatient.age,
      patientGender: req.body?.patientGender || randomPatient.gender,
      patientPhone: req.body?.patientPhone || randomPatient.phone,
      patientEmail: req.body?.patientEmail || randomPatient.email,
      cardId: req.body?.cardId || randomPatient.cardId,
      hospitalName: req.body?.hospitalName || randomHospital,
      testName: req.body?.testName || randomTest.name,
      testCode: randomTest.code || 'LAB-DEMO',
      category: randomTest.category || 'Biochemistry',
      sampleType: randomTest.sampleType || 'Blood',
      collectionType: chosenCollection,
      bookingDate: req.body?.bookingDate ? new Date(req.body.bookingDate) : new Date(),
      timeSlot: chosenSlot,
      status: chosenStatus,
      fastingRequired: randomTest.fastingRequired || false,
      price: randomTest.price || 600,
      reportTurnaround: randomTest.turnaround || '12 Hours',
      reportUrl: chosenStatus === 'Report Completed' ? `https://medy-reports.storage.local/lab/${testBookingId}.pdf` : '',
      resultSummary,
      notes: 'Demo test booking generated via Medy Super Admin diagnostic simulator.',
    });

    res.status(201).json({
      message: `Demo lab booking created successfully (${newLabTest.testBookingId})`,
      labTest: newLabTest,
    });
  } catch (error) {
    console.error('Error generating demo lab test:', error);
    res.status(500).json({ message: 'Failed to generate demo lab test', error: error.message });
  }
};

module.exports = {
  getLabTests,
  getCatalog,
  getLabTestById,
  createLabTest,
  updateLabTestStatus,
  deleteLabTest,
  addCatalogTest,
  deleteCatalogTest,
  seedDemoLabTests,
  LAB_CATALOG,
};
