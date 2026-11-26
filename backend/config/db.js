const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medy');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Retry connection after 5 seconds instead of abruptly exiting the process,
    // ensuring the backend HTTP server remains online to respond to client/proxy requests
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;

