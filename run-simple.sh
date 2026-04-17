#!/bin/bash

echo "=== AI Prompt Manager - Simple Setup ==="
echo ""

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

echo "Step 1: Installing backend dependencies..."
npm install --silent

echo "Step 2: Installing missing bcrypt module..."
npm install bcrypt --silent

echo "Step 3: Creating environment file..."
cat > .env << 'EOF'
NODE_ENV=development
PORT=3000
HOST=localhost
MONGODB_URI=mongodb://localhost:27017/prompt-manager
REDIS_URL=redis://localhost:6379
JWT_SECRET=super-secret-jwt-key-for-development-only
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
OPENAI_API_KEY=sk-test-key-replace-with-real-key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=info
LOG_FILE=./logs/app.log
FRONTEND_URL=http://localhost:5173
EOF

echo "Step 4: Creating logs directory..."
mkdir -p logs
touch logs/app.log logs/error.log logs/access.log

echo "Step 5: Installing frontend dependencies..."
cd frontend
npm install --silent

echo "Step 6: Creating frontend environment file..."
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3000/api
VITE_NODE_ENV=development
EOF

echo "Step 7: Starting services..."
cd ..

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    if command -v brew > /dev/null; then
        brew services start mongodb-community 2>/dev/null || echo "MongoDB already running or not installed via Homebrew"
    else
        echo "Please start MongoDB manually"
    fi
fi

# Check if Redis is running
if ! pgrep -x "redis-server" > /dev/null; then
    echo "Starting Redis..."
    if command -v brew > /dev/null; then
        brew services start redis 2>/dev/null || echo "Redis already running or not installed via Homebrew"
    else
        echo "Please start Redis manually"
    fi
fi

echo "Step 8: Starting backend server..."
echo ""
echo "=========================================="
echo "Application will be available at:"
echo "Backend API: http://localhost:3000/api"
echo "Frontend: http://localhost:5173 (run separately if needed)"
echo "=========================================="
echo ""

# Start backend only (frontend can be started separately)
npm run dev
