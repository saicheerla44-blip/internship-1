# RepairMithra - Registration Backend API

A clean, production-grade Node.js / Express / MongoDB backend service for user registration built for the RepairMithra platform.

---

## 🏗️ Architecture

The backend follows a modular **5-Tier Clean Architecture**:

```
API Routes  ──>  Controllers  ──>  Validation  ──>  Auth Logic  ──>  Database (MongoDB)
```

- **Routes**: Listens for HTTP requests and maps them to controllers.
- **Controllers**: Handles request processing, input validation, and business logic.
- **Validation**: Strict verification of user input formats (Email, Phone, Password).
- **Auth Logic**: Password hashing using `bcryptjs` and exclusion of credentials in responses.
- **Database Layer**: Data access using Mongoose models.

---

## 🚀 Tech Stack

- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose ODM
- **Security & Authentication**: `bcryptjs` (Password Hashing), `cors` (Cross-Origin Resource Sharing)
- **Configuration**: `dotenv`

---

## 📂 Folder Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── controllers/
│   └── authController.js     # User registration business logic & validation
├── middleware/
│   └── errorMiddleware.js    # Global centralized error handling
├── models/
│   └── User.js               # Mongoose User schema & model
├── routes/
│   └── authRoutes.js         # API endpoint router definition
├── .env                      # Environment variables (git-ignored)
├── .gitignore                # Git exclusion rules
├── package.json              # Project dependencies and scripts
├── server.js                 # Server entry point & CORS configuration
└── test_registration.js      # Automated test suite (9 test cases)
```

---

## ⚡ Installation & Setup Instructions

### 1. Prerequisites
- Node.js (v16+ recommended)
- MongoDB installed locally OR a MongoDB Atlas cluster URI.

### 2. Clone Repository & Install Dependencies
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/repairmithra
```

### 4. Running the Application

```bash
# Production mode
npm start

# Development mode (with live reload via nodemon)
npm run dev
```

The server will start at `http://localhost:5000`.

---

## 🧪 Running Automated Tests

To execute the automated unit and integration test suite:

```bash
npm test
```

### Test Coverage (9 Verification Scenarios):
1. `GET /api/health` - Server health verification.
2. Validation - Missing Name (HTTP 400).
3. Validation - Missing Email (HTTP 400).
4. Validation - Invalid Email Format (HTTP 400).
5. Validation - Invalid Phone Format (HTTP 400).
6. Validation - Weak Password (< 8 characters) (HTTP 400).
7. Valid Registration - Returns HTTP 201 and sanitized user object.
8. Database Verification - Password properly hashed with `bcryptjs` before storage.
9. Duplicate Email Check - Returns HTTP 409 Conflict.

---

## 📡 API Reference

### 1. Health Check Endpoint
- **HTTP Method**: `GET`
- **Path**: `/api/health`
- **Description**: Verifies server operational status.

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "message": "RepairMithra backend is running"
}
```

---

### 2. Register New User
- **HTTP Method**: `POST`
- **Path**: `/api/auth/register`
- **Content-Type**: `application/json`

#### Request Body Parameters:

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | String | Yes | Full name of user |
| `email` | String | Yes | Valid unique email address |
| `phone` | String | Yes | Valid phone number (7-15 digits) |
| `password` | String | Yes | Minimum 8 characters |

#### Sample Request Body:
```json
{
  "name": "Sai Reddy",
  "email": "sai.reddy@example.com",
  "phone": "9876543210",
  "password": "SecurePassword123"
}
```

#### Sample Success Response (`201 Created`):
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "65f123456789abcdef123456",
    "name": "Sai Reddy",
    "email": "sai.reddy@example.com",
    "phone": "9876543210"
  }
}
```

#### Sample Error Responses:

##### A. Validation Error (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Password must be at least 8 characters long."
}
```

##### B. Duplicate Email (`409 Conflict`)
```json
{
  "success": false,
  "message": "Email is already registered. Please use another email or log in."
}
```

##### C. Internal Server Error (`500 Internal Server Error`)
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## 👨‍💻 Developer Information

- **Developer**: Sai Reddy
- **Module**: Registration Page Backend
- **Project**: RepairMithra
