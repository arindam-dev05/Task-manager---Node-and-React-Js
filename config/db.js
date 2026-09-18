// config/db.js
// Single responsibility: open the MongoDB connection using Mongoose.
// server.js calls connectDB() once on startup.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // stop the app if DB isn't reachable
  }
};

module.exports = connectDB;
