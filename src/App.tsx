import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { AuthPage } from './components/auth/AuthPage';
import { ProfileSetup } from './components/profile/ProfileSetup';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { PublicAdminDashboard } from './pages/PublicAdminDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

const AppContent: React.FC = () => {
  const { user, userRole, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading JANTA...</h2>
          <p className="text-gray-500">Connecting to secure servers</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Citizen without profile
  if (userRole === 'citizen' && !userProfile) {
    return <ProfileSetup />;
  }

  // Main application with header
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {userRole === 'admin' && <AdminDashboard />}
        {userRole === 'public_admin' && <PublicAdminDashboard />}
        {userRole === 'citizen' && <CitizenDashboard />}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;