import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import Navbar from '../components/Navbar';
import { useAuth } from '../services/AuthContext';
import { useTranslation } from 'react-i18next';
import { userService, PasswordChangeRequest } from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // 비밀번호 변경 관련 상태
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  
  const handleChangePassword = async () => {
    // 유효성 검사
    if (!currentPassword) {
      setPasswordError('현재 비밀번호를 입력해주세요');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('새 비밀번호를 입력해주세요');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다');
      return;
    }
    
    try {
      const passwordChangeRequest: PasswordChangeRequest = {
        currentPassword,
        newPassword
      };
      
      if (user?.id) {
        await userService.changePassword(user.id, passwordChangeRequest);
        
        // 성공 메시지 표시 및 입력 필드 초기화
        setPasswordSuccess('비밀번호가 성공적으로 변경되었습니다');
        setPasswordError(null);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // 3초 후 성공 메시지 제거
        setTimeout(() => {
          setPasswordSuccess(null);
        }, 3000);
      }
    } catch (error: unknown) {
      console.error('비밀번호 변경 중 오류:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response && 
        error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data ? 
        (error.response.data.message as string) : '비밀번호 변경 중 오류가 발생했습니다';
      setPasswordError(errorMessage);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="sm" sx={{ mt: 8, mb: 5 }}>
        <Box sx={{ 
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f3f4f6'
        }}>
          {/* 프로필 헤더 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 600,
              fontSize: '28px',
              marginBottom: '8px',
              color: '#1a1a1a'
            }}>
              내 프로필
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#6b7280',
              fontSize: '16px'
            }}>
              계정 정보를 확인하고 비밀번호를 변경하세요.
            </Typography>
          </Box>

          {/* 사용자 정보 섹션 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              fontSize: '20px',
              marginBottom: '20px',
              color: '#1a1a1a',
              position: 'relative',
              paddingBottom: '8px',
              '&::after': {
                content: '""',
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '32px',
                height: '2px',
                background: '#2563eb'
              }
            }}>
              내 정보
            </Typography>
            
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              padding: '16px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #f3f4f6'
            }}>
              <Typography variant="body1" sx={{ 
                fontWeight: 500,
                width: '100px',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                이름
              </Typography>
              <Typography variant="body1" sx={{ 
                flex: 1,
                color: '#1a1a1a',
                fontWeight: 400,
                fontSize: '14px'
              }}>
                {user?.name}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              padding: '16px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #f3f4f6'
            }}>
              <Typography variant="body1" sx={{ 
                fontWeight: 500,
                width: '100px',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                이메일
              </Typography>
              <Typography variant="body1" sx={{ 
                flex: 1,
                color: '#1a1a1a',
                fontWeight: 400,
                fontSize: '14px'
              }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
          
          {/* 비밀번호 변경 섹션 */}
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              fontSize: '20px',
              marginBottom: '20px',
              color: '#1a1a1a',
              position: 'relative',
              paddingBottom: '8px',
              '&::after': {
                content: '""',
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '32px',
                height: '2px',
                background: '#2563eb'
              }
            }}>
              비밀번호 변경
            </Typography>
            
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                {passwordError}
              </Alert>
            )}
            
            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>
                {passwordSuccess}
              </Alert>
            )}
            
            <Box sx={{ mb: 2 }}>
              <TextField
                label="현재 비밀번호"
                type="password"
                fullWidth
                margin="normal"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                sx={{
                  '& .MuiTextField-root': {
                    background: 'white',
                    borderRadius: '8px'
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e5e7eb'
                  },
                  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d1d5db'
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2563eb',
                    borderWidth: '2px'
                  }
                }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <TextField
                label="새 비밀번호"
                type="password"
                fullWidth
                margin="normal"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{
                  '& .MuiTextField-root': {
                    background: 'white',
                    borderRadius: '8px'
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e5e7eb'
                  },
                  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d1d5db'
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2563eb',
                    borderWidth: '2px'
                  }
                }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <TextField
                label="비밀번호 확인"
                type="password"
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{
                  '& .MuiTextField-root': {
                    background: 'white',
                    borderRadius: '8px'
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e5e7eb'
                  },
                  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d1d5db'
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2563eb',
                    borderWidth: '2px'
                  }
                }}
              />
            </Box>
            
            <Box sx={{ 
              marginTop: '24px',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleChangePassword}
                sx={{
                  background: '#2563eb',
                  color: 'white',
                  padding: '12px 24px',
                  fontWeight: 500,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: '#1d4ed8'
                  }
                }}
              >
                비밀번호 변경하기
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Profile;



