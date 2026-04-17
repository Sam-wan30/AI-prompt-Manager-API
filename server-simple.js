/**
 * Simple Express Server - Minimal working version
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Simple Prompt Schema
const PromptSchema = new mongoose.Schema({
  title: String,
  description: String,
  promptText: String,
  category: String,
  tags: [String],
  usageCount: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Prompt = mongoose.model('Prompt', PromptSchema);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    
    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: { id: user._id, name, email, role: user.role },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user._id, name, email, role: user.role },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Prompt Routes
app.get('/api/prompts', async (req, res) => {
  try {
    const prompts = await Prompt.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: { prompts } });
  } catch (error) {
    console.error('Get prompts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/prompts', async (req, res) => {
  try {
    const { title, description, promptText, category, tags } = req.body;
    
    // Create prompt (without user for now)
    const prompt = new Prompt({ title, description, promptText, category, tags });
    await prompt.save();
    
    res.status(201).json({
      success: true,
      message: 'Prompt created successfully',
      data: { prompt }
    });
  } catch (error) {
    console.error('Create prompt error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// AI Generation (mock)
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { topic, category, tone } = req.body;
    
    // Mock AI response
    const generatedPrompt = `Generate a ${category} prompt about ${topic} with a ${tone} tone. This is a mock response since we don't have OpenAI API key configured.`;
    
    res.json({
      success: true,
      message: 'Prompt generated successfully',
      data: { prompt: generatedPrompt }
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Analytics
app.get('/api/analytics/prompts', async (req, res) => {
  try {
    const totalPrompts = await Prompt.countDocuments();
    const totalUsage = await Prompt.aggregate([{ $group: { _id: null, total: { $sum: '$usageCount' } } }]);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalPrompts,
          totalUsage: totalUsage[0]?.total || 0
        },
        categories: [],
        activity: {
          last24Hours: { totalUsage: 0 },
          last7Days: { totalUsage: 0 },
          last30Days: { totalUsage: 0 }
        }
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt-manager');
    console.log('Connected to MongoDB');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at: http://localhost:${PORT}/api`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
