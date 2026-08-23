import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { ErrorBoundary } from './components/ErrorBoundary';

// Page components
// Page components
import { lazy, Suspense } from 'react';
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const MaternalPortal = lazy(() => import('./pages/MaternalPortal'));
const ChildPortal = lazy(() => import('./pages/ChildPortal'));
const ChronicPortal = lazy(() => import('./pages/ChronicPortal'));
const HospitalDashboard = lazy(() => import('./pages/HospitalDashboard'));
const CommandCenter = lazy(() => import('./pages/CommandCenter'));
const MaternalHealthAnalytics = lazy(() => import('./pages/MaternalHealthAnalytics'));
const AdminGovernanceCenter = lazy(() => import('./pages/AdminGovernanceCenter'));

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
              <ErrorBoundary>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f6fafe] dark:bg-slate-950 text-slate-400 font-bold">Loading Platform...</div>}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />

                    {/* Frontline ASHA Portals */}
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

                    {/* Command Center & Hospital Routing (DHO & Staff) */}
                    <Route 
                      path="/command-center" 
                      element={
                        <ProtectedRoute allowedRoles={['dho_command', 'hospital_staff']}>
                          <CommandCenter />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/hospital" 
                      element={
                        <ProtectedRoute allowedRoles={['dho_command', 'hospital_staff']}>
                          <HospitalDashboard />
                        </ProtectedRoute>
                      } 
                    />

                    {/* High-Level State Analytics (CMO & DHO) */}
                    <Route 
                      path="/analytics" 
                      element={
                        <ProtectedRoute allowedRoles={['dho_command', 'hospital_staff']}>
                          <MaternalHealthAnalytics />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Admin & Governance Center (DHO / State Admin) */}
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute allowedRoles={['dho_command']}>
                          <AdminGovernanceCenter />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Catch-all fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
