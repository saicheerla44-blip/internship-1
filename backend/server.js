// server.js
// Main entry point for RepairMithra Node.js Express backend

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS) for React frontend integration
app.use(cors());

// Parse incoming requests with JSON payloads
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RepairMithra backend is running',
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Global Error Handling Middleware
app.use(errorHandler);

// Start server if not running in test mode
if (process.env.NODE_ENV !== 'test') {
  // Connect to MongoDB
  connectDB().catch((err) => {
    console.error('Failed to connect to MongoDB on startup:', err.message);
  });

  app.listen(PORT, () => {
    console.log(`[Server] RepairMithra backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
