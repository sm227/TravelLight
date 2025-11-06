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
  Paper,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import Navbar from '../components/Navbar';

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

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeTermsError, setAgreeTermsError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // 입력 시 에러 메시지 초기화
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleAgreeTerms = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgreeTerms(e.target.checked);
    setAgreeTermsError('');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };
    
    // 이름 검증
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
      isValid = false;
    }
    
    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요';
      isValid = false;
    }
    
    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다';
      isValid = false;
    }
    
    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
      isValid = false;
    }
    
    // 약관 동의 검증
    if (!agreeTerms) {
      setAgreeTermsError('서비스 이용약관에 동의해주세요');
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'USER'
        });
        setRegisterSuccess(true);

        // 홈 페이지로 이동
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (error) {
        console.error('회원가입 오류:', error);
        let errorMessage = '회원가입 중 오류가 발생했습니다.';

        if (axios.isAxiosError(error) && error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }
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
                  회원가입
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#6B7280',
                    fontSize: '16px'
                  }}
                >
                  Travelight와 함께 여행을 시작하세요
                </Typography>
              </Box>

              {/* 회원가입 폼 */}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <KoreanAirTextField
                  required
                  fullWidth
                  id="name"
                  label="이름"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  disabled={isLoading}
                />

                <KoreanAirTextField
                  required
                  fullWidth
                  id="email"
                  label="이메일 주소"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={isLoading}
                />

                <KoreanAirTextField
                  required
                  fullWidth
                  name="password"
                  label="비밀번호"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
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

                <KoreanAirTextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="비밀번호 확인"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                        disabled={isLoading}
                        sx={{ color: '#6B7280' }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />

                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={agreeTerms}
                        onChange={handleAgreeTerms}
                        color="primary"
                        disabled={isLoading}
                        sx={{
                          color: '#6B7280',
                          '&.Mui-checked': {
                            color: '#0F4C81',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
                        서비스 이용약관 및 개인정보 처리방침에 동의합니다
                      </Typography>
                    }
                  />
                  {agreeTermsError && (
                    <Typography color="error" variant="caption" display="block" sx={{ mt: 1, ml: 4 }}>
                      {agreeTermsError}
                    </Typography>
                  )}
                </Box>

                <KoreanAirButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading || registerSuccess}
                  sx={{
                    mb: 3,
                    backgroundColor: registerSuccess ? '#10B981' : '#0F4C81',
                    '&:hover': {
                      backgroundColor: registerSuccess ? '#10B981' : '#0A3B66',
                    }
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : registerSuccess ? (
                    <>
                      <CheckCircle sx={{ mr: 1, fontSize: 20 }} />
                      Welcome to TravelLight!
                    </>
                  ) : (
                    '회원가입'
                  )}
                </KoreanAirButton>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#6B7280', display: 'inline' }}>
                    이미 계정이 있으신가요?{' '}
                  </Typography>
                  <Link
                    component={RouterLink}
                    to="/login"
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
                    로그인
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

export default Register; 