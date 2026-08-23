import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/endpoints';

const AuthContext = createContext();

export const DEMO_PROFILES = [
  {
    role: 'asha',
    label: 'ASHA / PHC Worker',
    icon: 'local_hospital',
    username: '9876543210',
    facility_or_district_id: 'PHC-Bhamragad (Gadchiroli)',
    description: 'Field vitals entry, maternal risk scoring & 108 dispatch',
  },
  {
    role: 'hospital_staff',
    label: 'Hospital Staff / CMO',
    icon: 'emergency',
    username: 'cmo_hospital_1',
    facility_or_district_id: '1',
    description: 'Live bed/NICU/blood capacity editor & referral acknowledgment',
  },
  {
    role: 'dho_command',
    label: 'DHO / District Command',
    icon: 'dashboard',
    username: 'dho_command_hq',
    facility_or_district_id: 'District HQ (MH / TN)',
    description: 'Real-time hospital network grid, analytics & ABDM audit trail',
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('maatrimarg_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (username, password, role, facility_or_district_id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.login({
        username,
        password: password || 'demo_pin',
        role,
        facility_or_district_id: facility_or_district_id || 'MH-TN-Network',
      });
      const data = response.data;
      const userData = {
        username: data.user.username,
        role: data.user.role,
        facility_or_district_id: data.user.facility_or_district_id,
        token: data.access_token,
      };
      localStorage.setItem('maatrimarg_token', data.access_token);
      localStorage.setItem('maatrimarg_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      console.warn('API login fallback to mock profile:', err);
      // Fallback demo login for offline/standalone evaluation
      const fallbackUser = {
        username,
        role,
        facility_or_district_id: facility_or_district_id || 'MH-TN-Facility',
        token: 'demo-token-' + Date.now(),
      };
      localStorage.setItem('maatrimarg_token', fallbackUser.token);
      localStorage.setItem('maatrimarg_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return fallbackUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('maatrimarg_token');
    localStorage.removeItem('maatrimarg_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
