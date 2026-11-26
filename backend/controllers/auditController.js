const AuditLog = require('../models/AuditLog');

// Comprehensive project-aligned seed data for audit trail with dynamic relative timestamps
const getDefaultAuditLogs = () => [
  {
    action: 'SUPER_ADMIN_LOGIN',
    actor: 'mallikarjun272004@gmail.com',
    role: 'Super Administrator',
    target: 'Central Administration Command',
    details: 'Mallikarjun authenticated successfully via 256-bit encrypted session token',
    ipAddress: '127.0.0.1',
    status: 'Success',
    timestamp: new Date(Date.now() - 6 * 60 * 1000),
  },
  {
    action: 'SUPER_ADMIN_PROFILE_UPDATE',
    actor: 'mallikarjun272004@gmail.com',
    role: 'Super Administrator',
    target: 'Self Account Profile',
    details: 'Super Admin profile updated (Name: Mallikarjun, Role: MEDY_ADMIN, Avatar: Clean / Empty)',
    ipAddress: '127.0.0.1',
    status: 'Success',
    timestamp: new Date(Date.now() - 22 * 60 * 1000),
  },
  {
    action: 'HOSPITAL_ADMIN_CREATED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'Dr. Rajesh Sharma (HADM-001)',
    details: 'Super Admin provisioned hospital administrator account for City Care Hospital (Code: HOSP-CCH, Login: rajesh@citycare.com). Nodemailer dispatch: Delivered',
    ipAddress: '127.0.0.1',
    status: 'Success',
    timestamp: new Date(Date.now() - 55 * 60 * 1000),
  },
  {
    action: 'HOSPITAL_ADMIN_CREATED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'Priya Sundaram (HADM-002)',
    details: 'Super Admin provisioned hospital administrator account for City Care Hospital (Code: HOSP-CCH, Login: priya.admin@citycare.com). Nodemailer dispatch: Delivered',
    ipAddress: '127.0.0.1',
    status: 'Success',
    timestamp: new Date(Date.now() - 110 * 60 * 1000),
  },
  {
    action: 'MEDY_CARD_ISSUED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'MEDY-CCH-0010 (Aarav Sharma)',
    details: 'Issued digital Medy Card with Platinum clinical health coverage and biometric QR verification for City Care Hospital',
    ipAddress: '192.168.1.104',
    status: 'Success',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000),
  },
  {
    action: 'PATIENT_REGISTERED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'Aarav Sharma (City Care Hospital)',
    details: 'Patient onboarding intake completed and assigned to Department of Cardiology • Inpatient admission active',
    ipAddress: '192.168.1.104',
    status: 'Success',
    timestamp: new Date(Date.now() - 4.5 * 3600 * 1000),
  },
  {
    action: 'LAB_TEST_ORDERED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'Cardiac Enzyme & Troponin Panel (Aarav Sharma)',
    details: 'Automated diagnostic order dispatched to partner clinical pathology laboratory for City Care Hospital',
    ipAddress: '192.168.1.104',
    status: 'Success',
    timestamp: new Date(Date.now() - 6 * 3600 * 1000),
  },
  {
    action: 'LAB_REPORT_VERIFIED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'Comprehensive Metabolic Panel (Aarav Sharma)',
    details: 'Diagnostic lab test results securely uploaded, verified, and encrypted into patient health record',
    ipAddress: '192.168.1.104',
    status: 'Success',
    timestamp: new Date(Date.now() - 7.5 * 3600 * 1000),
  },
  {
    action: 'APPOINTMENT_SCHEDULED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'Dr. Rajesh Sharma • Cardiology Specialist',
    details: 'Clinical consultation confirmed for patient Aarav Sharma at City Care Hospital',
    ipAddress: '192.168.1.104',
    status: 'Success',
    timestamp: new Date(Date.now() - 9 * 3600 * 1000),
  },
  {
    action: 'HOSPITAL_CREATED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'City Care Hospital (HOSP-CCH)',
    details: 'Registered partner hospital in Mumbai with status Active • Appointed Admin: rajesh@citycare.com • Telemetry capacity: 250 beds',
    ipAddress: '127.0.0.1',
    status: 'Success',
    timestamp: new Date(Date.now() - 13 * 3600 * 1000),
  },
  {
    action: 'BED_CAPACITY_UPDATED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'City Care Hospital (HOSP-CCH)',
    details: 'Synchronized emergency ICU bed allocation (45 ICU beds, 205 general telemetry beds) for active intake',
    ipAddress: '127.0.0.1',
    status: 'Success',
    timestamp: new Date(Date.now() - 16 * 3600 * 1000),
  },
  {
    action: 'MEDY_CARD_BATCH_ISSUED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'City Care Hospital (Batch #MED-2026-B1)',
    details: 'Approved batch issuance of 25 serialized digital Medy Cards with emergency trauma and inpatient coverage',
    ipAddress: '192.168.1.104',
    status: 'Success',
    timestamp: new Date(Date.now() - 20 * 3600 * 1000),
  },
  {
    action: 'PARTNERED_LAB_REGISTERED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'Metropolis Healthcare Central Pathology',
    details: 'Certified diagnostic laboratory integrated with automated HL7 pathology report dispatching',
    ipAddress: '192.168.1.104',
    status: 'Success',
    timestamp: new Date(Date.now() - 25 * 3600 * 1000),
  },
  {
    action: 'HOSPITAL_CREATED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'Apollo Specialty Hospital (HOSP-C9F5)',
    details: 'Partner facility in Bangalore verified and integrated with 350-bed telemetry capacity • Status: Active',
    ipAddress: '192.168.1.104',
    status: 'Success',
    timestamp: new Date(Date.now() - 30 * 3600 * 1000),
  },
  {
    action: 'MEDY_CARD_ISSUED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'MEDY-APO-0024 (Priya Patel)',
    details: 'Encrypted digital Medy Card issued with Gold clinical healthcare coverage for Apollo Specialty Hospital',
    ipAddress: '192.168.1.104',
    status: 'Success',
    timestamp: new Date(Date.now() - 36 * 3600 * 1000),
  },
  {
    action: 'PATIENT_REGISTERED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'Priya Patel (Apollo Specialty Hospital)',
    details: 'Patient onboarding intake completed and assigned to Department of Neurology',
    ipAddress: '192.168.1.104',
    status: 'Success',
    timestamp: new Date(Date.now() - 42 * 3600 * 1000),
  },
  {
    action: 'APPOINTMENT_SCHEDULED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'Dr. Anita Desai • Neurology Specialist',
    details: 'Clinical neurological consultation confirmed for patient Priya Patel at Apollo Specialty Hospital',
    ipAddress: '192.168.1.104',
    status: 'Success',
    timestamp: new Date(Date.now() - 48 * 3600 * 1000),
  },
  {
    action: 'SECURITY_POLICY_ENFORCED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'Medy Central Security Gateway',
    details: 'Rotated JWT signing secret and enforced 30-day session timeout with bcrypt hashing & role verification',
    ipAddress: '127.0.0.1',
    status: 'Success',
    timestamp: new Date(Date.now() - 62 * 3600 * 1000),
  },
  {
    action: 'MEDY_CARD_STATUS_CHANGED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'MEDY-111111-0005 (Rohan Verma)',
    details: 'Placed card on temporary review hold pending updated emergency contact and insurance verification',
    ipAddress: '192.168.1.104',
    status: 'Warning',
    timestamp: new Date(Date.now() - 72 * 3600 * 1000),
  },
  {
    action: 'HOSPITAL_STATUS_CHANGED',
    actor: 'Mallikarjun',
    role: 'Super Administrator',
    target: 'Metro Care Multi-Specialty (HOSP-5BB4)',
    details: 'Facility operational node confirmed Active following annual healthcare facility accreditation audit',
    ipAddress: '192.168.1.104',
    status: 'Success',
    timestamp: new Date(Date.now() - 84 * 3600 * 1000),
  },
];

// @desc    Get all audit logs
// @route   GET /api/audit-logs
// @access  Private (Super Admin)
const getAuditLogs = async (req, res) => {
  try {
    // Only seed initial default logs if the audit collection is completely empty
    const count = await AuditLog.countDocuments();
    if (count === 0) {
      await AuditLog.insertMany(getDefaultAuditLogs());
    }

    const { action, search } = req.query;
    const filter = {};
    if (action && action !== 'All') {
      filter.action = action;
    }
    if (search) {
      filter.$or = [
        { action: new RegExp(search, 'i') },
        { actor: new RegExp(search, 'i') },
        { target: new RegExp(search, 'i') },
        { details: new RegExp(search, 'i') },
      ];
    }

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1, createdAt: -1 })
      .limit(500)
      .lean();
    res.json(logs);
  } catch (error) {
    console.error('Get Audit Logs Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch audit logs' });
  }
};

// @desc    Create a new audit log entry
// @route   POST /api/audit-logs
// @access  Private
const createAuditLog = async (req, res) => {
  try {
    const { action, target, details, status } = req.body;
    const log = await AuditLog.create({
      action,
      actor: req.admin?.email || 'admin@medy.com',
      role: req.admin?.role === 'HOSPITAL_ADMIN' ? 'Hospital Administrator' : 'Super Administrator',
      target: target || 'Platform',
      details: details || '',
      ipAddress: req.ip || '127.0.0.1',
      status: status || 'Success',
      timestamp: new Date(),
    });
    res.status(201).json(log);
  } catch (error) {
    console.error('Create Audit Log Error:', error);
    res.status(500).json({ message: error.message || 'Failed to create audit log' });
  }
};

module.exports = {
  getAuditLogs,
  createAuditLog,
};

