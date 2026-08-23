import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

// Page components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import MaternalPortal from './pages/MaternalPortal';
import ChildPortal from './pages/ChildPortal';
import ChronicPortal from './pages/ChronicPortal';
import HospitalDashboard from './pages/HospitalDashboard';
import CommandCenter from './pages/CommandCenter';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#f6fafe] flex flex-col font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/asha/maternal" element={<MaternalPortal />} />
                <Route path="/asha/child" element={<ChildPortal />} />
                <Route path="/asha/chronic" element={<ChronicPortal />} />
                <Route path="/hospital" element={<HospitalDashboard />} />
                <Route path="/command-center" element={<CommandCenter />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
