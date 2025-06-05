import React, { useState, useEffect } from 'react';
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
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  Divider,
  CircularProgress,
  useTheme,
  Tooltip
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  PersonOutline, 
  EmailOutlined, 
  LockOutlined,
  FlightLand,
  Business,
  Assignment,
  Today,
  Check,
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

const formFloat = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-3px);
  }
`;

const slideDown = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(150%);
    opacity: 0;
  }
`;

// 도장 애니메이션
const stampAnimation = keyframes`
  0% {
    transform: scale(3) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(-30deg);
    opacity: 0.5;
  }
  100% {
    transform: scale(1) rotate(-15deg);
    opacity: 1;
  }
`;

// 폼 에러 애니메이션
const shakeAnimation = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
`;

// 입국신고서 스타일 컨테이너
const ArrivalFormContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  borderRadius: '8px',
  background: '#ffffff',
  border: '3px solid #2d3748',
  padding: theme.spacing(4),
  boxShadow: '0 8px 25px rgba(45, 55, 72, 0.15)',
  overflow: 'visible',
  animation: `${formFloat} 6s ease-in-out infinite`,
  
  '&.sliding-down': {
    animation: `${slideDown} 0.5s ease-in forwards`,
  },
  
  // 공식 문서 스타일 헤더
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '8px',
    background: 'linear-gradient(90deg, #e53e3e 0%, #e53e3e 33%, #ffffff 33%, #ffffff 66%, #2b6cb0 66%, #2b6cb0 100%)',
    borderRadius: '8px 8px 0 0',
  },
  
  // 스테이플 장식
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '20px',
    left: '20px',
    width: '8px',
    height: '8px',
    background: '#718096',
    borderRadius: '50%',
    boxShadow: `
      0 0 0 2px #a0aec0,
      25px 0 0 0 #718096,
      25px 0 0 2px #a0aec0,
      0 20px 0 0 #718096,
      0 20px 0 2px #a0aec0,
      25px 20px 0 0 #718096,
      25px 20px 0 2px #a0aec0
    `,
  },
}));

// 공식 문서 텍스트필드
const OfficialTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    border: '1px solid #2d3748',
    fontFamily: '"Inter", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: '#1a202c',
      backgroundColor: '#f8f9fa',
      '& input': {
        color: '#1a202c !important',
      },
    },
    '&.Mui-focused': {
      borderColor: '#2b6cb0',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 2px rgba(43, 108, 176, 0.1)',
      '& input': {
        color: '#1a202c !important',
      },
    },
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputBase-input': {
    padding: '12px 10px',
    fontSize: '0.9rem',
    fontFamily: '"Inter", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif !important',
    color: '#1a202c !important',
    '&::placeholder': {
      textTransform: 'none',
      fontSize: '0.8rem',
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
  '& .MuiFormHelperText-root': {
    fontFamily: 'inherit',
    fontSize: '0.7rem',
    textTransform: 'none',
    marginTop: theme.spacing(1),
  },
}));

// 제출 버튼
const SubmitFormButton = styled(Button)(({ theme }) => ({
  borderRadius: '4px',
  padding: '12px 24px',
  fontWeight: 700,
  fontSize: '0.9rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  background: '#2b6cb0',
  color: 'white',
  border: '2px solid #2b6cb0',
  transition: 'all 0.3s ease',
  fontFamily: 'inherit',
  
  '&:hover': {
    background: '#2c5282',
    borderColor: '#2c5282',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(43, 108, 176, 0.3)',
  },
  
  '&:disabled': {
    background: '#a0aec0',
    borderColor: '#a0aec0',
    color: '#718096',
  },
}));

// 배경 스타일
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
    top: '10%',
    right: '5%',
    width: '120px',
    height: '120px',
    background: 'linear-gradient(45deg, #e2e8f0, #cbd5e0)',
    borderRadius: '50%',
    opacity: 0.3,
    animation: `${formFloat} 8s ease-in-out infinite`,
  },
  
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '10%',
    left: '5%',
    width: '90px',
    height: '90px',
    background: 'linear-gradient(45deg, #f7fafc, #edf2f7)',
    borderRadius: '50%',
    opacity: 0.3,
    animation: `${formFloat} 7s ease-in-out infinite reverse`,
  },
});

// 도장 컨테이너
const StampContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '120px',
  height: '120px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(56, 161, 105, 0.9)',
  borderRadius: '50%',
  border: '4px solid #fff',
  color: '#fff',
  animation: `${stampAnimation} 0.5s ease-out forwards`,
  zIndex: 10,
  boxShadow: '0 0 20px rgba(56, 161, 105, 0.4)',
  
  '& .MuiSvgIcon-root': {
    fontSize: '60px',
    transform: 'rotate(-15deg)',
  },
}));

// 에러 표시 스타일
const ErrorTextField = styled(TextField)(({ error }) => ({
  '& .MuiOutlinedInput-root': {
    animation: error ? `${shakeAnimation} 0.5s ease-in-out` : 'none',
  },
}));

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

const Register = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [isSliding, setIsSliding] = useState(false);
  const [showStamp, setShowStamp] = useState(false);

  // 언어별 텍스트 반환
  const getLocalizedText = () => ({
    // 페이지 타이틀
    title: i18n.language === 'ko' ? '회원 가입' : 'MEMBER SIGN UP',
    subtitle: i18n.language === 'ko' ? 'TravelLight 회원 가입 신청서' : 'TRAVELLIGHT MEMBERSHIP APPLICATION FORM',
    description: i18n.language === 'ko' ? '안전한 짐 보관 서비스' : 'SECURE BAGGAGE STORAGE SERVICE',
    formNumber: i18n.language === 'ko' ? '신청서 번호' : 'FORM NO.',
    
    // 서비스 정보
    service: i18n.language === 'ko' ? '짐 보관' : 'STORAGE',
    available: i18n.language === 'ko' ? '24시간' : '24 HOURS',
    security: i18n.language === 'ko' ? '안전보장' : 'SECURITY',
    
    // 회원 정보 섹션
    memberInfo: i18n.language === 'ko' ? '회원 정보' : 'MEMBER INFORMATION',
    name: i18n.language === 'ko' ? '성명' : 'FULL NAME',
    namePlaceholder: i18n.language === 'ko' ? '회원 성명을 정확히 입력하세요' : 'Enter your full name',
    email: i18n.language === 'ko' ? '이메일 주소' : 'EMAIL ADDRESS',
    emailPlaceholder: i18n.language === 'ko' ? '서비스 안내를 받을 이메일' : 'Email for service notifications',
    password: i18n.language === 'ko' ? '비밀번호' : 'PASSWORD',
    passwordPlaceholder: i18n.language === 'ko' ? '최소 8자리 이상' : 'Minimum 8 characters',
    confirmPassword: i18n.language === 'ko' ? '비밀번호 확인' : 'CONFIRM PASSWORD',
    confirmPasswordPlaceholder: i18n.language === 'ko' ? '비밀번호 재입력' : 'Re-enter password',
    
    // 약관 동의
    agreement: i18n.language === 'ko' ? '동의서' : 'AGREEMENT',
    termsText: i18n.language === 'ko' 
      ? '본인은 TravelLight 짐 보관 서비스 이용약관 및 개인정보 처리방침에 동의하며, 안전한 보관 서비스 이용을 위해 제공한 정보가 정확함을 확인합니다.'
      : 'I agree to the TravelLight Storage Service Terms and Privacy Policy, and confirm that the information provided for secure storage service is accurate.',
    
    // 버튼 및 링크
    submitButton: i18n.language === 'ko' ? 'TravelLight 가입 신청' : 'SUBMIT APPLICATION',
    submitting: i18n.language === 'ko' ? '가입 신청 처리 중...' : 'Processing...',
    alreadyMember: i18n.language === 'ko' ? '이미 TravelLight 회원이신가요?' : 'Already a TravelLight member?',
    loginLink: i18n.language === 'ko' ? '🧳 보관함 바로 이용하기 (로그인)' : '🧳 Access Storage (Login)',
    
    // 문서 정보
    location: i18n.language === 'ko' ? '대한민국' : 'KOREA',
    version: '2025.6',
    status: i18n.language === 'ko' ? '활성화' : 'ACTIVE',
    
    // 에러 메시지
    nameRequired: i18n.language === 'ko' ? '이름을 입력해주세요' : 'Please enter your name',
    emailRequired: i18n.language === 'ko' ? '이메일을 입력해주세요' : 'Please enter your email',
    emailInvalid: i18n.language === 'ko' ? '유효한 이메일 주소를 입력해주세요' : 'Please enter a valid email address',
    passwordRequired: i18n.language === 'ko' ? '비밀번호를 입력해주세요' : 'Please enter your password',
    passwordLength: i18n.language === 'ko' ? '비밀번호는 최소 8자 이상이어야 합니다' : 'Password must be at least 8 characters',
    confirmPasswordRequired: i18n.language === 'ko' ? '비밀번호 확인을 입력해주세요' : 'Please confirm your password',
    passwordMismatch: i18n.language === 'ko' ? '비밀번호가 일치하지 않습니다' : 'Passwords do not match',
    termsRequired: i18n.language === 'ko' ? '서비스 이용약관에 동의해주세요' : 'Please agree to the terms of service',
    formError: i18n.language === 'ko' ? '입력 정보를 다시 확인해주세요.' : 'Please check your input information.',
    registerError: i18n.language === 'ko' ? 'TravelLight 가입 신청 처리 중 오류가 발생했습니다.' : 'An error occurred while processing your application.',
    
    // 홈 버튼
    homeButton: i18n.language === 'ko' ? '홈으로 돌아가기' : 'Return to Home',
  });

  const localizedText = getLocalizedText();

  // 페이지 로드 시 스크롤을 맨 위로 이동
  useEffect(() => {
    // 즉시 실행
    window.scrollTo(0, 0);
    
    // 약간의 지연 후에도 실행 (브라우저 렌더링 완료 후)
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

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
    
    if (!formData.name.trim()) {
      newErrors.name = localizedText.nameRequired;
      isValid = false;
    }
    
    if (!formData.email) {
      newErrors.email = localizedText.emailRequired;
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = localizedText.emailInvalid;
      isValid = false;
    }
    
    if (!formData.password) {
      newErrors.password = localizedText.passwordRequired;
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = localizedText.passwordLength;
      isValid = false;
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = localizedText.confirmPasswordRequired;
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = localizedText.passwordMismatch;
      isValid = false;
    }
    
    if (!agreeTerms) {
      setAgreeTermsError(localizedText.termsRequired);
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
        
        // 회원가입 성공 시 도장 표시
        setShowStamp(true);
        
        // 도장 애니메이션 후 슬라이드 애니메이션 시작
        setTimeout(() => {
          setIsSliding(true);
          
          // 슬라이드 애니메이션 완료 후 로그인 페이지로 이동
          setTimeout(() => {
            navigate('/login');
          }, 500);
        }, 1000);
        
        // 회원가입 성공 시 로그인 처리
        login(response.data);
        
      } catch (error: any) {
        console.error('회원가입 오류:', error);
        setSnackbar({
          open: true,
          message: localizedText.registerError,
          severity: 'error'
        });
        setIsLoading(false);
      }
    } else {
      // 폼 유효성 검사 실패 시 에러 메시지 표시
      Object.keys(errors).forEach(field => {
        if (errors[field]) {
          setSnackbar({
            open: true,
            message: localizedText.formError,
            severity: 'error'
          });
        }
      });
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '/').replace(/ /g, '');
  };

  return (
    <>
      <BackgroundDecorations />
      
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

      {/* 회원가입 페이지 내용 - 애니메이션 중일 때는 숨김 */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
          position: 'relative',
          overflow: 'hidden', // 슬라이드 애니메이션이 컨테이너를 벗어나지 않도록
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: `${fadeIn} 0.8s ease-out`,
            }}
          >
            {/* 공식 헤더 */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#1a202c',
                  fontWeight: 800,
                  mb: 1,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {localizedText.title}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#2d3748',
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                {localizedText.subtitle}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#4a5568',
                  fontSize: '0.8rem',
                  letterSpacing: '0.05em',
                }}
              >
                {localizedText.description}
              </Typography>
            </Box>

            <ArrivalFormContainer elevation={3} className={isSliding ? 'sliding-down' : ''}>
              {/* 도장 애니메이션 */}
              {showStamp && (
                <StampContainer>
                  <Check />
                </StampContainer>
              )}

              {/* 공식 문서 헤더 */}
              <Box sx={{ mb: 4, mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FlightLand sx={{ fontSize: 24, color: '#2b6cb0', mr: 1 }} />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 800,
                        color: '#1a202c',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {`${localizedText.formNumber} TL-REG`}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: '#4a5568', fontWeight: 600 }}>
                      DATE: {getCurrentDate()}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#2d3748',
                    fontWeight: 600,
                    mb: 1,
                    textAlign: 'center',
                  }}
                >
                  TravelLight 회원 가입 신청서
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#4a5568',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                  }}
                >
                  TRAVELLIGHT MEMBERSHIP APPLICATION FORM
                </Typography>
              </Box>

              {/* 서비스 정보 */}
              <Box sx={{ mb: 4, p: 2, backgroundColor: '#f8f9fa', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Business sx={{ color: '#2b6cb0', mb: 1, fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: '#4a5568', fontWeight: 700, display: 'block' }}>SERVICE</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: '#1a202c' }}>{localizedText.service}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Today sx={{ color: '#2b6cb0', mb: 1, fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: '#4a5568', fontWeight: 700, display: 'block' }}>AVAILABLE</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: '#1a202c' }}>24시간</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Assignment sx={{ color: '#2b6cb0', mb: 1, fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: '#4a5568', fontWeight: 700, display: 'block' }}>SECURITY</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: '#1a202c' }}>안전보장</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3, borderColor: '#2d3748', borderWidth: 1 }} />

              {/* 신청인 정보 */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#1a202c',
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '2px solid #2d3748',
                    paddingBottom: '4px',
                  }}
                >
                  회원 정보 (MEMBER INFORMATION)
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ mb: 0.5 }}>
                      <Typography 
                        variant="body2" 
          sx={{ 
                          color: '#2d3748', 
                          fontWeight: 700, 
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          mb: 1
          }}
        >
                        성명 (FULL NAME) *
          </Typography>
                      <ErrorTextField
              required
              fullWidth
                        variant="outlined"
              id="name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={isLoading}
                        placeholder={localizedText.namePlaceholder}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonOutline sx={{ color: errors.name ? '#e53e3e' : '#2d3748', fontSize: '1rem' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ mb: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#2d3748', 
                          fontWeight: 700, 
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          mb: 1
                        }}
                      >
                        이메일 주소 (EMAIL ADDRESS) *
                      </Typography>
                      <ErrorTextField
              required
              fullWidth
                        variant="outlined"
              id="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isLoading}
                        placeholder={localizedText.emailPlaceholder}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailOutlined sx={{ color: errors.email ? '#e53e3e' : '#2d3748', fontSize: '1rem' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#2d3748', 
                          fontWeight: 700, 
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          mb: 1
                        }}
                      >
                        비밀번호 (PASSWORD) *
                      </Typography>
                      <ErrorTextField
              required
              fullWidth
                        variant="outlined"
              name="password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={isLoading}
                        placeholder={localizedText.passwordPlaceholder}
              InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlined sx={{ color: errors.password ? '#e53e3e' : '#2d3748', fontSize: '1rem' }} />
                            </InputAdornment>
                          ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      disabled={isLoading}
                                sx={{ color: '#4a5568' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#2d3748', 
                          fontWeight: 700, 
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          mb: 1
                        }}
                      >
                        비밀번호 확인 (CONFIRM PASSWORD) *
                      </Typography>
                      <ErrorTextField
              required
              fullWidth
                        variant="outlined"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={isLoading}
                        placeholder={localizedText.confirmPasswordPlaceholder}
              InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlined sx={{ color: errors.confirmPassword ? '#e53e3e' : '#2d3748', fontSize: '1rem' }} />
                            </InputAdornment>
                          ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                                aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                      disabled={isLoading}
                                sx={{ color: '#4a5568' }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
                    </Box>
                  </Grid>
                </Grid>

                {/* 약관 동의 */}
                <Box sx={{ mt: 3, mb: 4, p: 2, backgroundColor: '#f8f9fa', border: '1px solid #2d3748', borderRadius: '4px' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#1a202c', 
                      mb: 2,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    AGREEMENT / 동의서
                  </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeTerms}
                  onChange={handleAgreeTerms}
                        sx={{
                          color: '#2d3748',
                          '&.Mui-checked': {
                            color: '#2b6cb0',
                          },
                        }}
                  disabled={isLoading}
                />
              }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a202c', fontSize: '0.85rem' }}>
                        {localizedText.termsText}
                      </Typography>
                    }
            />
            {agreeTermsError && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, ml: 4 }}>
                {agreeTermsError}
              </Typography>
            )}
                </Box>

                <SubmitFormButton
              type="submit"
              fullWidth
              variant="contained"
                  disableElevation
                  sx={{ mb: 3 }}
              disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Assignment />}
            >
                  {isLoading ? localizedText.submitting : localizedText.submitButton}
                </SubmitFormButton>

                <Divider sx={{ my: 3, borderColor: '#e2e8f0' }} />
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#4a5568', mb: 2, fontSize: '0.85rem' }}>
                    {localizedText.alreadyMember}
                  </Typography>
                  <Link 
                    component={RouterLink} 
                    to="/login" 
                    variant="body2"
                    sx={{
                      color: '#2b6cb0',
                      textDecoration: 'none',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    {localizedText.loginLink}
                </Link>
                </Box>
              </Box>

              {/* 문서 하단 정보 */}
              <Box sx={{ mt: 4, pt: 3, borderTop: '2px solid #2d3748' }}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="caption" sx={{ color: '#4a5568', fontWeight: 700 }}>LOCATION</Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#1a202c', fontSize: '0.8rem' }}>
                      {localizedText.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" sx={{ color: '#4a5568', fontWeight: 700 }}>VERSION</Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#1a202c', fontSize: '0.8rem' }}>
                      {localizedText.version}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" sx={{ color: '#4a5568', fontWeight: 700 }}>STATUS</Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#1a202c', fontSize: '0.8rem' }}>
                      {localizedText.status}
                    </Typography>
              </Grid>
            </Grid>
              </Box>
            </ArrivalFormContainer>
          </Box>
        </Container>
      </Box>
      
      {/* Snackbar와 PageTransition은 항상 표시 */}
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
    </>
  );
};

export default Register; 