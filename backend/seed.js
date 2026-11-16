const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medy');
    console.log('Connected to MongoDB for seeding...');

    const existingAdmin = await Admin.findOne({ email: 'admin@medy.com' });
    if (existingAdmin) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const hospitalName = process.env.HOSPITAL_NAME || 'City Care Hospital';

    await Admin.create({
      username: 'admin',
      email: 'admin@medy.com',
      password: hashedPassword,
      hospitalName: hospitalName,
    });

    console.log('Admin seeded successfully:');
    console.log('Email: admin@medy.com');
    console.log('Password: admin123');
    console.log(`Hospital Name: ${hospitalName}`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedAdmin();

