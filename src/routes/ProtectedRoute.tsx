import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/user';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  allowedRole: UserRole;
  children: ReactNode;
}

const ProtectedRoute = ({ allowedRole, children }: ProtectedRouteProps) => {
  const { role } = useAuth();

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
