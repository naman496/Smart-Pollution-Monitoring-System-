import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AdminUser from './models/AdminUser.js';

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check if users exist
    const admin = await AdminUser.findOne({ username: 'admin' });
    const authority = await AdminUser.findOne({ username: 'authority' });

    console.log('=== User Check ===');
    if (admin) {
      console.log('✅ Admin user exists:');
      console.log('   Username:', admin.username);
      console.log('   Name:', admin.name);
      console.log('   Role:', admin.role);
      console.log('   Email:', admin.email);
      console.log('   Has password:', !!admin.password);
      
      // Test password
      const bcrypt = await import('bcryptjs');
      const testPassword = 'admin123';
      const isMatch = await admin.comparePassword(testPassword);
      console.log('   Password "admin123" matches:', isMatch);
    } else {
      console.log('❌ Admin user NOT found');
    }

    console.log('\n');

    if (authority) {
      console.log('✅ Authority user exists:');
      console.log('   Username:', authority.username);
      console.log('   Name:', authority.name);
      console.log('   Role:', authority.role);
      console.log('   Email:', authority.email);
      console.log('   Has password:', !!authority.password);
      
      // Test password
      const testPassword = 'authority123';
      const isMatch = await authority.comparePassword(testPassword);
      console.log('   Password "authority123" matches:', isMatch);
    } else {
      console.log('❌ Authority user NOT found');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

testLogin();

