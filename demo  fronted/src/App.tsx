import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeLanguageProvider } from './context/ThemeLanguageContext';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { HospitalsPage } from './pages/HospitalsPage';
import { RiskAssessmentPage } from './pages/RiskAssessmentPage';
import { AdminPage } from './pages/AdminPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export const App: React.FC = () => {
  return (
    <ThemeLanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/command-center" element={<CommandCenterPage />} />
            <Route path="/hospitals" element={<HospitalsPage />} />
            <Route path="/risk-assessment" element={<RiskAssessmentPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin-panel" element={<Navigate to="/admin" replace />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeLanguageProvider>
  );
};

export default App;
