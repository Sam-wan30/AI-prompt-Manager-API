#!/bin/bash

echo "=== Testing Frontend Setup ==="
echo ""

cd "/Users/samiksha/AI prompt Manager API/frontend"

echo "Step 1: Checking if frontend dependencies are installed..."
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Frontend dependencies already installed"
fi

echo "Step 2: Creating simple test page..."
cat > test.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .success {
            color: #22c55e;
            font-weight: bold;
        }
        .error {
            color: #ef4444;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Frontend Test Page</h1>
        <p>This is a simple test to verify the frontend setup is working.</p>
        <div id="status">Loading...</div>
        <button onclick="testAPI()">Test Backend API</button>
        <div id="api-result"></div>
    </div>

    <script>
        // Test if basic JavaScript works
        document.getElementById('status').innerHTML = '<span class="success">JavaScript is working!</span>';

        // Test API connection
        async function testAPI() {
            const resultDiv = document.getElementById('api-result');
            try {
                const response = await fetch('http://localhost:3000/api/health');
                const data = await response.json();
                resultDiv.innerHTML = '<span class="success">API Connection Successful!</span><br><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = '<span class="error">API Connection Failed:</span><br>' + error.message;
            }
        }
    </script>
</body>
</html>
EOF

echo "Step 3: Starting frontend development server..."
echo "Frontend will be available at: http://localhost:5173"
echo "Test page available at: file://$(pwd)/test.html"
echo ""

# Start the development server
npm run dev
