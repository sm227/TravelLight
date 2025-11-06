import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Stack
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { SsoProviderType } from '../types/auth';
import { GoogleAuthService } from '../services/googleAuth';
import { KakaoAuthService } from '../services/kakaoAuth';
import googleLogo from '../assets/images/google-logo.svg';
import kakaoLogo from '../assets/images/kakao-logo.svg';

// 대한항공 스타일 TextField
const KoreanAirTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #E5E7EB',
    fontSize: '16px',
    fontWeight: 400,
    transition: 'all 0.2s ease',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      borderColor: '#0F4C81',
    },
    '&.Mui-focused': {
      borderColor: '#0F4C81',
      boxShadow: '0 0 0 3px rgba(15, 76, 129, 0.1)',
    },
    '&.Mui-error': {
      borderColor: '#DC2626',
      '&:hover, &.Mui-focused': {
        borderColor: '#DC2626',
        boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.1)',
      }
    }
  },
  '& .MuiInputLabel-root': {
    color: '#6B7280',
    fontSize: '16px',
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#0F4C81',
    },
    '&.Mui-error': {
      color: '#DC2626',
    }
  },
  '& .MuiInputBase-input': {
    padding: '16px 16px',
    fontSize: '16px',
    color: '#111827',
    fontWeight: 400,
  },
  '& .MuiFormHelperText-root': {
    marginLeft: '2px',
    marginTop: '6px',
    fontSize: '14px',
    fontWeight: 500,
  }
}));

// 대한항공 스타일 Button
const KoreanAirButton = styled(Button)(({ theme }) => ({
  borderRadius: '4px',
  padding: '14px 24px',
  fontSize: '16px',
  fontWeight: 600,
  textTransform: 'none',
  backgroundColor: '#0F4C81',
  color: '#FFFFFF',
  minHeight: '52px',
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#0A3B66',
    boxShadow: '0 4px 12px rgba(15, 76, 129, 0.3)',
  },
  '&:active': {
    backgroundColor: '#082E52',
  },
  '&:disabled': {
    backgroundColor: '#D1D5DB',
    color: '#9CA3AF',
  }
}));

// 구글 로그인 버튼
const GoogleLoginButton = styled(Button)(({ theme }) => ({
  borderRadius: '4px',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: 500,
  textTransform: 'none',
  backgroundColor: '#FFFFFF',
  color: '#1F2937',
  border: '2px solid #E5E7EB',
  minHeight: '48px',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  '&:hover': {
    backgroundColor: '#F9FAFB',
    borderColor: '#9CA3AF',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  '&:active': {
    backgroundColor: '#F3F4F6',
  }
}));

// 카카오 로그인 버튼
const KakaoLoginButton = styled(Button)(({ theme }) => ({
  borderRadius: '4px',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: 600,
  textTransform: 'none',
  backgroundColor: '#FEE500',
  color: '#000000',
  border: 'none',
  minHeight: '48px',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  '&:hover': {
    backgroundColor: '#FDD835',
    boxShadow: '0 2px 8px rgba(254, 229, 0, 0.3)',
  },
  '&:active': {
    backgroundColor: '#F9C74F',
  },
  '&:disabled': {
    backgroundColor: '#F5F5F5',
    color: '#BDBDBD',
  }
}));

const Login = () => {
  const navigate = useNavigate();
  const { login, ssoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError('');
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;

    if (!email) {
      setEmailError('이메일을 입력해주세요.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('유효한 이메일 주소를 입력해주세요.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('비밀번호를 입력해주세요.');
      isValid = false;
    }

    if (isValid) {
      setIsLoading(true);
      try {
        await login({
          email,
          password,
        });
        setLoginSuccess(true);

        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (error) {
        console.error('로그인 오류:', error);
        let errorMessage = '로그인 중 오류가 발생했습니다.';

        if (axios.isAxiosError(error) && error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = () => {
    GoogleAuthService.redirectToGoogleAuth();
  };

  const handleKakaoLogin = () => {
    KakaoAuthService.redirectToKakaoAuth();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Navbar />

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 4, md: 8 } }}>
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 4, md: 6 },
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
            }}
          >
            <Box sx={{ maxWidth: '400px', mx: 'auto', width: '100%' }}>
              {/* 헤더 */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#111827',
                    mb: 1,
                    fontSize: { xs: '1.8rem', md: '2rem' }
                  }}
                >
                  로그인
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#6B7280',
                    fontSize: '16px'
                  }}
                >
                  Travelight 계정으로 로그인하세요
                </Typography>
              </Box>

              {/* 소셜 로그인 */}
              <Stack spacing={2} sx={{ mb: 3 }}>
                <GoogleLoginButton
                  fullWidth
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <Box
                    component="img"
                    src={googleLogo}
                    alt="Google"
                    sx={{ width: 20, height: 20 }}
                  />
                  Google로 계속하기
                </GoogleLoginButton>
                <KakaoLoginButton
                  fullWidth
                  onClick={handleKakaoLogin}
                  disabled={isLoading}
                >
                  <Box
                    component="img"
                    src={kakaoLogo}
                    alt="Kakao"
                    sx={{ width: 20, height: 20 }}
                  />
                  카카오로 계속하기
                </KakaoLoginButton>
              </Stack>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" sx={{ color: '#9CA3AF', px: 2 }}>
                  또는
                </Typography>
              </Divider>

              {/* 로그인 폼 */}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <KoreanAirTextField
                  required
                  fullWidth
                  id="email"
                  label="이메일 주소"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={handleEmailChange}
                  error={!!emailError}
                  helperText={emailError}
                  disabled={isLoading}
                />

                <KoreanAirTextField
                  required
                  fullWidth
                  name="password"
                  label="비밀번호"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={handlePasswordChange}
                  error={!!passwordError}
                  helperText={passwordError}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        disabled={isLoading}
                        sx={{ color: '#6B7280' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    sx={{
                      color: '#0F4C81',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    비밀번호를 잊으셨나요?
                  </Link>
                </Box>

                <KoreanAirButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading || loginSuccess}
                  sx={{
                    mb: 3,
                    backgroundColor: loginSuccess ? '#10B981' : '#0F4C81',
                    '&:hover': {
                      backgroundColor: loginSuccess ? '#10B981' : '#0A3B66',
                    }
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : loginSuccess ? (
                    <>
                      <CheckCircle sx={{ mr: 1, fontSize: 20 }} />
                      Have a good trip!
                    </>
                  ) : (
                    '로그인'
                  )}
                </KoreanAirButton>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#6B7280', display: 'inline' }}>
                    계정이 없으신가요?{' '}
                  </Typography>
                  <Link
                    component={RouterLink}
                    to="/register"
                    variant="body2"
                    sx={{
                      color: '#0F4C81',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    회원가입
                  </Link>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login; 