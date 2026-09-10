// config/db.js
// MongoDB connection configuration using Mongoose

const mongoose = require('mongoose');

/**
 * Connects to MongoDB database using URI from environment variables.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // Do not terminate process immediately in test/dev environment if handled by caller
    throw error;
  }
};

module.exports = connectDB;
