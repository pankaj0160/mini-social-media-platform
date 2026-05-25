// ============================================================
// config/db.js — MongoDB connection setup using Mongoose
// ============================================================

const mongoose = require("mongoose");

/**
 * connectDB()
 * Connects to MongoDB using the MONGO_URI environment variable.
 * Exits the process if the connection fails (so the server doesn't
 * silently run without a database).
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options prevent deprecation warnings
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit with failure code
  }
};

module.exports = connectDB;
