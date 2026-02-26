import express from 'express';
import AdminUser from '../models/AdminUser.js';

const router = express.Router();

// Get all admin users
router.get('/', async (req, res) => {
  try {
    const admins = await AdminUser.find().select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get admin user by ID
router.get('/:id', async (req, res) => {
  try {
    const admin = await AdminUser.findById(req.params.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new admin user
router.post('/', async (req, res) => {
  try {
    const admin = new AdminUser(req.body);
    const savedAdmin = await admin.save();
    const adminResponse = savedAdmin.toObject();
    delete adminResponse.password;
    res.status(201).json(adminResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update admin user
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    // Don't allow password update through this route
    delete updateData.password;

    const admin = await AdminUser.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    res.json(admin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete admin user
router.delete('/:id', async (req, res) => {
  try {
    const admin = await AdminUser.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    res.json({ message: 'Admin user deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

