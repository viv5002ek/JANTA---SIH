import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { ProfileSetup } from './components/profile/ProfileSetup';
import { LoadingScreen } from './components/ui/LoadingScreen';

// Import role-based layouts
import { AdminLayout } from './layouts/AdminLayout';
import { CitizenLayout } from './layouts/CitizenLayout';
import { PublicAdminLayout } from './layouts/PublicAdminLayout';

// Import pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageAdmins } from './pages/admin/ManageAdmins';
import { ReassignmentRequests } from './pages/admin/ReassignmentRequests';
import { SystemAnalytics } from './pages/admin/SystemAnalytics';

import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { MyReports } from './pages/citizen/MyReports';
import { ReportIssue } from './pages/citizen/ReportIssue';
import { CitizenProfile } from './pages/citizen/CitizenProfile';

import { PublicAdminDashboard } from './pages/publicAdmin/PublicAdminDashboard';
import { AssignedReports } from './pages/publicAdmin/AssignedReports';
import { PAAnalytics } from './pages/publicAdmin/PAAnalytics';

const AppContent: React.FC = () => {
  const { user, userRole, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Citizen without profile
  if (userRole === 'citizen' && !userProfile) {
    return <ProfileSetup />;
  }

  // Role-based routing
  return (
    <Routes>
      {/* Admin Routes */}
      {userRole === 'admin' && (
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="manage-admins" element={<ManageAdmins />} />
          <Route path="reassignment-requests" element={<ReassignmentRequests />} />
          <Route path="analytics" element={<SystemAnalytics />} />
        </Route>
      )}

      {/* Public Admin Routes */}
      {userRole === 'public_admin' && (
        <Route path="/pa/*" element={<PublicAdminLayout />}>
          <Route index element={<PublicAdminDashboard />} />
          <Route path="reports" element={<AssignedReports />} />
          <Route path="analytics" element={<PAAnalytics />} />
        </Route>
      )}

      {/* Citizen Routes */}
      {userRole === 'citizen' && (
        <Route path="/user/*" element={<CitizenLayout />}>
          <Route index element={<CitizenDashboard />} />
          <Route path="my-reports" element={<MyReports />} />
          <Route path="report" element={<ReportIssue />} />
          <Route path="profile" element={<CitizenProfile />} />
        </Route>
      )}

      {/* Default redirects based on role */}
      <Route path="/" element={
        <Navigate to={
          userRole === 'admin' ? '/admin' :
          userRole === 'public_admin' ? '/pa' :
          '/user'
        } replace />
      } />
      
      {/* Catch all - redirect to appropriate dashboard */}
      <Route path="*" element={
        <Navigate to={
          userRole === 'admin' ? '/admin' :
          userRole === 'public_admin' ? '/pa' :
          '/user'
        } replace />
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;