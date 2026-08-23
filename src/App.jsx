import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Page components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import MaternalPortal from './pages/MaternalPortal';
import ChildPortal from './pages/ChildPortal';
import ChronicPortal from './pages/ChronicPortal';
import HospitalDashboard from './pages/HospitalDashboard';
import CommandCenter from './pages/CommandCenter';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect unauthenticated visitors to Login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role-based routing redirect
    if (user.role === 'asha') return <Navigate to="/asha/maternal" replace />;
    if (user.role === 'hospital_staff') return <Navigate to="/hospital" replace />;
    return <Navigate to="/command-center" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-[#f6fafe] dark:bg-slate-950 text-[#191c1e] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
              <Navbar />
              <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Frontline ASHA Portals */}
                <Route 
                  path="/asha/maternal" 
                  element={
                    <ProtectedRoute allowedRoles={['asha', 'dho_command', 'hospital_staff']}>
                      <MaternalPortal />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/asha/child" 
                  element={
                    <ProtectedRoute allowedRoles={['asha', 'dho_command', 'hospital_staff']}>
                      <ChildPortal />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/asha/chronic" 
                  element={
                    <ProtectedRoute allowedRoles={['asha', 'dho_command', 'hospital_staff']}>
                      <ChronicPortal />
                    </ProtectedRoute>
                  } 
                />

                {/* Protected Hospital Staff Dashboard */}
                <Route 
                  path="/hospital" 
                  element={
                    <ProtectedRoute allowedRoles={['hospital_staff', 'dho_command']}>
                      <HospitalDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Protected DHO District Command Center */}
                <Route 
                  path="/command-center" 
                  element={
                    <ProtectedRoute allowedRoles={['dho_command']}>
                      <CommandCenter />
                    </ProtectedRoute>
                  } 
                />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
