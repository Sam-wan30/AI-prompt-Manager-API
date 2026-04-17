import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PromptLibraryPage from './pages/PromptLibraryPage';
import CreatePromptPage from './pages/CreatePromptPage';
import AIGeneratorPage from './pages/AIGeneratorPage';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
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
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
