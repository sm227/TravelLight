import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const COLORS = {
  backgroundDark: '#0f0f11',
  accentPrimary: '#3b82f6',
  textSecondary: '#a1a1aa',
};

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isInitialLoading } = useAuth();

  // 초기 로딩 중이면 로딩 화면 표시
  if (isInitialLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: COLORS.backgroundDark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={40} 
            sx={{ 
              color: COLORS.accentPrimary,
              mb: 2
            }} 
          />
          <Typography variant="body2" sx={{ 
            color: COLORS.textSecondary,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: 'monospace',
            fontWeight: 600
          }}>
            VERIFYING ACCESS...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    // 인증되지 않았거나 관리자가 아닌 경우 관리자 로그인 페이지로 리다이렉트
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute; 