import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AdminUser from './models/AdminUser.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing admin users (optional - comment out if you want to keep existing users)
    // await AdminUser.deleteMany({});
    // console.log('Cleared existing admin users');

    // Check if users already exist
    const existingAdmin = await AdminUser.findOne({ username: 'admin' });
    const existingAuthority = await AdminUser.findOne({ username: 'authority' });

    // Create Admin User
    if (!existingAdmin) {
      // Don't hash password here - the model's pre-save hook will do it
      const adminUser = new AdminUser({
        username: 'admin',
        password: 'admin123', // Will be hashed by the model's pre-save hook
        name: 'System Administrator',
        role: 'Admin',
        email: 'admin@authority.gov.in',
        phone: '+91 99887 76655',
      });
      await adminUser.save();
      console.log('✅ Admin user created:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
      // Update password if user exists but password doesn't work
      const testMatch = await existingAdmin.comparePassword('admin123');
      if (!testMatch) {
        existingAdmin.password = 'admin123'; // Will be re-hashed by pre-save hook
        await existingAdmin.save();
        console.log('   ✅ Admin password updated');
      }
    }

    // Create Authority User
    if (!existingAuthority) {
      // Don't hash password here - the model's pre-save hook will do it
      const authorityUser = new AdminUser({
        username: 'authority',
        password: 'authority123', // Will be hashed by the model's pre-save hook
        name: 'Authority Officer',
        role: 'Authority',
        email: 'authority@authority.gov.in',
        phone: '+91 99887 76656',
      });
      await authorityUser.save();
      console.log('✅ Authority user created:');
      console.log('   Username: authority');
      console.log('   Password: authority123');
    } else {
      console.log('ℹ️  Authority user already exists');
      // Update password if user exists but password doesn't work
      const testMatch = await existingAuthority.comparePassword('authority123');
      if (!testMatch) {
        existingAuthority.password = 'authority123'; // Will be re-hashed by pre-save hook
        await existingAuthority.save();
        console.log('   ✅ Authority password updated');
      }
    }

    console.log('\n🎉 Database seeding completed!');
    console.log('\nYou can now login with:');
    console.log('  Admin:     username: admin, password: admin123');
    console.log('  Authority: username: authority, password: authority123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();

