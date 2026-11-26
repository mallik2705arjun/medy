const crypto = require('crypto');
const PartneredLab = require('../models/PartneredLab');
const Hospital = require('../models/Hospital');
const LabCatalogTest = require('../models/LabCatalogTest');
const AuditLog = require('../models/AuditLog');

// Default catalog of tests for external laboratories
const DEFAULT_TEST_OFFERINGS = [
  {
    testName: 'Complete Blood Count (CBC)',
    testCode: 'LAB-CBC',
    category: 'Hematology',
    sampleType: 'Blood',
    basePrice: 350,
    labPrice: 320,
    turnaround: '6-8 Hours',
    isAvailable: true,
    fastingRequired: false,
  },
  {
    testName: 'Comprehensive Lipid Profile',
    testCode: 'LAB-LIPID',
    category: 'Biochemistry',
    sampleType: 'Blood',
    basePrice: 650,
    labPrice: 580,
    turnaround: '12 Hours',
    isAvailable: true,
    fastingRequired: true,
  },
  {
    testName: 'Liver Function Test (LFT)',
    testCode: 'LAB-LFT',
    category: 'Biochemistry',
    sampleType: 'Blood',
    basePrice: 750,
    labPrice: 680,
    turnaround: '12 Hours',
    isAvailable: true,
    fastingRequired: true,
  },
  {
    testName: 'Kidney Function Test (KFT / RFT)',
    testCode: 'LAB-KFT',
    category: 'Renal Panel',
    sampleType: 'Blood',
    basePrice: 700,
    labPrice: 640,
    turnaround: '12 Hours',
    isAvailable: true,
    fastingRequired: false,
  },
  {
    testName: 'HbA1c (Glycated Hemoglobin)',
    testCode: 'LAB-HBA1C',
    category: 'Endocrinology',
    sampleType: 'Blood',
    basePrice: 450,
    labPrice: 400,
    turnaround: '8-12 Hours',
    isAvailable: true,
    fastingRequired: false,
  },
  {
    testName: 'Thyroid Profile (Total T3, T4, TSH)',
    testCode: 'LAB-THYROID',
    category: 'Endocrinology',
    sampleType: 'Blood',
    basePrice: 550,
    labPrice: 490,
    turnaround: '12 Hours',
    isAvailable: true,
    fastingRequired: false,
  },
  {
    testName: 'Vitamin D (25-OH) & B12 Vitality Combo',
    testCode: 'LAB-VIT-COMBO',
    category: 'General Health',
    sampleType: 'Blood',
    basePrice: 1200,
    labPrice: 1050,
    turnaround: '24 Hours',
    isAvailable: true,
    fastingRequired: false,
  },
  {
    testName: 'Urine Routine & Microscopic Examination',
    testCode: 'LAB-URINE',
    category: 'Pathology',
    sampleType: 'Urine',
    basePrice: 250,
    labPrice: 220,
    turnaround: '4-6 Hours',
    isAvailable: true,
    fastingRequired: false,
  },
  {
    testName: 'Cardiac Risk Biomarker Panel (Troponin-I + hs-CRP)',
    testCode: 'LAB-CARDIO',
    category: 'Cardiology',
    sampleType: 'Blood',
    basePrice: 1400,
    labPrice: 1250,
    turnaround: '6 Hours',
    isAvailable: true,
    fastingRequired: false,
  },
  {
    testName: 'RT-PCR Viral Screen (Respiratory Panel)',
    testCode: 'LAB-RTPCR',
    category: 'Microbiology',
    sampleType: 'Nasal/Throat Swab',
    basePrice: 900,
    labPrice: 850,
    turnaround: '12-18 Hours',
    isAvailable: true,
    fastingRequired: false,
  },
];

// Helper to generate unique lab code
const generateLabCode = async () => {
  let unique = false;
  let code = '';
  while (!unique) {
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    code = `PLAB-${randomHex}`;
    const exists = await PartneredLab.findOne({ labCode: code });
    if (!exists) unique = true;
  }
  return code;
};

// Helper to fetch all catalog tests with defaults
const getCatalogTestsForLab = async () => {
  try {
    const catalogTests = await LabCatalogTest.find().lean();
    if (catalogTests && catalogTests.length > 0) {
      return catalogTests.map((t) => ({
        testId: t._id,
        testName: t.name,
        testCode: t.code,
        category: t.category,
        sampleType: t.sampleType || 'Blood',
        basePrice: t.price,
        labPrice: Math.round(t.price * 0.9), // Default 10% partner discount
        turnaround: t.turnaround || '12-24 Hours',
        isAvailable: true,
        fastingRequired: !!t.fastingRequired,
      }));
    }
  } catch (err) {
    console.error('Error fetching catalog tests:', err.message);
  }
  return DEFAULT_TEST_OFFERINGS;
};

// Helper: Seed initial partner labs if none exist or if new labs are missing
const seedInitialPartnerLabs = async () => {
  const defaultHospital = await Hospital.findOne();
  const hospitalList = await Hospital.find().limit(3).lean();
  const hospitalIds = hospitalList.map((h) => h._id);

  const initialOfferings = await getCatalogTestsForLab();

  const seedLabs = [
    {
      name: 'Metropolis Healthcare Labs',
      labCode: 'PLAB-METRO-01',
      licenseNumber: 'NABL-MH-2024-1082',
      category: 'Multi-Specialty Diagnostics',
      contactPerson: {
        name: 'Dr. Vivek Sengupta',
        designation: 'Laboratory Director & Chief Pathologist',
        phone: '+91 98200 44112',
        email: 'v.sengupta@metropolis.in',
      },
      phone: '+91 22 6157 8000',
      email: 'partnerships@metropolisindia.com',
      address: 'Central Reference Lab, 4th Floor, Commercial Hub, Lower Parel',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400013',
      operatingHours: '24/7 Processing Center',
      accreditations: ['NABL Accredited', 'CAP Accredited', 'ISO 15189'],
      partnershipStatus: 'Approved',
      status: 'Active',
      hospitals: hospitalIds.length > 0 ? hospitalIds : (defaultHospital ? [defaultHospital._id] : []),
      offeredTests: initialOfferings,
      notes: 'Tier-1 automated reference laboratory equipped with Roche Cobas 8000 and Abbott Alinity systems.',
      commissionRate: 12,
    },
    {
      name: 'Agilus Diagnostics (SRL Network)',
      labCode: 'PLAB-AGIL-02',
      licenseNumber: 'ICMR-NABL-AG-9931',
      category: 'Pathology & Biochemistry',
      contactPerson: {
        name: 'Sunita Deshmukh',
        designation: 'Network Operations Head',
        phone: '+91 98331 55220',
        email: 'sunita.d@agilus.com',
      },
      phone: '+91 22 6799 1234',
      email: 'network.mumbai@agilus.com',
      address: 'Plot 14-A, Marol Industrial Area, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400093',
      operatingHours: '06:30 AM - 10:00 PM',
      accreditations: ['NABL Accredited', 'ISO 15189'],
      partnershipStatus: 'Approved',
      status: 'Active',
      hospitals: defaultHospital ? [defaultHospital._id] : [],
      offeredTests: initialOfferings,
      notes: 'High-throughput biochemistry and immuno-assay automated track line.',
      commissionRate: 10,
    },
    {
      name: 'Dr. Lal PathLabs',
      labCode: 'PLAB-LAL-05',
      licenseNumber: 'NABL-DL-LAL-1029',
      category: 'Pathology & Biochemistry',
      contactPerson: {
        name: 'Dr. Arvind Mehra',
        designation: 'Chief Scientific Officer & Pathologist',
        phone: '+91 98111 22334',
        email: 'arvind.mehra@lalpathlabs.com',
      },
      phone: '+91 11 3988 5050',
      email: 'hospitalconnect@lalpathlabs.com',
      address: 'National Reference Laboratory, Block-E, Sector 18, Rohini',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110085',
      operatingHours: '24/7 Automated Processing',
      accreditations: ['NABL Accredited', 'CAP Accredited', 'ISO 9001'],
      partnershipStatus: 'Approved',
      status: 'Active',
      hospitals: defaultHospital ? [defaultHospital._id] : [],
      offeredTests: initialOfferings,
      notes: 'India’s premier diagnostic chain featuring full robotic track automation and 2500+ clinical test menu.',
      commissionRate: 12,
    },
    {
      name: 'Thyrocare Technologies',
      labCode: 'PLAB-THYRO-06',
      licenseNumber: 'NABL-MH-THY-4022',
      category: 'Pathology & Biochemistry',
      contactPerson: {
        name: 'Dr. Caesar Sengupta',
        designation: 'VP Medical Operations & Diagnostics',
        phone: '+91 98210 99441',
        email: 'caesar.s@thyrocare.com',
      },
      phone: '+91 22 2762 2762',
      email: 'tieups@thyrocare.com',
      address: 'D-37/1, TTC Industrial Area, MIDC Turbhe',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: '400703',
      operatingHours: '24/7 Central Processing Laboratory',
      accreditations: ['NABL Accredited', 'CAP Accredited', 'NGSP Certified'],
      partnershipStatus: 'Approved',
      status: 'Active',
      hospitals: defaultHospital ? [defaultHospital._id] : [],
      offeredTests: initialOfferings,
      notes: 'World’s largest automated thyroid, metabolic, and preventative wellness screening platform.',
      commissionRate: 15,
    },
    {
      name: 'Apollo Diagnostics',
      labCode: 'PLAB-APOL-07',
      licenseNumber: 'NABL-TS-APO-8821',
      category: 'Multi-Specialty Diagnostics',
      contactPerson: {
        name: 'Dr. Shalini Reddy',
        designation: 'Head of Clinical Diagnostics',
        phone: '+91 99490 12882',
        email: 'shalini_r@apollodiagnostics.in',
      },
      phone: '+91 40 4444 2424',
      email: 'partnerships@apollodiagnostics.in',
      address: 'Apollo Reference Lab, Road No. 2, Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
      operatingHours: '06:00 AM - 11:00 PM',
      accreditations: ['NABL Accredited', 'CAP Accredited', 'ISO 15189'],
      partnershipStatus: 'Approved',
      status: 'Active',
      hospitals: defaultHospital ? [defaultHospital._id] : [],
      offeredTests: initialOfferings,
      notes: 'Hospital-backed diagnostic quality with emergency STAT testing capability.',
      commissionRate: 10,
    },
    {
      name: 'Max Lab Diagnostics',
      labCode: 'PLAB-MAX-08',
      licenseNumber: 'NABL-DL-MAX-7714',
      category: 'Pathology & Biochemistry',
      contactPerson: {
        name: 'Dr. Rajesh Gupta',
        designation: 'Senior Consultant Pathologist',
        phone: '+91 98101 44552',
        email: 'rajesh.gupta@maxlab.co.in',
      },
      phone: '+91 11 4055 4055',
      email: 'hospitaldesk@maxlab.co.in',
      address: 'Max Super Specialty Complex, 1 Press Enclave Road, Saket',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110017',
      operatingHours: '24/7 STAT Lab Service',
      accreditations: ['NABL Accredited', 'NABH Accredited', 'ISO 15189'],
      partnershipStatus: 'Approved',
      status: 'Active',
      hospitals: defaultHospital ? [defaultHospital._id] : [],
      offeredTests: initialOfferings,
      notes: 'Tertiary hospital lab network with specialized surgical pathology and frozen section support.',
      commissionRate: 11,
    },
    {
      name: 'Neuberg Diagnostics',
      labCode: 'PLAB-NEU-09',
      licenseNumber: 'NABL-KA-NEU-6190',
      category: 'Molecular Diagnostics',
      contactPerson: {
        name: 'Dr. Saravanan K',
        designation: 'Chief of Molecular Biology',
        phone: '+91 98400 33119',
        email: 'k.saravanan@neubergdiagnostics.com',
      },
      phone: '+91 80 4555 8888',
      email: 'network@neubergdiagnostics.com',
      address: 'Neuberg Anand Reference Lab, 54 Bowring Tower, Shivaji Nagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      operatingHours: '06:30 AM - 10:30 PM',
      accreditations: ['NABL Accredited', 'CAP Accredited', 'ISO 15189'],
      partnershipStatus: 'Approved',
      status: 'Active',
      hospitals: [],
      offeredTests: initialOfferings,
      notes: 'Advanced molecular diagnostics, next-generation sequencing (NGS), and prenatal screening.',
      commissionRate: 12,
    },
    {
      name: 'Vijaya Diagnostic Centre',
      labCode: 'PLAB-VIJ-10',
      licenseNumber: 'NABL-TS-VIJ-3392',
      category: 'Multi-Specialty Diagnostics',
      contactPerson: {
        name: 'S. Venkat Rao',
        designation: 'General Manager - Institutional Tie-ups',
        phone: '+91 98480 66221',
        email: 'venkat.rao@vijayadiagnostic.com',
      },
      phone: '+91 40 2342 0420',
      email: 'corporate@vijayadiagnostic.com',
      address: '3-6-16 & 17, Street No. 19, Himayatnagar',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500029',
      operatingHours: '06:00 AM - 10:00 PM',
      accreditations: ['NABL Accredited', 'ISO 15189'],
      partnershipStatus: 'Approved',
      status: 'Active',
      hospitals: [],
      offeredTests: initialOfferings,
      notes: 'Integrated comprehensive testing center providing digital pathology, histology, and radiology telemetry.',
      commissionRate: 10,
    },
    {
      name: 'Oncquest Laboratories',
      labCode: 'PLAB-ONC-11',
      licenseNumber: 'NABL-DL-ONC-9011',
      category: 'Molecular Diagnostics',
      contactPerson: {
        name: 'Dr. Meenakshi Sharma',
        designation: 'Principal Scientist & Oncopathologist',
        phone: '+91 98118 77662',
        email: 'meenakshi.s@oncquest.net',
      },
      phone: '+91 11 3061 1410',
      email: 'partner@oncquest.net',
      address: 'B-2/1, Africa Avenue Road, Safdarjung Enclave',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110029',
      operatingHours: '08:00 AM - 08:30 PM',
      accreditations: ['NABL Accredited', 'CAP Accredited'],
      partnershipStatus: 'Approved',
      status: 'Active',
      hospitals: [],
      offeredTests: initialOfferings,
      notes: 'Pioneers in specialized oncology pathology, flow cytometry, immunohistochemistry, and FISH assays.',
      commissionRate: 14,
    },
    {
      name: 'Tata 1mg Diagnostics',
      labCode: 'PLAB-TATA-12',
      licenseNumber: 'NABL-HR-1MG-5501',
      category: 'Multi-Specialty Diagnostics',
      contactPerson: {
        name: 'Ankit Saxena',
        designation: 'Network Partnerships Lead',
        phone: '+91 99100 88220',
        email: 'ankit.saxena@1mg.com',
      },
      phone: '1800 212 4636',
      email: 'b2bdiagnostics@1mg.com',
      address: 'Tower B, 5th Floor, Global Business Park, MG Road',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      operatingHours: '24/7 Digital Sample Pickups & Processing',
      accreditations: ['NABL Accredited', 'ISO 15189'],
      partnershipStatus: 'Approved',
      status: 'Active',
      hospitals: [],
      offeredTests: initialOfferings,
      notes: 'Rapid digital logistics integration with barcode sample tracking and automated API report delivery.',
      commissionRate: 12,
    },
    {
      name: 'Suburban Diagnostics Centre',
      labCode: 'PLAB-SUB-03',
      licenseNumber: 'NABL-MH-SUB-5541',
      category: 'Molecular Diagnostics',
      contactPerson: {
        name: 'Rohan Salvi',
        designation: 'Partnerships & Hospital Relations',
        phone: '+91 98920 11993',
        email: 'rohan.salvi@suburbandiagnostics.com',
      },
      phone: '+91 22 2617 8899',
      email: 'hospitals@suburbandiagnostics.com',
      address: 'Shop 3-6, Sterling Plaza, Linking Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      operatingHours: '07:00 AM - 09:30 PM',
      accreditations: ['NABL Accredited'],
      partnershipStatus: 'Approved',
      rejectionReason: '',
      status: 'Active',
      hospitals: [],
      offeredTests: initialOfferings.slice(0, 7),
      notes: 'Partnership request approved for network molecular testing, RT-PCR and cardiology markers.',
      commissionRate: 10,
    },
    {
      name: 'Apex Precision Genomics & Imaging',
      labCode: 'PLAB-APEX-04',
      licenseNumber: 'AERB-ICMR-PX-4412',
      category: 'Genetics & Genomics',
      contactPerson: {
        name: 'Dr. Ananya Nair',
        designation: 'Head of Clinical Genetics',
        phone: '+91 97690 33881',
        email: 'ananya@apexgenomics.org',
      },
      phone: '+91 22 4911 5000',
      email: 'collab@apexgenomics.org',
      address: '7th Floor, Bio-Innovation Tower, BKC',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051',
      operatingHours: '08:00 AM - 08:00 PM',
      accreditations: ['ICMR Approved', 'ISO 15189'],
      partnershipStatus: 'Approved',
      rejectionReason: '',
      status: 'Active',
      hospitals: [],
      offeredTests: initialOfferings.slice(0, 5),
      notes: 'Genomics, cytogenetics, and specialized molecular karyotyping center.',
      commissionRate: 15,
    },
  ];

  for (const lab of seedLabs) {
    const existing = await PartneredLab.findOne({
      $or: [{ labCode: lab.labCode }, { name: lab.name }],
    });
    if (!existing) {
      await PartneredLab.create(lab);
    }
  }
};

// @desc    Get all partnered laboratories with filters and network statistics
// @route   GET /api/partnered-labs
// @access  Private
const getPartneredLabs = async (req, res) => {
  try {
    await seedInitialPartnerLabs();

    const { search, partnershipStatus, status, hospitalId, category } = req.query;

    let filter = {};

    if (partnershipStatus && partnershipStatus !== 'All') {
      filter.partnershipStatus = partnershipStatus;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (hospitalId && hospitalId !== 'All') {
      filter.hospitals = hospitalId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { name: regex },
        { labCode: regex },
        { licenseNumber: regex },
        { city: regex },
        { email: regex },
        { phone: regex },
        { 'contactPerson.name': regex },
      ];
    }

    const labs = await PartneredLab.find(filter)
      .populate('hospitals', 'name code city phone address')
      .sort({ createdAt: -1 })
      .lean();

    // Compute global network metrics
    const allLabs = await PartneredLab.find().lean();
    const totalLabs = allLabs.length;
    const approvedLabs = allLabs.filter((l) => l.partnershipStatus === 'Approved').length;
    const pendingLabs = allLabs.filter((l) => l.partnershipStatus === 'Pending').length;
    const rejectedLabs = allLabs.filter((l) => l.partnershipStatus === 'Rejected').length;
    const activeLabs = allLabs.filter((l) => l.status === 'Active').length;
    const inactiveLabs = allLabs.filter((l) => l.status === 'Inactive').length;

    // Distinct hospitals connected to at least one active approved partner lab
    const hospitalSet = new Set();
    allLabs.forEach((lab) => {
      if (lab.partnershipStatus === 'Approved' && Array.isArray(lab.hospitals)) {
        lab.hospitals.forEach((hId) => hospitalSet.add(hId.toString()));
      }
    });

    // Total distinct tests catalogued across all labs
    const testCodeSet = new Set();
    allLabs.forEach((lab) => {
      if (Array.isArray(lab.offeredTests)) {
        lab.offeredTests.forEach((t) => {
          if (t.isAvailable) testCodeSet.add(t.testCode);
        });
      }
    });

    const stats = {
      totalLabs,
      approvedLabs,
      pendingLabs,
      rejectedLabs,
      activeLabs,
      inactiveLabs,
      totalHospitalsCovered: hospitalSet.size,
      totalTestsConfigured: testCodeSet.size,
    };

    res.json({ labs, stats });
  } catch (error) {
    console.error('Get Partnered Labs Error:', error);
    res.status(500).json({ message: error.message || 'Failed to retrieve partnered laboratories' });
  }
};

// @desc    Get single partnered laboratory by ID
// @route   GET /api/partnered-labs/:id
// @access  Private
const getPartneredLabById = async (req, res) => {
  try {
    const lab = await PartneredLab.findById(req.params.id)
      .populate('hospitals', 'name code city phone address')
      .lean();

    if (!lab) {
      return res.status(404).json({ message: 'Partnered laboratory not found' });
    }

    res.json(lab);
  } catch (error) {
    console.error('Get Partnered Lab By ID Error:', error);
    res.status(500).json({ message: error.message || 'Failed to retrieve laboratory details' });
  }
};

// @desc    Register a new external laboratory
// @route   POST /api/partnered-labs
// @access  Private
const createPartneredLab = async (req, res) => {
  try {
    const {
      name,
      labCode,
      licenseNumber,
      category,
      contactPerson,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      operatingHours,
      accreditations,
      partnershipStatus,
      status,
      hospitals,
      offeredTests,
      notes,
      commissionRate,
    } = req.body;

    if (!name || !phone || !email || !city || !licenseNumber) {
      return res.status(400).json({
        message: 'Lab name, license number, phone, email, and city are mandatory fields',
      });
    }

    const existingName = await PartneredLab.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existingName) {
      return res.status(400).json({ message: 'A laboratory with this name is already registered' });
    }

    const finalCode = labCode && labCode.trim() ? labCode.trim().toUpperCase() : await generateLabCode();
    const existingCode = await PartneredLab.findOne({ labCode: finalCode });
    if (existingCode) {
      return res.status(400).json({ message: `Lab code "${finalCode}" is already in use` });
    }

    // Default test catalog offerings if none provided
    let finalTests = offeredTests;
    if (!finalTests || !Array.isArray(finalTests) || finalTests.length === 0) {
      finalTests = await getCatalogTestsForLab();
    }

    const newLab = await PartneredLab.create({
      name: name.trim(),
      labCode: finalCode,
      licenseNumber: licenseNumber.trim(),
      category: category || 'Multi-Specialty Diagnostics',
      contactPerson: contactPerson || {},
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      address: address ? address.trim() : '',
      city: city.trim(),
      state: state ? state.trim() : 'Maharashtra',
      pincode: pincode ? pincode.trim() : '',
      operatingHours: operatingHours || '07:00 AM - 09:00 PM',
      accreditations: Array.isArray(accreditations) && accreditations.length > 0 ? accreditations : ['NABL Accredited'],
      partnershipStatus: partnershipStatus || 'Pending',
      status: status || 'Active',
      hospitals: Array.isArray(hospitals) ? hospitals : [],
      offeredTests: finalTests,
      notes: notes ? notes.trim() : '',
      commissionRate: commissionRate !== undefined ? Number(commissionRate) : 10,
    });

    try {
      await AuditLog.create({
        action: 'PARTNERED_LAB_REGISTERED',
        actor: req.admin?.email || 'admin@medy.com',
        role: req.admin?.role || 'Super Administrator',
        target: `${newLab.name} (${newLab.labCode})`,
        details: `Registered external laboratory in ${newLab.city}. Status: ${newLab.partnershipStatus}`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    const populated = await PartneredLab.findById(newLab._id).populate('hospitals', 'name code city phone address');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create Partnered Lab Error:', error);
    res.status(500).json({ message: error.message || 'Failed to register laboratory' });
  }
};

// @desc    Edit laboratory information
// @route   PUT /api/partnered-labs/:id
// @access  Private
const updatePartneredLab = async (req, res) => {
  try {
    const lab = await PartneredLab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ message: 'Partnered laboratory not found' });
    }

    const {
      name,
      licenseNumber,
      category,
      contactPerson,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      operatingHours,
      accreditations,
      notes,
      commissionRate,
    } = req.body;

    if (name && name.trim() !== lab.name) {
      const existingName = await PartneredLab.findOne({
        name: new RegExp(`^${name.trim()}$`, 'i'),
        _id: { $ne: lab._id },
      });
      if (existingName) {
        return res.status(400).json({ message: 'Another laboratory already uses this name' });
      }
      lab.name = name.trim();
    }

    if (licenseNumber !== undefined) lab.licenseNumber = licenseNumber.trim();
    if (category !== undefined) lab.category = category;
    if (contactPerson !== undefined) lab.contactPerson = contactPerson;
    if (phone !== undefined) lab.phone = phone.trim();
    if (email !== undefined) lab.email = email.trim().toLowerCase();
    if (address !== undefined) lab.address = address.trim();
    if (city !== undefined) lab.city = city.trim();
    if (state !== undefined) lab.state = state.trim();
    if (pincode !== undefined) lab.pincode = pincode.trim();
    if (operatingHours !== undefined) lab.operatingHours = operatingHours;
    if (Array.isArray(accreditations)) lab.accreditations = accreditations;
    if (notes !== undefined) lab.notes = notes.trim();
    if (commissionRate !== undefined) lab.commissionRate = Number(commissionRate);

    await lab.save();

    try {
      await AuditLog.create({
        action: 'PARTNERED_LAB_UPDATED',
        actor: req.admin?.email || 'admin@medy.com',
        role: req.admin?.role || 'Super Administrator',
        target: `${lab.name} (${lab.labCode})`,
        details: `Updated laboratory profile and contact details`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    const populated = await PartneredLab.findById(lab._id).populate('hospitals', 'name code city phone address');
    res.json(populated);
  } catch (error) {
    console.error('Update Partnered Lab Error:', error);
    res.status(500).json({ message: error.message || 'Failed to update laboratory information' });
  }
};

// @desc    Approve or reject partnership request
// @route   PATCH /api/partnered-labs/:id/partnership-status
// @access  Private
const updatePartnershipStatus = async (req, res) => {
  try {
    const { partnershipStatus, rejectionReason } = req.body;

    if (!['Pending', 'Approved', 'Rejected', 'Suspended'].includes(partnershipStatus)) {
      return res.status(400).json({ message: 'Invalid partnership status' });
    }

    const lab = await PartneredLab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ message: 'Partnered laboratory not found' });
    }

    const previousStatus = lab.partnershipStatus;
    lab.partnershipStatus = partnershipStatus;

    if (partnershipStatus === 'Approved') {
      lab.status = 'Active';
      lab.rejectionReason = '';
    } else if (partnershipStatus === 'Rejected') {
      lab.rejectionReason = rejectionReason ? rejectionReason.trim() : 'Partnership criteria not fulfilled';
    } else if (partnershipStatus === 'Pending') {
      lab.rejectionReason = '';
    }

    await lab.save();

    try {
      await AuditLog.create({
        action: 'PARTNERSHIP_STATUS_CHANGED',
        actor: req.admin?.email || 'admin@medy.com',
        role: req.admin?.role || 'Super Administrator',
        target: `${lab.name} (${lab.labCode})`,
        details: `Partnership status changed from ${previousStatus} to ${partnershipStatus}${
          rejectionReason ? `. Reason: ${rejectionReason}` : ''
        }`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    const populated = await PartneredLab.findById(lab._id).populate('hospitals', 'name code city phone address');
    res.json(populated);
  } catch (error) {
    console.error('Update Partnership Status Error:', error);
    res.status(500).json({ message: error.message || 'Failed to update partnership status' });
  }
};

// @desc    Activate or deactivate laboratories
// @route   PATCH /api/partnered-labs/:id/status
// @access  Private
const togglePartneredLabStatus = async (req, res) => {
  try {
    const lab = await PartneredLab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ message: 'Partnered laboratory not found' });
    }

    lab.status = lab.status === 'Active' ? 'Inactive' : 'Active';
    await lab.save();

    try {
      await AuditLog.create({
        action: 'PARTNERED_LAB_STATUS_TOGGLED',
        actor: req.admin?.email || 'admin@medy.com',
        role: req.admin?.role || 'Super Administrator',
        target: `${lab.name} (${lab.labCode})`,
        details: `Operational status updated to ${lab.status}`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    const populated = await PartneredLab.findById(lab._id).populate('hospitals', 'name code city phone address');
    res.json(populated);
  } catch (error) {
    console.error('Toggle Partnered Lab Status Error:', error);
    res.status(500).json({ message: error.message || 'Failed to toggle status' });
  }
};

// @desc    Assign one partnered lab to multiple hospitals
// @route   PUT /api/partnered-labs/:id/assign-hospitals
// @access  Private
const assignHospitalsToLab = async (req, res) => {
  try {
    const { hospitalIds } = req.body;

    if (!Array.isArray(hospitalIds)) {
      return res.status(400).json({ message: 'hospitalIds must be an array of hospital ObjectIDs' });
    }

    const lab = await PartneredLab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ message: 'Partnered laboratory not found' });
    }

    lab.hospitals = hospitalIds;
    await lab.save();

    try {
      await AuditLog.create({
        action: 'LAB_HOSPITALS_MAPPED',
        actor: req.admin?.email || 'admin@medy.com',
        role: req.admin?.role || 'Super Administrator',
        target: `${lab.name} (${lab.labCode})`,
        details: `Assigned lab to ${hospitalIds.length} hospital(s)`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    const populated = await PartneredLab.findById(lab._id).populate('hospitals', 'name code city phone address');
    res.json(populated);
  } catch (error) {
    console.error('Assign Hospitals To Lab Error:', error);
    res.status(500).json({ message: error.message || 'Failed to assign hospitals to laboratory' });
  }
};

// @desc    Assign multiple partnered labs to one hospital
// @route   POST /api/partnered-labs/assign-to-hospital
// @access  Private
const assignLabsToHospital = async (req, res) => {
  try {
    const { hospitalId, labIds } = req.body;

    if (!hospitalId) {
      return res.status(400).json({ message: 'hospitalId is required' });
    }

    if (!Array.isArray(labIds)) {
      return res.status(400).json({ message: 'labIds must be an array of lab IDs' });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const selectedLabIdStrings = labIds.map((id) => id.toString());

    // Update all labs in one batch
    const allLabs = await PartneredLab.find();

    for (const lab of allLabs) {
      const isSelected = selectedLabIdStrings.includes(lab._id.toString());
      const currentHospitals = (lab.hospitals || []).map((h) => h.toString());

      if (isSelected && !currentHospitals.includes(hospitalId.toString())) {
        lab.hospitals.push(hospitalId);
        await lab.save();
      } else if (!isSelected && currentHospitals.includes(hospitalId.toString())) {
        lab.hospitals = lab.hospitals.filter((h) => h.toString() !== hospitalId.toString());
        await lab.save();
      }
    }

    try {
      await AuditLog.create({
        action: 'HOSPITAL_LABS_MAPPED',
        actor: req.admin?.email || 'admin@medy.com',
        role: req.admin?.role || 'Super Administrator',
        target: `${hospital.name} (${hospital.code})`,
        details: `Assigned ${selectedLabIdStrings.length} partnered lab(s) to hospital`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    // Return the updated list of all labs with populated hospitals
    const updatedLabs = await PartneredLab.find()
      .populate('hospitals', 'name code city phone address')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      message: `Successfully updated lab assignments for ${hospital.name}`,
      labs: updatedLabs,
    });
  } catch (error) {
    console.error('Assign Labs to Hospital Error:', error);
    res.status(500).json({ message: error.message || 'Failed to update hospital lab mappings' });
  }
};

// @desc    Configure which tests each lab offers
// @route   PUT /api/partnered-labs/:id/tests
// @access  Private
const configureLabTests = async (req, res) => {
  try {
    const { offeredTests } = req.body;

    if (!Array.isArray(offeredTests)) {
      return res.status(400).json({ message: 'offeredTests must be an array of test configuration items' });
    }

    const lab = await PartneredLab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ message: 'Partnered laboratory not found' });
    }

    lab.offeredTests = offeredTests.map((t) => ({
      testId: t.testId || null,
      testName: t.testName,
      testCode: t.testCode.toUpperCase().trim(),
      category: t.category || 'General',
      sampleType: t.sampleType || 'Blood',
      basePrice: Number(t.basePrice || 0),
      labPrice: Number(t.labPrice || 0),
      turnaround: t.turnaround || '12-24 Hours',
      isAvailable: t.isAvailable !== false,
      fastingRequired: !!t.fastingRequired,
    }));

    await lab.save();

    const activeTestsCount = lab.offeredTests.filter((t) => t.isAvailable).length;

    try {
      await AuditLog.create({
        action: 'LAB_TEST_CATALOG_CONFIGURED',
        actor: req.admin?.email || 'admin@medy.com',
        role: req.admin?.role || 'Super Administrator',
        target: `${lab.name} (${lab.labCode})`,
        details: `Configured test catalog: ${activeTestsCount} tests offered / ${lab.offeredTests.length} total`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    const populated = await PartneredLab.findById(lab._id).populate('hospitals', 'name code city phone address');
    res.json(populated);
  } catch (error) {
    console.error('Configure Lab Tests Error:', error);
    res.status(500).json({ message: error.message || 'Failed to configure lab tests' });
  }
};

// @desc    Delete a partnered laboratory
// @route   DELETE /api/partnered-labs/:id
// @access  Private
const deletePartneredLab = async (req, res) => {
  try {
    const lab = await PartneredLab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ message: 'Partnered laboratory not found' });
    }

    const labName = lab.name;
    const labCode = lab.labCode;

    await PartneredLab.findByIdAndDelete(req.params.id);

    try {
      await AuditLog.create({
        action: 'PARTNERED_LAB_DELETED',
        actor: req.admin?.email || 'admin@medy.com',
        role: req.admin?.role || 'Super Administrator',
        target: `${labName} (${labCode})`,
        details: `Laboratory deleted from the network`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    res.json({ message: `Laboratory "${labName}" has been removed from network` });
  } catch (error) {
    console.error('Delete Partnered Lab Error:', error);
    res.status(500).json({ message: error.message || 'Failed to delete laboratory' });
  }
};

module.exports = {
  getPartneredLabs,
  getPartneredLabById,
  createPartneredLab,
  updatePartneredLab,
  updatePartnershipStatus,
  togglePartneredLabStatus,
  assignHospitalsToLab,
  assignLabsToHospital,
  configureLabTests,
  deletePartneredLab,
};
