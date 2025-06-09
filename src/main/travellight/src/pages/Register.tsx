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
  Grid,
  Stack,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  FlightTakeoff,
  TravelExplore,
  Luggage,
  CheckCircle,
  Security,
  Language,
  PersonAdd
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
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
  const { login } = useAuth();
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
        const response = await userService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'USER'
        });
        
        // 회원가입 성공 시 로그인 처리
        login(response.data);
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

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', py: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={0} sx={{ minHeight: { md: '700px' } }}>
            {/* 왼쪽 브랜딩 섹션 */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: { xs: 4, md: 6 },
                  borderRadius: { xs: '12px 12px 0 0', md: '12px 0 0 12px' },
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Hero와 같은 장식 요소들 */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '20%',
                    right: '15%',
                    width: '120px',
                    height: '120px',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0) 70%)',
                    borderRadius: '50%',
                    zIndex: 0,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '15%',
                    left: '10%',
                    width: '80px',
                    height: '80px',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0) 70%)',
                    borderRadius: '50%',
                    zIndex: 0,
                  }}
                />

                <Box sx={{ textAlign: 'center', zIndex: 1, maxWidth: '400px' }}>
                  <Box sx={{ mb: 4 }}>
                    <PersonAdd sx={{ fontSize: 64, color: '#10B981', mb: 2, opacity: 0.9 }} />
                  </Box>

                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: '#0F172A',
                      mb: 2,
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em'
                    }}
                  >
                    새로운 여행의{' '}
                    <Box component="span" sx={{ color: '#10B981' }}>
                      시작
                    </Box>
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: '#64748B',
                      mb: 6,
                      fontWeight: 400,
                      lineHeight: 1.6,
                      fontSize: '16px'
                    }}
                  >
                    지금 가입하고 편리한 짐 보관 서비스를<br />
                    무료로 체험해보세요
                  </Typography>

                  {/* 특징 리스트 */}
                  <Stack spacing={3} sx={{ mt: 4, textAlign: 'left' }}>
                    {[
                      { icon: '🎁', text: '신규 가입 특별 혜택' },
                      { icon: '⚡', text: '즉시 이용 가능' },
                      { icon: '🛡️', text: '안전한 개인정보 보호' }
                    ].map((feature, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                          fontSize: '20px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0'
                        }}>
                          {feature.icon}
                        </Box>
                        <Typography sx={{
                          color: '#475569',
                          fontSize: '15px',
                          fontWeight: 500,
                          lineHeight: 1.4
                        }}>
                          {feature.text}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  {/* 하단 정보 */}
                  <Box sx={{
                    mt: 6,
                    pt: 4,
                    borderTop: '1px solid #E2E8F0'
                  }}>
                    <Typography sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#10B981',
                      letterSpacing: '1px',
                      mb: 1
                    }}>
                      JOIN TRAVELLIGHT
                    </Typography>
                    <Typography sx={{
                      fontSize: '12px',
                      color: '#94A3B8',
                      lineHeight: 1.4
                    }}>
                      수십만 여행자들이 선택한<br />
                      믿을 수 있는 짐 보관 서비스
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* 오른쪽 회원가입 폼 */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: { xs: 4, md: 6 },
                  borderRadius: { xs: '0 0 12px 12px', md: '0 12px 12px 0' },
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
                      TravelLight와 함께 여행을 시작하세요
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
            </Grid>
          </Grid>
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