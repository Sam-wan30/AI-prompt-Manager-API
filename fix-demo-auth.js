/**
 * Fix Demo User Authentication
 * Creates a demo user with plain text password for testing
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Define User schema without password hashing for demo
const DemoUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  tier: {
    type: String,
    default: 'basic'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const DemoUser = mongoose.model('DemoUser', DemoUserSchema);

const fixDemoAuth = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt-manager');
    console.log('Connected to MongoDB');

    // Remove existing demo users
    await DemoUser.deleteMany({ email: 'demo@example.com' });
    console.log('Removed existing demo users');

    // Create demo user with plain text password
    const demoUser = new DemoUser({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'demo123456', // Plain text password
      role: 'user',
      tier: 'basic'
    });

    await demoUser.save();
    console.log('Created demo user with plain text password');

    // Define User schema without password hashing for demo
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  tier: {
    type: String,
    default: 'basic'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create User model
const User = mongoose.model('User', UserSchema);

// Update the real User collection to use plain text password
    await User.updateOne(
      { email: 'demo@example.com' },
      { password: 'demo123456' }, // Plain text password
      { upsert: true }
    );
    console.log('Updated real user collection with plain text password');

    console.log('Demo authentication fixed!');
    console.log('You can now login with:');
    console.log('Email: demo@example.com');
    console.log('Password: demo123456');

  } catch (error) {
    console.error('Error fixing demo auth:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the fix
fixDemoAuth();
