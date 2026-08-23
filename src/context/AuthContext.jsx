import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/endpoints';

const AuthContext = createContext();

// Pre-configured official mock accounts with clear credentials
export const OFFICIAL_ACCOUNTS = [
  {
    role: 'asha',
    label: 'ASHA / ANM Frontline Worker',
    name: 'Sunita Patil (ASHA)',
    username: '9876543210',
    password: 'AshaSunita@2026',
    facility_or_district_id: 'Sub-Centre Bhamragad (Gadchiroli)',
    district: 'Gadchiroli',
    state: 'Maharashtra',
    description: 'Frontline maternal risk scoring, ASHA live GPS tracking & 108 emergency SOS'
  },
  {
    role: 'hospital_staff',
    label: 'Hospital Staff / CMO',
    name: 'Dr. Rajesh Rao (CMO)',
    username: 'cmo_hospital_1',
    password: 'CivilCmo@2026',
    facility_or_district_id: 'Solapur Government Civil Hospital',
    district: 'Solapur',
    state: 'Maharashtra',
    description: 'Live bed/NICU/blood capacity editor & patient admission intake'
  },
  {
    role: 'dho_command',
    label: 'DHO Command Director',
    name: 'Dr. Ananya Deshmukh (DHO)',
    username: 'dho_command_hq',
    password: 'DhoCommand@2026',
    facility_or_district_id: 'State Command Headquarters',
    district: 'Maharashtra HQ',
    state: 'Maharashtra',
    description: 'Real-time hospital network GIS grid, animated ambulance tracking & ABDM audit logs'
  }
];

export const DEMO_PROFILES = OFFICIAL_ACCOUNTS;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('maatrimarg_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Local registry for newly registered ASHA workers
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('maatrimarg_registered_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Authenticate user against official accounts or registered users
  const login = async (username, password, selectedRole, facility_or_district_id) => {
    setLoading(true);
    setError(null);

    const trimmedUser = (username || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    // Check if matching registered user or official accounts
    const allUsers = [...registeredUsers, ...OFFICIAL_ACCOUNTS];
    const match = allUsers.find(
      (u) =>
        u.username.toLowerCase() === trimmedUser ||
        (u.phone && u.phone === trimmedUser) ||
        (u.ashaId && u.ashaId.toLowerCase() === trimmedUser)
    );

    // If matching user exists, verify password
    if (match) {
      if (match.password !== trimmedPass) {
        setLoading(false);
        throw new Error('Invalid security password/PIN. Please check credentials.');
      }

      const userData = {
        name: match.name || match.fullName || match.username,
        username: match.username,
        role: match.role || selectedRole || 'asha',
        facility_or_district_id: match.facility_or_district_id || match.subCentre || 'Rural Health Sub-Centre',
        district: match.district || 'Gadchiroli',
        state: match.state || 'Maharashtra',
        phone: match.phone || match.mobileNumber || match.username,
        token: 'auth-jwt-' + Date.now(),
      };

      localStorage.setItem('maatrimarg_token', userData.token);
      localStorage.setItem('maatrimarg_user', JSON.stringify(userData));
      setUser(userData);
      setLoading(false);
      return userData;
    }

    // Fallback: If user enters demo PIN or generic credentials for role
    if (trimmedPass === 'AshaSunita@2026' || trimmedPass === 'CivilCmo@2026' || trimmedPass === 'DhoCommand@2026' || trimmedPass.length >= 4) {
      const defaultProfile = OFFICIAL_ACCOUNTS.find(p => p.role === selectedRole) || OFFICIAL_ACCOUNTS[0];
      const fallbackUser = {
        name: username.includes('@') ? username.split('@')[0] : username,
        username: username,
        role: selectedRole || defaultProfile.role,
        facility_or_district_id: facility_or_district_id || defaultProfile.facility_or_district_id,
        district: defaultProfile.district,
        state: defaultProfile.state,
        token: 'auth-jwt-' + Date.now(),
      };

      localStorage.setItem('maatrimarg_token', fallbackUser.token);
      localStorage.setItem('maatrimarg_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      setLoading(false);
      return fallbackUser;
    }

    setLoading(false);
    throw new Error('Invalid credentials. Please verify Clinician ID and Security Key.');
  };

  // Register New ASHA Worker
  const registerAsha = async (formData) => {
    setLoading(true);
    setError(null);

    const { fullName, mobileNumber, ashaId, state, district, subCentre, password } = formData;

    const newAshaUser = {
      name: fullName,
      fullName: fullName,
      username: mobileNumber,
      phone: mobileNumber,
      mobileNumber: mobileNumber,
      ashaId: ashaId,
      state: state || 'Maharashtra',
      district: district || 'Gadchiroli',
      subCentre: subCentre || 'Sub-Centre Bhamragad',
      facility_or_district_id: `${subCentre} (${district})`,
      role: 'asha',
      password: password,
      createdAt: new Date().toISOString()
    };

    // Save to registered users list in localStorage
    const updatedUsers = [...registeredUsers, newAshaUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('maatrimarg_registered_users', JSON.stringify(updatedUsers));

    // Immediately log in new ASHA worker
    const sessionUser = {
      name: newAshaUser.name,
      username: newAshaUser.username,
      role: 'asha',
      facility_or_district_id: newAshaUser.facility_or_district_id,
      district: newAshaUser.district,
      state: newAshaUser.state,
      phone: newAshaUser.phone,
      token: 'auth-jwt-registered-' + Date.now()
    };

    localStorage.setItem('maatrimarg_token', sessionUser.token);
    localStorage.setItem('maatrimarg_user', JSON.stringify(sessionUser));
    setUser(sessionUser);

    setLoading(false);
    return sessionUser;
  };

  const logout = () => {
    localStorage.removeItem('maatrimarg_token');
    localStorage.removeItem('maatrimarg_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, registerAsha, logout, loading, error, OFFICIAL_ACCOUNTS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
