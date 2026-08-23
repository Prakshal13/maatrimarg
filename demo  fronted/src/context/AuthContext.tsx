import React, { createContext, useContext, useState, useEffect } from 'react';

interface ClinicianUser {
  id: string;
  name: string;
  role: string;
  hospital: string;
  avatarUrl: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: ClinicianUser | null;
  login: (clinicianId: string, securityKey: string) => Promise<boolean>;
  logout: () => void;
}

const DEFAULT_USER: ClinicianUser = {
  id: 'MH-DOC-8492',
  name: 'Dr. Ananya Deshmukh',
  role: 'Chief Medical Officer & Regional Director',
  hospital: 'Maharashtra Maternal Command Hub',
  avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('maatrimarg_auth') === 'true';
  });

  const [user, setUser] = useState<ClinicianUser | null>(() => {
    const saved = localStorage.getItem('maatrimarg_user');
    return saved ? JSON.parse(saved) : (isAuthenticated ? DEFAULT_USER : null);
  });

  useEffect(() => {
    localStorage.setItem('maatrimarg_auth', isAuthenticated ? 'true' : 'false');
    if (user) {
      localStorage.setItem('maatrimarg_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('maatrimarg_user');
    }
  }, [isAuthenticated, user]);

  const login = async (clinicianId: string, _securityKey: string): Promise<boolean> => {
    // Simulate brief authentication check
    await new Promise(r => setTimeout(r, 400));
    const activeUser: ClinicianUser = {
      ...DEFAULT_USER,
      id: clinicianId || DEFAULT_USER.id
    };
    setUser(activeUser);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('maatrimarg_auth');
    localStorage.removeItem('maatrimarg_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
