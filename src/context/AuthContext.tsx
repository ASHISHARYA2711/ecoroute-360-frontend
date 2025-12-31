import { createContext, useContext, useState, useEffect } from 'react';
import type { UserRole } from '../types/user';

interface AuthContextType {
  role: UserRole | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role') as UserRole | null;
    if (storedRole) setRole(storedRole);
  }, []);

  const login = (newRole: UserRole) => {
    localStorage.setItem('role', newRole);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.removeItem('role');
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
