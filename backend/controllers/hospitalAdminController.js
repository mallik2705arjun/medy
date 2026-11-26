const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Hospital = require('../models/Hospital');
const AuditLog = require('../models/AuditLog');
const { sendHospitalAdminAppointmentEmail } = require('../utils/emailService');

// Helper to generate a unique Hospital Admin ID (e.g. HADM-201)
const generateHospitalAdminId = async () => {
  let unique = false;
  let adminId = '';
  let counter = 1;

  const count = await Admin.countDocuments({ role: 'HOSPITAL_ADMIN' });
  counter = count + 1;

  while (!unique) {
    const padded = String(counter).padStart(3, '0');
    adminId = `HADM-${padded}`;
    const exists = await Admin.findOne({ adminId });
    if (!exists) {
      unique = true;
    } else {
      counter++;
    }
  }
  return adminId;
};

// @desc    Get all hospital administrators
// @route   GET /api/hospital-admins
// @access  Private (Super Admin)
const getHospitalAdmins = async (req, res) => {
  try {
    const { search, hospitalId, status } = req.query;
    const filter = { role: 'HOSPITAL_ADMIN' };

    if (hospitalId && hospitalId !== 'All') {
      if (mongoose.Types.ObjectId.isValid(hospitalId)) {
        filter.hospitalId = hospitalId;
      } else {
        filter.hospitalName = new RegExp(`^${hospitalId.trim()}$`, 'i');
      }
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    let admins = await Admin.find(filter)
      .populate('hospitalId', 'name code city phone email status')
      .sort({ createdAt: -1 })
      .select('-password')
      .lean();

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      admins = admins.filter(
        (a) =>
          (a.fullName || '').toLowerCase().includes(q) ||
          (a.username || '').toLowerCase().includes(q) ||
          (a.email || '').toLowerCase().includes(q) ||
          (a.adminId || '').toLowerCase().includes(q) ||
          (a.hospitalName || '').toLowerCase().includes(q) ||
          (a.hospitalCode || '').toLowerCase().includes(q) ||
          (a.designation || '').toLowerCase().includes(q)
      );
    }

    res.json(admins);
  } catch (error) {
    console.error('Error fetching hospital admins:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch hospital administrators' });
  }
};

// @desc    Get single hospital administrator
// @route   GET /api/hospital-admins/:id
// @access  Private
const getHospitalAdminById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid administrator ID format' });
    }

    const admin = await Admin.findOne({ _id: req.params.id, role: 'HOSPITAL_ADMIN' })
      .populate('hospitalId', 'name code city phone email')
      .select('-password');

    if (!admin) {
      return res.status(404).json({ message: 'Hospital administrator not found' });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Create a new hospital administrator
// @route   POST /api/hospital-admins
// @access  Private (Super Admin)
const createHospitalAdmin = async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      password,
      phone,
      hospitalId,
      designation,
      avatar,
      status,
    } = req.body;

    if (!fullName || !email || !hospitalId) {
      return res.status(400).json({
        message: 'Full Name, Email, and Assigned Hospital are required.',
      });
    }

    if (password && password.trim().length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long if specified.' });
    }

    // Verify hospital exists by ID or name
    let hospital = null;
    if (mongoose.Types.ObjectId.isValid(hospitalId)) {
      hospital = await Hospital.findById(hospitalId);
    } else {
      hospital = await Hospital.findOne({
        $or: [
          { name: new RegExp(`^${hospitalId.trim()}$`, 'i') },
          { code: hospitalId.trim().toUpperCase() },
        ],
      });
    }

    if (!hospital) {
      return res.status(404).json({ message: 'Selected hospital does not exist.' });
    }

    // Auto-generate secure temporary password if initial password option was omitted
    const rawPassword = (password && password.trim().length >= 6)
      ? password.trim()
      : `${hospital.code.replace(/[^A-Za-z0-9]/g, '')}@${Math.floor(1000 + Math.random() * 9000)}`;

    // Check duplicate email
    const existingEmail = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: 'An administrator with this email already exists.' });
    }

    // Determine or generate unique username
    let finalUsername = (username && username.trim())
      ? username.trim().toLowerCase()
      : email.trim().split('@')[0].toLowerCase();

    const existingUsername = await Admin.findOne({ username: finalUsername });
    if (existingUsername) {
      finalUsername = `${finalUsername}_${Math.floor(100 + Math.random() * 900)}`;
    }

    // Generate unique adminId
    const adminId = await generateHospitalAdminId();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const newAdmin = await Admin.create({
      adminId,
      fullName: fullName.trim(),
      username: finalUsername,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'HOSPITAL_ADMIN',
      phone: phone ? phone.trim() : '+91 98765 00000',
      designation: designation ? designation.trim() : 'Hospital Administrator',
      hospitalId: hospital._id,
      hospitalName: hospital.name,
      hospitalCode: hospital.code,
      status: status || 'Active',
      avatar:
        avatar ||
        'https://images.unsplash.com/photo-1594824813576-4d0f62e873cf?w=160&auto=format&fit=crop&q=80',
      dateJoined: new Date(),
    });

    // Dispatch official appointment notification email via Nodemailer
    const portalUrl = `${req.protocol}://${req.get('host')}/login`;
    const emailResult = await sendHospitalAdminAppointmentEmail({
      to: newAdmin.email,
      adminName: newAdmin.fullName,
      adminId: newAdmin.adminId,
      hospitalName: hospital.name,
      hospitalCode: hospital.code,
      city: hospital.city,
      hospitalPhone: hospital.phone,
      tempPassword: rawPassword,
      portalUrl,
    });

    // Record audit trail
    try {
      await AuditLog.create({
        action: 'HOSPITAL_ADMIN_CREATED',
        actor: req.admin?.fullName || req.admin?.username || 'Super Administrator',
        role: req.admin?.role || 'MEDY_ADMIN',
        target: `${newAdmin.fullName} (${newAdmin.adminId})`,
        details: `Super Admin provisioned hospital administrator account for ${hospital.name} (Code: ${hospital.code}, Login: ${newAdmin.email}). Nodemailer dispatch: ${emailResult.success ? 'Delivered' : 'Failed'} (${emailResult.messageId || emailResult.error})`,
        ipAddress: req.ip || '127.0.0.1',
        status: emailResult.success ? 'Success' : 'Warning',
      });
    } catch (auditErr) {
      console.error('Audit log failed for createHospitalAdmin:', auditErr);
    }

    // Return created admin without password along with email notification info
    const returned = await Admin.findById(newAdmin._id)
      .populate('hospitalId', 'name code city phone email')
      .select('-password');

    res.status(201).json({
      ...returned.toObject(),
      emailNotification: emailResult,
    });
  } catch (error) {
    console.error('Create Hospital Admin Error:', error);
    res.status(500).json({ message: error.message || 'Failed to create hospital administrator' });
  }
};

// @desc    Update hospital administrator
// @route   PUT /api/hospital-admins/:id
// @access  Private (Super Admin)
const updateHospitalAdmin = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid administrator ID format' });
    }

    const admin = await Admin.findOne({ _id: req.params.id, role: 'HOSPITAL_ADMIN' });
    if (!admin) {
      return res.status(404).json({ message: 'Hospital administrator not found' });
    }

    const {
      fullName,
      email,
      phone,
      designation,
      hospitalId,
      status,
      avatar,
      password,
    } = req.body;

    if (fullName) admin.fullName = fullName.trim();
    if (phone) admin.phone = phone.trim();
    if (designation) admin.designation = designation.trim();
    if (status) admin.status = status;
    if (avatar) admin.avatar = avatar;

    if (email && email.trim().toLowerCase() !== admin.email) {
      const existingEmail = await Admin.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: admin._id },
      });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email is already taken by another administrator.' });
      }
      admin.email = email.trim().toLowerCase();
    }

    if (hospitalId && hospitalId !== String(admin.hospitalId)) {
      let hospital = null;
      if (mongoose.Types.ObjectId.isValid(hospitalId)) {
        hospital = await Hospital.findById(hospitalId);
      } else {
        hospital = await Hospital.findOne({
          $or: [
            { name: new RegExp(`^${hospitalId.trim()}$`, 'i') },
            { code: hospitalId.trim().toUpperCase() },
          ],
        });
      }
      if (hospital) {
        admin.hospitalId = hospital._id;
        admin.hospitalName = hospital.name;
        admin.hospitalCode = hospital.code;
      } else {
        return res.status(404).json({ message: 'Selected hospital does not exist.' });
      }
    }

    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
      }
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password.trim(), salt);
    }

    await admin.save();

    // Audit log
    try {
      await AuditLog.create({
        action: 'HOSPITAL_ADMIN_UPDATED',
        actor: req.admin?.fullName || req.admin?.username || 'Super Administrator',
        role: req.admin?.role || 'MEDY_ADMIN',
        target: `${admin.fullName} (${admin.adminId})`,
        details: `Super Admin modified credentials and profile for ${admin.fullName} at ${admin.hospitalName}`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (auditErr) {
      console.error('Audit log failed for updateHospitalAdmin:', auditErr);
    }

    const updated = await Admin.findById(admin._id)
      .populate('hospitalId', 'name code city phone email')
      .select('-password');

    res.json(updated);
  } catch (error) {
    console.error('Update Hospital Admin Error:', error);
    res.status(500).json({ message: error.message || 'Failed to update hospital administrator' });
  }
};

// @desc    Toggle hospital admin active/inactive status
// @route   PATCH /api/hospital-admins/:id/status
// @access  Private (Super Admin)
const toggleHospitalAdminStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid administrator ID format' });
    }

    const admin = await Admin.findOne({ _id: req.params.id, role: 'HOSPITAL_ADMIN' });
    if (!admin) {
      return res.status(404).json({ message: 'Hospital administrator not found' });
    }

    const newStatus = admin.status === 'Active' ? 'Inactive' : 'Active';
    admin.status = newStatus;
    await admin.save();

    try {
      await AuditLog.create({
        action: 'HOSPITAL_ADMIN_STATUS_CHANGED',
        actor: req.admin?.fullName || req.admin?.username || 'Super Administrator',
        role: req.admin?.role || 'MEDY_ADMIN',
        target: `${admin.fullName} (${admin.adminId})`,
        details: `Super Admin set administrator status to '${newStatus}' for ${admin.hospitalName}`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (auditErr) {
      console.error('Audit log failed for toggle status:', auditErr);
    }

    res.json({
      _id: admin._id,
      adminId: admin.adminId,
      status: admin.status,
      message: `Administrator status changed to ${newStatus}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to toggle status' });
  }
};

// @desc    Delete hospital administrator
// @route   DELETE /api/hospital-admins/:id
// @access  Private (Super Admin)
const deleteHospitalAdmin = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid administrator ID format' });
    }

    const admin = await Admin.findOne({ _id: req.params.id, role: 'HOSPITAL_ADMIN' });
    if (!admin) {
      return res.status(404).json({ message: 'Hospital administrator not found' });
    }

    const { fullName, adminId, hospitalName } = admin;
    await Admin.deleteOne({ _id: admin._id });

    try {
      await AuditLog.create({
        action: 'HOSPITAL_ADMIN_DELETED',
        actor: req.admin?.fullName || req.admin?.username || 'Super Administrator',
        role: req.admin?.role || 'MEDY_ADMIN',
        target: `${fullName} (${adminId})`,
        details: `Super Admin revoked and purged hospital administrator record for ${hospitalName}`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'Success',
      });
    } catch (auditErr) {
      console.error('Audit log failed for deleteHospitalAdmin:', auditErr);
    }

    res.json({ message: 'Hospital administrator deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete hospital administrator' });
  }
};

module.exports = {
  getHospitalAdmins,
  getHospitalAdminById,
  createHospitalAdmin,
  updateHospitalAdmin,
  toggleHospitalAdminStatus,
  deleteHospitalAdmin,
};

