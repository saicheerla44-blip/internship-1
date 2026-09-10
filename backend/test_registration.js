// test_registration.js
// Fast, robust automated test suite for RepairMithra Registration Backend

const bcrypt = require('bcryptjs');
const express = require('express');
const cors = require('cors');

// Import components
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const User = require('./models/User');

// Create test express app
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RepairMithra backend is running',
  });
});

app.use('/api/auth', authRoutes);
app.use(errorHandler);

let server;
let baseUrl;

// In-memory mock user database for test suite execution
const mockUsers = [];

// Override Mongoose User model methods for fast unit/integration testing
User.findOne = async ({ email }) => {
  const found = mockUsers.find((u) => u.email === email);
  return found || null;
};

User.create = async (userData) => {
  const newUser = {
    _id: 'mock_id_' + (mockUsers.length + 1),
    ...userData,
    createdAt: new Date(),
  };
  mockUsers.push(newUser);
  return newUser;
};

async function makeRequest(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  const data = await response.json();
  return { status: response.status, data };
}

async function runTests() {
  console.log('====================================================');
  console.log('   RepairMithra Registration Backend Test Suite     ');
  console.log('====================================================\n');

  let passedCount = 0;
  let totalCount = 0;

  function assert(testName, condition, detail = '') {
    totalCount++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName} -> ${detail}`);
    }
  }

  try {
    // Start test server on random port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`[Test Server] Listening at ${baseUrl}\n`);
        resolve();
      });
    });

    // 1. Health Check Endpoint GET /api/health
    {
      const res = await makeRequest('/api/health', { method: 'GET' });
      assert(
        'GET /api/health - Returns HTTP 200 & success status',
        res.status === 200 && res.data.success === true && res.data.message === 'RepairMithra backend is running',
        `Status: ${res.status}, Body: ${JSON.stringify(res.data)}`
      );
    }

    // 2. Missing Name (HTTP 400)
    {
      const res = await makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'sai.reddy@example.com',
          phone: '9876543210',
          password: 'Password123!',
        }),
      });
      assert(
        'Validation - Missing Name returns HTTP 400',
        res.status === 400 && res.data.success === false && res.data.message.includes('Name is required'),
        `Status: ${res.status}, Body: ${JSON.stringify(res.data)}`
      );
    }

    // 3. Missing Email (HTTP 400)
    {
      const res = await makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Sai Reddy',
          phone: '9876543210',
          password: 'Password123!',
        }),
      });
      assert(
        'Validation - Missing Email returns HTTP 400',
        res.status === 400 && res.data.success === false && res.data.message.includes('Email is required'),
        `Status: ${res.status}, Body: ${JSON.stringify(res.data)}`
      );
    }

    // 4. Invalid Email Format (HTTP 400)
    {
      const res = await makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Sai Reddy',
          email: 'saireddy-invalid-email',
          phone: '9876543210',
          password: 'Password123!',
        }),
      });
      assert(
        'Validation - Invalid Email format returns HTTP 400',
        res.status === 400 && res.data.success === false && res.data.message.includes('valid email address format'),
        `Status: ${res.status}, Body: ${JSON.stringify(res.data)}`
      );
    }

    // 5. Invalid Phone (HTTP 400)
    {
      const res = await makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Sai Reddy',
          email: 'sai@example.com',
          phone: '123',
          password: 'Password123!',
        }),
      });
      assert(
        'Validation - Invalid Phone returns HTTP 400',
        res.status === 400 && res.data.success === false && res.data.message.includes('valid phone number'),
        `Status: ${res.status}, Body: ${JSON.stringify(res.data)}`
      );
    }

    // 6. Weak Password (< 8 chars) (HTTP 400)
    {
      const res = await makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Sai Reddy',
          email: 'sai@example.com',
          phone: '9876543210',
          password: 'short',
        }),
      });
      assert(
        'Validation - Password < 8 characters returns HTTP 400',
        res.status === 400 && res.data.success === false && res.data.message.includes('at least 8 characters'),
        `Status: ${res.status}, Body: ${JSON.stringify(res.data)}`
      );
    }

    // 7. Successful Registration (HTTP 201) & bcrypt Hashing & Password Omission
    let registeredUserEmail = 'sai.reddy@repairmithra.com';
    {
      const res = await makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Sai Reddy',
          email: registeredUserEmail,
          phone: '9876543210',
          password: 'MySecretPassword123',
        }),
      });

      const is201 = res.status === 201;
      const isSuccess = res.data.success === true;
      const hasCorrectUser = res.data.user && res.data.user.name === 'Sai Reddy' && res.data.user.email === registeredUserEmail;
      const passwordHidden = res.data.user && res.data.user.password === undefined;

      assert(
        'Valid Registration - Returns HTTP 201 and sanitized user (password not in response)',
        is201 && isSuccess && hasCorrectUser && passwordHidden,
        `Status: ${res.status}, Body: ${JSON.stringify(res.data)}`
      );

      // Verify bcrypt password hashing in storage
      const storedUser = mockUsers.find((u) => u.email === registeredUserEmail);
      const isStored = storedUser !== undefined;
      const isHashed = storedUser && storedUser.password !== 'MySecretPassword123' && (await bcrypt.compare('MySecretPassword123', storedUser.password));

      assert(
        'Database Verification - Password hashed with bcryptjs and stored in database',
        isStored && isHashed,
        `User saved: ${isStored}, Password correctly hashed: ${isHashed}`
      );
    }

    // 8. Duplicate Email Check (HTTP 409)
    {
      const res = await makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Sai Reddy Second',
          email: registeredUserEmail,
          phone: '9998887770',
          password: 'AnotherPassword123',
        }),
      });

      assert(
        'Duplicate Email - Returns HTTP 409 Conflict',
        res.status === 409 && res.data.success === false && res.data.message.includes('already registered'),
        `Status: ${res.status}, Body: ${JSON.stringify(res.data)}`
      );
    }

    console.log('\n====================================================');
    console.log(`   Final Summary: ${passedCount} / ${totalCount} Tests Passed`);
    console.log('====================================================\n');

    if (passedCount !== totalCount) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
  }
}

runTests();
