const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');
const Hospital = require('./models/Hospital');
const authRoutes = require('./routes/authRoutes');
const mediCardRoutes = require('./routes/mediCardRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const labTestRoutes = require('./routes/labTestRoutes');
const auditRoutes = require('./routes/auditRoutes');
const reportRoutes = require('./routes/reportRoutes');
const hospitalAdminRoutes = require('./routes/hospitalAdminRoutes');
const partneredLabRoutes = require('./routes/partneredLabRoutes');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB().then(async () => {
  try {
    const hospitalName = process.env.HOSPITAL_NAME || 'City Care Hospital';

    // Auto-seed default hospital if none exists
    let defaultHospital = await Hospital.findOne();
    if (!defaultHospital) {
      defaultHospital = await Hospital.create({
        name: hospitalName,
        code: 'HOSP-CCH',
        city: 'Mumbai',
        address: '101 Medical Center Ave, Central District',
        phone: '+91 22 2847 1100',
        email: 'info@citycarehospital.com',
        status: 'Active',
      });
      console.log(`Default hospital created: ${hospitalName}`);
    }

    // Auto-seed default super admin if none exists
    const adminCount = await Admin.countDocuments({ role: 'SUPER_ADMIN' });
    if (adminCount === 0) {
      const existingLegacyAdmin = await Admin.findOne({ email: 'admin@medy.com' });
      if (existingLegacyAdmin) {
        existingLegacyAdmin.role = 'SUPER_ADMIN';
        existingLegacyAdmin.status = 'Active';
        if (!existingLegacyAdmin.adminId) existingLegacyAdmin.adminId = 'MEDY-SA-001';
        if (!existingLegacyAdmin.fullName) existingLegacyAdmin.fullName = 'Super Administrator';
        await existingLegacyAdmin.save();
        console.log('Updated legacy admin to SUPER_ADMIN role');
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await Admin.create({
          adminId: 'MEDY-SA-001',
          fullName: 'Super Administrator',
          username: 'admin',
          email: 'admin@medy.com',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          hospitalName: defaultHospital ? defaultHospital.name : hospitalName,
          status: 'Active',
        });
        console.log('Default super admin created: admin@medy.com / admin123');
      }
    }

    // Auto-seed default hospital administrators if none exist
    const hospAdminCount = await Admin.countDocuments({ role: 'HOSPITAL_ADMIN' });
    if (hospAdminCount === 0 && defaultHospital) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await Admin.create([
        {
          adminId: 'HADM-001',
          fullName: 'Dr. Rajesh Sharma',
          username: 'rajesh.sharma',
          email: 'rajesh@citycare.com',
          password: hashedPassword,
          role: 'HOSPITAL_ADMIN',
          phone: '+91 98201 12345',
          designation: 'Medical Director & Chief Administrator',
          hospitalId: defaultHospital._id,
          hospitalName: defaultHospital.name,
          hospitalCode: defaultHospital.code,
          status: 'Active',
          avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=160&auto=format&fit=crop&q=80',
          dateJoined: new Date(),
        },
        {
          adminId: 'HADM-002',
          fullName: 'Priya Sundaram',
          username: 'priya.s',
          email: 'priya.admin@citycare.com',
          password: hashedPassword,
          role: 'HOSPITAL_ADMIN',
          phone: '+91 98450 67890',
          designation: 'Operations & Facilities Head',
          hospitalId: defaultHospital._id,
          hospitalName: defaultHospital.name,
          hospitalCode: defaultHospital.code,
          status: 'Active',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
          dateJoined: new Date(),
        },
      ]);
      console.log('Sample hospital administrators seeded: HADM-001, HADM-002');
    }
  } catch (err) {
    console.error('Error auto-seeding:', err.message);
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicards', mediCardRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/hospital-admins', hospitalAdminRoutes);
app.use('/api/partnered-labs', partneredLabRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

// Listen on all network interfaces (dual-stack IPv4 and IPv6) so both 127.0.0.1 and localhost connect cleanly
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (http://127.0.0.1:${PORT} & http://localhost:${PORT})`);
});

// Configure keep-alive timeout longer than frontend reverse proxies (e.g. Vite dev server proxy)
// This eliminates intermittent "socket hang up" and ECONNRESET proxy errors
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Error: Port ${PORT} is already in use by another process.`);
  } else {
    console.error('Server error:', err);
  }
});

// Gracefully handle client connection resets and aborts without terminating HTTP server
server.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) {
    return;
  }
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

// Prevent unhandled promise rejections or exceptions from abruptly crashing the server process
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
