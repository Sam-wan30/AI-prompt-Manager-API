#!/bin/bash

echo "Starting Frontend Development Server..."
echo "Frontend will be available at: http://localhost:5173"
echo ""

# Check if we're in the frontend directory
if [ ! -f "vite.config.js" ]; then
    echo "Error: Please run this script from the frontend directory"
    exit 1
fi

# Create simple index.html if it doesn't exist
if [ ! -f "index.html" ]; then
    cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Prompt Manager</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF
fi

# Create simple main.jsx if it doesn't exist
if [ ! -f "src/main.jsx" ]; then
    mkdir -p src
    cat > src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF
fi

# Create simple App.jsx if it doesn't exist
if [ ! -f "src/App.jsx" ]; then
    cat > src/App.jsx << 'EOF'
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'
import PromptLibraryPage from './pages/PromptLibraryPage'
import CreatePromptPage from './pages/CreatePromptPage'
import AIGeneratorPage from './pages/AIGeneratorPage'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/prompts" element={
            <ProtectedRoute>
              <Layout>
                <PromptLibraryPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/prompts/create" element={
            <ProtectedRoute>
              <Layout>
                <CreatePromptPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/ai/generator" element={
            <ProtectedRoute>
              <Layout>
                <AIGeneratorPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
EOF
fi

# Start the development server
npm run dev
