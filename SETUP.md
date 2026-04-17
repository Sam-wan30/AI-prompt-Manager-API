# AI Prompt Manager - Complete Setup Guide

## Prerequisites

### System Requirements
- Node.js 18.x or higher
- MongoDB 5.0 or higher
- Redis 6.0 or higher
- Git
- Terminal/Command Prompt

### Optional for Production
- Nginx (for reverse proxy)
- PM2 (process manager)
- SSL certificate

---

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-repo/ai-prompt-manager.git
cd ai-prompt-manager

# Or if you have the files locally
cd "/Users/samiksha/AI prompt Manager API"
```

---

## Step 2: Backend Setup

### 2.1 Install Backend Dependencies

```bash
# Navigate to backend directory
cd "/Users/samiksha/AI prompt Manager API"

# Install dependencies
npm install

# Install additional production dependencies
npm install express-rate-limit helmet cors compression morgan bcryptjs jsonwebtoken mongoose dotenv winston express-validator joi express-validator redis rate-limit-redis isomorphic-dompurify sanitize-html validator uuid

# Install development dependencies
npm install -D nodemon concurrently
```

### 2.2 Set Up Environment Variables

```bash
# Create environment file
cat > .env << 'EOF'
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/prompt-manager
REDIS_URL=redis://localhost:6379

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Frontend URL
FRONTEND_URL=http://localhost:5173
EOF
```

### 2.3 Start MongoDB

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod
sudo systemctl enable mongod

# On Windows
# Start MongoDB service from Services
```

### 2.4 Start Redis

```bash
# On macOS with Homebrew
brew services start redis

# On Ubuntu/Debian
sudo systemctl start redis-server
sudo systemctl enable redis-server

# On Windows
# Start Redis service
```

### 2.5 Create Logs Directory

```bash
# Create logs directory
mkdir -p logs
touch logs/app.log
touch logs/error.log
touch logs/access.log
```

---

## Step 3: Frontend Setup

### 3.1 Navigate to Frontend Directory

```bash
cd "/Users/samiksha/AI prompt Manager API/frontend"
```

### 3.2 Install Frontend Dependencies

```bash
# Install dependencies
npm install

# Install additional UI dependencies
npm install lucide-react react-router-dom axios tailwindcss @tailwindcss/forms @tailwindcss/typography postcss autoprefixer

# Install development dependencies
npm install -D vite @vitejs/plugin-react
```

### 3.3 Set Up Frontend Environment

```bash
# Create environment file
cat > .env << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Environment
VITE_NODE_ENV=development
EOF
```

### 3.4 Build Tailwind CSS

```bash
# Build Tailwind CSS (if needed)
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch
```

---

## Step 4: Run the Application

### 4.1 Option 1: Run Both Backend and Frontend (Development)

```bash
# Navigate to main directory
cd "/Users/samiksha/AI prompt Manager API"

# Install concurrently for running both servers
npm install -D concurrently

# Update package.json scripts
cat > package-scripts.json << 'EOF'
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "nodemon server.js",
    "client": "cd frontend && npm run dev",
    "start": "node server.js",
    "build": "cd frontend && npm run build"
  }
}
EOF

# Run both servers
npm run dev
```

### 4.2 Option 2: Run Backend and Frontend Separately

#### Terminal 1 - Backend:
```bash
cd "/Users/samiksha/AI prompt Manager API"
npm run server
```

#### Terminal 2 - Frontend:
```bash
cd "/Users/samiksha/AI prompt Manager API/frontend"
npm run dev
```

### 4.3 Option 3: Production Mode

```bash
# Build frontend first
cd "/Users/samiksha/AI prompt Manager API/frontend"
npm run build

# Start backend in production mode
cd "/Users/samiksha/AI prompt Manager API"
NODE_ENV=production npm start
```

---

## Step 5: Access the Application

### Development URLs:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api-docs

### Default Login Credentials (for testing):
- **Email**: test@example.com
- **Password**: testpassword123

---

## Step 6: Database Initialization

### 6.1 Create Database Indexes

```bash
# Connect to MongoDB
mongo

# Switch to prompt-manager database
use prompt-manager

# Create indexes for better performance
db.prompts.createIndex({ "title": "text", "description": "text" })
db.prompts.createIndex({ "category": 1 })
db.prompts.createIndex({ "tags": 1 })
db.prompts.createIndex({ "usageCount": -1 })
db.prompts.createIndex({ "createdAt": -1 })
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "createdAt": -1 })

# Exit MongoDB
exit
```

### 6.2 Seed Initial Data (Optional)

```bash
# Create seed script
cat > seed.js << 'EOF'
const mongoose = require('mongoose');
const User = require('./models/User');
const Prompt = require('./models/Prompt');

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt-manager');

const seedData = async () => {
  try {
    // Create a test user
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123',
      role: 'user',
      tier: 'basic'
    });
    
    await user.save();
    console.log('Test user created');
    
    // Create sample prompts
    const prompts = [
      {
        title: 'Marketing Email Template',
        description: 'Template for writing effective marketing emails',
        promptText: 'Write a marketing email that promotes our new product and encourages customers to make a purchase.',
        category: 'marketing',
        tags: ['email', 'marketing', 'sales'],
        userId: user._id
      },
      {
        title: 'Blog Post Introduction',
        description: 'Template for writing engaging blog post introductions',
        promptText: 'Write an engaging introduction for a blog post about [topic] that captures reader attention and encourages them to continue reading.',
        category: 'writing',
        tags: ['blog', 'writing', 'content'],
        userId: user._id
      }
    ];
    
    await Prompt.insertMany(prompts);
    console.log('Sample prompts created');
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
EOF

# Run seed script
node seed.js
```

---

## Step 7: Testing the Application

### 7.1 Test API Endpoints

```bash
# Test health check
curl http://localhost:3000/api/health

# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"testpassword123"}'

# Test user login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}'
```

### 7.2 Test Frontend

1. Open http://localhost:5173 in your browser
2. Register a new account or login with test credentials
3. Navigate through the dashboard, prompt library, and AI generator
4. Test creating, editing, and deleting prompts
5. Test AI generation features

---

## Step 8: Common Issues & Solutions

### 8.1 Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use a different port
PORT=3001 npm start
```

### 8.2 MongoDB Connection Issues

```bash
# Check if MongoDB is running
brew services list | grep mongodb  # macOS
sudo systemctl status mongod          # Linux

# Restart MongoDB
brew services restart mongodb-community  # macOS
sudo systemctl restart mongod             # Linux
```

### 8.3 Redis Connection Issues

```bash
# Check if Redis is running
brew services list | grep redis    # macOS
sudo systemctl status redis-server   # Linux

# Restart Redis
brew services restart redis           # macOS
sudo systemctl restart redis-server    # Linux
```

### 8.4 Node.js Version Issues

```bash
# Check Node.js version
node --version

# Update Node.js (using nvm)
nvm install 18
nvm use 18
nvm alias default 18
```

### 8.5 Permission Issues

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use nvm to avoid permission issues
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

---

## Step 9: Production Deployment

### 9.1 Build for Production

```bash
# Build frontend
cd "/Users/samiksha/AI prompt Manager API/frontend"
npm run build

# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'prompt-manager',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 9.2 Set Up Nginx (Optional)

```bash
# Install Nginx
sudo apt install nginx  # Ubuntu/Debian
brew install nginx     # macOS

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/prompt-manager

# Add Nginx configuration (see DEPLOYMENT.md for full config)
sudo ln -s /etc/nginx/sites-available/prompt-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 10: Monitoring and Maintenance

### 10.1 View Logs

```bash
# View application logs
pm2 logs prompt-manager

# View error logs
tail -f logs/error.log

# View access logs
tail -f logs/access.log
```

### 10.2 Monitor Performance

```bash
# Monitor PM2 processes
pm2 monit

# Check memory usage
pm2 show prompt-manager

# Restart application
pm2 restart prompt-manager
```

### 10.3 Database Maintenance

```bash
# Backup database
mongodump --db prompt-manager --out ./backup

# Restore database
mongorestore ./backup/prompt-manager

# Check database stats
mongo prompt-manager --eval "db.stats()"
```

---

## Quick Start Commands

### For Development:
```bash
# 1. Start services
brew services start mongodb-community
brew services start redis

# 2. Navigate to project
cd "/Users/samiksha/AI prompt Manager API"

# 3. Install dependencies
npm install
cd frontend && npm install && cd ..

# 4. Run application
npm run dev
```

### For Production:
```bash
# 1. Build frontend
cd frontend && npm run build && cd ..

# 2. Start with PM2
pm2 start ecosystem.config.js

# 3. Monitor
pm2 logs prompt-manager
```

---

## Environment Variables Summary

### Required Variables:
- `NODE_ENV`: development/production
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `OPENAI_API_KEY`: OpenAI API key

### Optional Variables:
- `REDIS_URL`: Redis connection string
- `FRONTEND_URL`: Frontend URL for CORS
- `RATE_LIMIT_MAX`: Rate limit maximum requests
- `LOG_LEVEL`: Logging level

---

## Troubleshooting Commands

```bash
# Check all services
brew services list  # macOS
systemctl list-units --type=service  # Linux

# Check ports
lsof -i :3000  # Backend
lsof -i :5173  # Frontend

# Check Node.js modules
npm list --depth=0

# Clear npm cache
npm cache clean --force

# Rebuild node modules
rm -rf node_modules package-lock.json
npm install

# Reset database
mongo prompt-manager --eval "db.dropDatabase()"
```

This comprehensive setup guide should help you get the AI Prompt Manager running from scratch in both development and production environments.
