import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import { CustomizerProvider } from './components/CustomizerContext';
import ResponsiveLayout from './components/ResponsiveLayout';
import AuthPage from './components/AuthPage';
import CustomizerPage from './components/CustomizerPage';
import DashboardPage from './components/DashboardPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0f19] text-cyan-600 dark:text-cyan-400 font-mono text-sm">
        Initializing Secure Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CustomizerProvider>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />

              <Route
                path="/customizer"
                element={
                  <ProtectedRoute>
                    <CustomizerPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/customizer" replace />} />
            </Routes>
          </CustomizerProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
