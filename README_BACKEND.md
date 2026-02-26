# Backend Integration Guide

This project now includes a complete backend server with MongoDB integration.

## Setup Instructions

### 1. Install Dependencies

First, install all the backend dependencies:

```bash
npm install
```

This will install:
- Express.js (web server)
- Mongoose (MongoDB ODM)
- CORS (Cross-Origin Resource Sharing)
- dotenv (environment variables)
- bcryptjs (password hashing)

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following content:

```env
# MongoDB Connection
# For local MongoDB: mongodb://localhost:27017/vehicle-pollution-monitoring
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database-name
MONGODB_URI=mongodb://localhost:27017/vehicle-pollution-monitoring

# Server Configuration
PORT=5000
NODE_ENV=development

# API Configuration
API_BASE_URL=http://localhost:5000/api

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**Important:** Replace `MONGODB_URI` with your actual MongoDB connection string.

### 3. Start MongoDB

Make sure MongoDB is running on your system:

- **Local MongoDB:** Start the MongoDB service
- **MongoDB Atlas:** Use your connection string in the `.env` file

### 4. Run the Backend Server

Start the backend server:

```bash
npm run server
```

Or for development with auto-reload:

```bash
npm run dev:server
```

The server will start on `http://localhost:5000`

### 5. Run the Frontend

In a separate terminal, start the frontend:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `PATCH /api/vehicles/:id/emission` - Update vehicle emission
- `PATCH /api/vehicles/:id/inspect` - Mark vehicle as inspected

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/:id` - Get alert by ID
- `GET /api/alerts/vehicle/:vehicleId` - Get alerts by vehicle
- `POST /api/alerts` - Create new alert
- `DELETE /api/alerts/:id` - Delete alert

### Challans
- `GET /api/challans` - Get all challans
- `GET /api/challans/:id` - Get challan by ID
- `GET /api/challans/vehicle/:vehicleId` - Get challans by vehicle
- `POST /api/challans` - Create new challan
- `PATCH /api/challans/:id/status` - Update challan status
- `DELETE /api/challans/:id` - Delete challan

### Emissions
- `GET /api/emissions/vehicle/:vehicleId` - Get emission records
- `POST /api/emissions` - Create emission record

### Admin Users
- `GET /api/admins` - Get all admin users
- `GET /api/admins/:id` - Get admin by ID
- `POST /api/admins` - Create admin user
- `PUT /api/admins/:id` - Update admin user
- `DELETE /api/admins/:id` - Delete admin user

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user

## Database Models

### Vehicle
- `number` (String, unique, required)
- `owner` (String, required)
- `phone` (String, required)
- `registration` (String, required)
- `currentEmission` (Number, default: 0)
- `status` (Enum: 'low', 'moderate', 'high')
- `location` (Object with lat, lng)
- `alertsCount` (Number, default: 0)

### Alert
- `vehicleId` (ObjectId, ref: Vehicle)
- `vehicleNumber` (String)
- `owner` (String)
- `timestamp` (Date)
- `emissionValue` (Number)
- `message` (String)

### Challan
- `vehicleId` (ObjectId, ref: Vehicle)
- `vehicleNumber` (String)
- `issuedDate` (Date)
- `amount` (Number)
- `status` (Enum: 'paid', 'due')
- `type` (String)

### EmissionRecord
- `vehicleId` (ObjectId, ref: Vehicle)
- `timestamp` (Date)
- `value` (Number)

### AdminUser
- `name` (String, required)
- `role` (String, required)
- `email` (String, unique, required)
- `phone` (String, required)
- `username` (String, unique, required)
- `password` (String, hashed)

## Frontend Configuration

The frontend is configured to use the backend API. The API base URL can be configured via environment variable:

Create a `.env` file in the root directory (for Vite):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Notes

- The backend automatically creates a user on first login if none exists
- Passwords are hashed using bcrypt
- All timestamps are stored as Date objects in MongoDB
- The frontend normalizes MongoDB `_id` fields to `id` for compatibility

