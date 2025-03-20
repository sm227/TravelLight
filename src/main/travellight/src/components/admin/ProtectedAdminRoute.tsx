import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || !isAdmin) {
    // 인증되지 않았거나 관리자가 아닌 경우 관리자 로그인 페이지로 리다이렉트
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute; 