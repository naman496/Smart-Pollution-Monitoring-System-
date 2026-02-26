# Quick Start Guide

## Backend Integration Complete! 🎉

The project now has a complete backend with MongoDB integration. Follow these steps to get started:

## Step 1: Install Dependencies

```bash
npm install
```

This will install all frontend and backend dependencies including:
- Express.js
- Mongoose
- CORS
- dotenv
- bcryptjs

## Step 2: Set Up Environment Variables

1. Copy the `env.template` file to `.env`:
   ```bash
   cp env.template .env
   ```

2. Edit `.env` and add your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/vehicle-pollution-monitoring
   ```
   
   **For MongoDB Atlas (cloud):**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
   ```

## Step 3: Start MongoDB

- **Local MongoDB:** Make sure MongoDB is running on your system
- **MongoDB Atlas:** No setup needed, just use your connection string

## Step 4: Start the Backend Server

In one terminal:
```bash
npm run server
```

The server will start on `http://localhost:5000`

## Step 5: Start the Frontend

In another terminal:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Step 6: Access the Application

1. Open `http://localhost:5173` in your browser
2. Login with any username/password (first login will create the user automatically)
3. The app will now use the MongoDB database instead of mock data

## What's Changed?

✅ **Backend Server** - Complete Express.js server with MongoDB
✅ **API Routes** - Full CRUD operations for all entities
✅ **Database Models** - Vehicle, Alert, Challan, EmissionRecord, AdminUser
✅ **Authentication** - Login/Register with password hashing
✅ **Frontend Integration** - All pages now use the backend API
✅ **Environment Configuration** - Easy setup with .env file

## API Endpoints

All endpoints are available at `http://localhost:5000/api`:

- `/vehicles` - Vehicle management
- `/alerts` - Alert management
- `/challans` - Challan management
- `/emissions` - Emission records
- `/admins` - Admin user management
- `/auth` - Authentication

See `README_BACKEND.md` for complete API documentation.

## Troubleshooting

**MongoDB Connection Error:**
- Check your MongoDB connection string in `.env`
- Ensure MongoDB is running (if using local)
- Check network/firewall settings (if using Atlas)

**CORS Errors:**
- Make sure `CORS_ORIGIN` in `.env` matches your frontend URL
- Default is `http://localhost:5173`

**Port Already in Use:**
- Change `PORT` in `.env` to a different port (e.g., 5001)
- Update `VITE_API_BASE_URL` in frontend `.env` if needed

## Next Steps

- Add more vehicles through the API
- Configure authentication tokens (JWT) for production
- Set up MongoDB indexes for better performance
- Add data validation and error handling

Happy coding! 🚀

