import express from 'express';
import AdminUser from '../models/AdminUser.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    console.log('Login attempt:', { username, role, hasPassword: !!password });

    // Find user by username or email
    const user = await AdminUser.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      console.log('User not found:', username);
      // For development: create a default user if none exists
      if (username && password) {
        const newUser = new AdminUser({
          username,
          password,
          name: username,
          role: role || 'Admin',
          email: `${username}@authority.gov.in`,
          phone: '+91 99887 76655',
        });
        await newUser.save();
        console.log('New user created:', newUser.username);
        return res.json({
          success: true,
          user: {
            name: newUser.name,
            role: newUser.role,
            id: newUser._id,
          },
        });
      }
      return res.status(401).json({ message: 'User not found', success: false });
    }

    console.log('User found:', user.username, 'Role:', user.role);

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password', success: false });
    }

    // Check role if provided (make it case-insensitive and more flexible)
    // Only enforce role check if role is explicitly provided and doesn't match
    if (role && user.role.toLowerCase() !== role.toLowerCase()) {
      console.log(`Role mismatch: User role is "${user.role}", provided role is "${role}"`);
      // For now, allow login but log a warning - you can make this strict later
      // return res.status(403).json({ 
      //   message: `Role mismatch. User role is "${user.role}" but you selected "${role}"`, 
      //   success: false 
      // });
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        role: user.role,
        id: user._id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register (optional, for creating new admin users)
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, role, email, phone } = req.body;

    // Check if user already exists
    const existingUser = await AdminUser.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new AdminUser({
      username,
      password,
      name,
      role,
      email,
      phone,
    });

    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

