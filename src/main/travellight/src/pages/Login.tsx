import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Link, 
  Grid,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  Divider,
  Tooltip
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  LockOutlined, 
  EmailOutlined,
  Luggage,
  LocationOn,
  DateRange,
  Badge,
  Home as HomeIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { alpha, styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import PageTransition from '../components/PageTransition';
import { useTranslation } from 'react-i18next';

// 애니메이션 정의
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const passportFloat = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-6px) rotate(0.5deg);
  }
`;

// 여권 스타일 컴포넌트의 props 타입 정의
interface PassportContainerProps {
  language: string;
}

// 여권 스타일 컨테이너
const PassportContainer = styled(Paper)<PassportContainerProps>(({ theme, language }) => ({
  position: 'relative',
  borderRadius: '8px',
  background: language === 'ko' 
    ? 'linear-gradient(135deg, #001F3F 0%, #003366 100%)' // 한국 여권 색상 (진한 네이비 블루)
    : 'linear-gradient(135deg, #1B1B4B 0%, #272768 100%)', // 미국 여권 색상 (진한 로얄 블루)
  border: `3px solid ${language === 'ko' ? '#001F3F' : '#1B1B4B'}`,
  padding: theme.spacing(4),
  boxShadow: language === 'ko'
    ? '0 20px 40px rgba(0, 31, 63, 0.4)'
    : '0 20px 40px rgba(27, 27, 75, 0.4)',
  overflow: 'visible',
  animation: `${passportFloat} 4s ease-in-out infinite`,
  color: '#f7fafc',
  width: '100%',
  maxWidth: '800px',
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(4),
  
  // 여권 코너 장식
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '12px',
    left: '12px',
    width: '25px',
    height: '25px',
    background: language === 'ko'
      ? 'linear-gradient(45deg, #001F3F, #003366)'
      : 'linear-gradient(45deg, #1B1B4B, #272768)',
    clipPath: 'polygon(0 0, 100% 0, 0 100%)',
    borderRadius: '2px 0 0 0',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '25px',
    height: '25px',
    background: language === 'ko'
      ? 'linear-gradient(45deg, #001F3F, #003366)'
      : 'linear-gradient(45deg, #1B1B4B, #272768)',
    clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
    borderRadius: '0 2px 0 0',
  },
  
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    maxWidth: '400px',
    padding: theme.spacing(3),
  },
}));

// 여권 왼쪽 섹션 (사진 및 정보)
const PassportLeftSection = styled(Box)(({ theme }) => ({
  flex: '0 0 35%',
  borderRight: '2px solid rgba(255, 255, 255, 0.1)',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  
  [theme.breakpoints.down('md')]: {
    borderRight: 'none',
    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: theme.spacing(3),
  },
}));

// 여권 오른쪽 섹션 (로그인 폼)
const PassportRightSection = styled(Box)(({ theme }) => ({
  flex: '1',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

// 여권 사진 영역
const PassportPhoto = styled(Box)(({ theme }) => ({
  width: '120px',
  height: '150px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  
  '& .MuiSvgIcon-root': {
    fontSize: '100px',
    color: 'rgba(255, 255, 255, 0.3)',
    transform: 'rotate(-15deg)', // 캐리어 아이콘을 살짝 기울임
  },
}));

// 내부 페이지 스타일
const PassportInnerPage = styled(Box)(({ theme }) => ({
  background: '#f7fafc',
  borderRadius: '6px',
  padding: theme.spacing(4),
  border: '1px solid #e2e8f0',
  color: '#1a202c',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80%',
    height: '2px',
    background: 'repeating-linear-gradient(90deg, #cbd5e0 0px, #cbd5e0 10px, transparent 10px, transparent 20px)',
  },
}));

// 여권 스타일 텍스트필드
const PassportTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3.5),
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e0',
    fontFamily: '"Inter", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#4a5568',
      backgroundColor: '#f8f9fa',
      boxShadow: '0 2px 8px rgba(74, 85, 104, 0.1)',
      '& input': {
        color: '#1a202c !important',
      },
    },
    '&.Mui-focused': {
      borderColor: '#38a169',
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 12px rgba(56, 161, 105, 0.2)',
      '& input': {
        color: '#1a202c !important',
      },
  },
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputBase-input': {
    padding: '14px 12px',
    fontSize: '0.9rem',
    fontFamily: '"Inter", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif !important',
    color: '#1a202c !important',
    '&::placeholder': {
      color: '#a0aec0 !important',
      fontFamily: '"Inter", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif !important',
    },
    '&:hover': {
      color: '#1a202c !important',
    },
    '&:focus': {
      color: '#1a202c !important',
    },
  },
}));

// 여권 입국 버튼
const PassportEntryButton = styled(Button)(({ theme }) => ({
  borderRadius: '6px',
  padding: '14px 32px',
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'none',
  background: 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)',
  color: 'white',
  border: '2px solid transparent',
  transition: 'all 0.3s ease',
  fontFamily: 'inherit',
  
  '&:hover': {
    background: 'linear-gradient(135deg, #2f855a 0%, #276749 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(56, 161, 105, 0.3)',
  },
  
  '&:disabled': {
    background: '#a0aec0',
    color: '#718096',
  },
}));

// 배경 장식 요소
const BackgroundDecorations = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 0,
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '15%',
    right: '10%',
    width: '100px',
    height: '100px',
    background: 'linear-gradient(45deg, #2d3748, #1a365d)',
    borderRadius: '50%',
    opacity: 0.1,
    animation: `${passportFloat} 5s ease-in-out infinite`,
  },
  
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '20%',
    left: '8%',
    width: '80px',
    height: '80px',
    background: 'linear-gradient(45deg, #38a169, #2f855a)',
    borderRadius: '50%',
    opacity: 0.1,
    animation: `${passportFloat} 4s ease-in-out infinite reverse`,
  },
});

// 홈 버튼 스타일
const HomeButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  top: '20px',
  left: '20px',
  borderRadius: '50%',
  minWidth: '48px',
  width: '48px',
  height: '48px',
  padding: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  border: '2px solid #2d3748',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  zIndex: 10,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    backgroundColor: '#2d3748',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    '& .MuiSvgIcon-root': {
      color: '#ffffff',
    },
  },
  
  '& .MuiSvgIcon-root': {
    fontSize: '24px',
    color: '#2d3748',
    transition: 'all 0.3s ease',
  },
}));

const Login = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // 페이지 로드 시 스크롤을 맨 위로 이동
  React.useEffect(() => {
    // 즉시 실행
    window.scrollTo(0, 0);
    
    // 약간의 지연 후에도 실행 (브라우저 렌더링 완료 후)
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

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
    setSnackbar({...snackbar, open: false});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;

    // 간단한 유효성 검사
    if (!email) {
      setEmailError('이메일을 입력해주세요');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('유효한 이메일 주소를 입력해주세요');
      isValid = false;
    }

    if (!password) {
      setPasswordError('비밀번호를 입력해주세요');
      isValid = false;
    }

    if (isValid) {
      setIsLoading(true);
      try {
        const response = await userService.login({
          email,
          password
        });
        
        // 로그인 성공 시 사용자 정보 저장
        login(response.data);
        
        // 전환 애니메이션 시작
        setShowTransition(true);
        
      } catch (error: any) {
        console.error('로그인 오류:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || '보관함 이용 승인 중 오류가 발생했습니다.',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 전환 애니메이션 완료 후 홈 페이지로 이동
  const handleTransitionComplete = () => {
    navigate('/');
    // 애니메이션이 완전히 끝난 후 상태 초기화
    setTimeout(() => {
      setShowTransition(false);
    }, 100);
  };

  // 현재 언어에 따른 국가 표시 (영문으로 통일)
  const getCountryName = () => {
    return i18n.language === 'ko' 
      ? 'REPUBLIC OF KOREA'
      : 'UNITED STATES OF AMERICA';
  };

  // 국가 코드 표시
  const getCountryCode = () => {
    return i18n.language === 'ko' ? 'KOR' : 'USA';
  };

  // 언어별 텍스트 반환
  const getLocalizedText = () => ({
    memberLogin: i18n.language === 'ko' ? '회원 로그인' : 'MEMBER LOGIN',
    email: i18n.language === 'ko' ? '이메일' : 'Email',
    password: i18n.language === 'ko' ? '비밀번호' : 'Password',
    loginButton: i18n.language === 'ko' ? '보관함 이용하기' : 'Access Storage',
    loginLoading: i18n.language === 'ko' ? '로그인 중...' : 'Logging in...',
    forgotPassword: i18n.language === 'ko' ? '🔐 비밀번호 찾기' : '🔐 Forgot Password',
    register: i18n.language === 'ko' ? '📝 회원가입' : '📝 Sign Up',
    storageService: i18n.language === 'ko' ? '안전한 여행 짐 보관' : 'SECURE BAGGAGE STORAGE',
    issuedBy: i18n.language === 'ko' ? '발행처' : 'ISSUED BY',
    homeButton: i18n.language === 'ko' ? '홈으로 돌아가기' : 'Return to Home',
  });

  const localizedText = getLocalizedText();

  return (
    <>
      <BackgroundDecorations />
      {!showTransition && (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
            py: 4,
            background: i18n.language === 'ko'
              ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)'
              : 'linear-gradient(135deg, #f0f2f5 0%, #e6e9f0 50%, #dce1e9 100%)',
            position: 'relative',
      }}
    >
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
                animation: `${fadeIn} 0.8s ease-out`,
          }}
        >
              {/* 여권 타이틀 */}
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography 
                  variant="h6" 
            sx={{ 
                    color: '#4a5568',
                    fontWeight: 600,
                    mb: 1,
                    letterSpacing: '0.1em',
            }}
          >
                  TRAVELLIGHT STORAGE SERVICE
                </Typography>
              <Typography 
                  variant="body2" 
                sx={{ 
                    color: '#718096',
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                }}
              >
                  {localizedText.storageService}
              </Typography>
            </Box>

              <PassportContainer elevation={0} language={i18n.language}>
                {/* 왼쪽 섹션 - 사진 및 정보 */}
                <PassportLeftSection>
                  <PassportPhoto>
                    <Luggage />
                  </PassportPhoto>
                  <Typography variant="body2" sx={{ color: '#a0aec0', textAlign: 'center', mb: 1 }}>
                    {getCountryName()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#a0aec0', textAlign: 'center', fontSize: '0.8rem' }}>
                    {getCountryCode()}
                  </Typography>
                  <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#a0aec0' }}>
                      {localizedText.issuedBy}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#f7fafc', fontWeight: 600 }}>
                      TRAVELLIGHT
                    </Typography>
                  </Box>
                </PassportLeftSection>

                {/* 오른쪽 섹션 - 로그인 폼 */}
                <PassportRightSection>
                  <Typography variant="h5" sx={{ color: '#f7fafc', fontWeight: 700, mb: 2 }}>
                    {localizedText.memberLogin}
                  </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                      margin="normal"
                required
                fullWidth
                id="email"
                      label={localizedText.email}
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={handleEmailChange}
                error={!!emailError}
                helperText={emailError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                            <EmailOutlined sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    </InputAdornment>
                  ),
                }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#f7fafc',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#48bb78',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&.Mui-focused': {
                            color: '#48bb78',
                          },
                        },
                      }}
              />
                    <TextField
                      margin="normal"
                required
                fullWidth
                name="password"
                      label={localizedText.password}
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                error={!!passwordError}
                helperText={passwordError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                            <LockOutlined sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                              sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#f7fafc',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#48bb78',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&.Mui-focused': {
                            color: '#48bb78',
                          },
                        },
                      }}
              />

                    <PassportEntryButton
                type="submit"
                fullWidth
                variant="contained"
                disableElevation
                      sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
                      startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                      {isLoading ? localizedText.loginLoading : localizedText.loginButton}
                    </PassportEntryButton>
              
                    <Grid container spacing={2} justifyContent="center" alignItems="center">
                      <Grid item xs={12} sm={6}>
                  <Link 
                    component={RouterLink} 
                    to="/forgot-password" 
                    variant="body2"
                    sx={{
                            color: '#a0aec0',
                      textDecoration: 'none',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                      '&:hover': {
                        textDecoration: 'underline',
                              color: '#f7fafc',
                      }
                    }}
                  >
                          {localizedText.forgotPassword}
                  </Link>
                </Grid>
                      <Grid item xs={12} sm={6}>
                  <Link 
                    component={RouterLink} 
                    to="/register" 
                    variant="body2"
                    sx={{
                            color: '#48bb78',
                      textDecoration: 'none',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                          {localizedText.register}
                  </Link>
                </Grid>
              </Grid>
            </Box>
                </PassportRightSection>
              </PassportContainer>
            </Box>
          </Container>
        </Box>
      )}
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: '4px',
            border: '1px solid',
            borderColor: snackbar.severity === 'success' ? '#2b6cb0' : '#e53e3e',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <PageTransition show={showTransition} onComplete={handleTransitionComplete} />

      {/* 홈 버튼 추가 */}
      <Tooltip title={localizedText.homeButton} placement="right">
        <Link
          component={RouterLink}
          to="/"
          sx={{ textDecoration: 'none' }}
        >
          <HomeButton>
            <HomeIcon />
          </HomeButton>
        </Link>
      </Tooltip>
    </>
  );
};

export default Login; 