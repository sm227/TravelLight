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
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  Divider,
  Tooltip
} from '@mui/material';
import { 
  EmailOutlined,
  ReportProblem,
  Send,
  Description,
  Person,
  Support,
  Home as HomeIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import { alpha, styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';
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

const reportFloat = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-4px) rotate(0.3deg);
  }
`;

// 분실신고서 스타일 컨테이너
const LostReportContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  borderRadius: '8px',
  background: '#ffffff',
  border: '3px solid #e53e3e',
  padding: theme.spacing(4),
  boxShadow: '0 10px 30px rgba(229, 62, 62, 0.2)',
  overflow: 'visible',
  animation: `${reportFloat} 5s ease-in-out infinite`,
  
  // 긴급 문서 스타일 헤더
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '12px',
    background: 'repeating-linear-gradient(45deg, #e53e3e, #e53e3e 10px, #ffffff 10px, #ffffff 20px)',
    borderRadius: '8px 8px 0 0',
  },
  
  // 클립 장식
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-5px',
    left: '30px',
    width: '40px',
    height: '20px',
    background: '#f56565',
    borderRadius: '8px 8px 0 0',
    boxShadow: '0 2px 4px rgba(229, 62, 62, 0.3)',
    zIndex: 2,
  },
}));

// 긴급 텍스트필드
const EmergencyTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3.5),
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    backgroundColor: '#fff5f5',
    border: '2px solid #fed7d7',
    fontFamily: '"Inter", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#feb2b2',
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 8px rgba(229, 62, 62, 0.1)',
      '& input': {
        color: '#1a202c !important',
      },
    },
    '&.Mui-focused': {
      borderColor: '#e53e3e',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 3px rgba(229, 62, 62, 0.1)',
      '& input': {
        color: '#1a202c !important',
      },
    },
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputBase-input': {
    padding: '16px 14px',
    fontSize: '0.95rem',
    fontFamily: '"Inter", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif !important',
    color: '#1a202c !important',
    '&::placeholder': {
      fontSize: '0.85rem',
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
    fontSize: '0.75rem',
    fontWeight: 500,
    marginTop: theme.spacing(1),
  },
}));

// 신고 제출 버튼
const ReportSubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '16px 32px',
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
  color: 'white',
  border: '2px solid transparent',
  transition: 'all 0.3s ease',
  fontFamily: 'inherit',
  
  '&:hover': {
    background: 'linear-gradient(135deg, #c53030 0%, #9b2c2c 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(229, 62, 62, 0.4)',
  },
  
  '&:disabled': {
    background: '#a0aec0',
    color: '#718096',
  },
}));

// 배경 장식
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
    top: '20%',
    right: '10%',
    width: '80px',
    height: '80px',
    background: 'linear-gradient(45deg, #fed7d7, #feb2b2)',
    borderRadius: '50%',
    opacity: 0.6,
    animation: `${reportFloat} 6s ease-in-out infinite`,
  },
  
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '25%',
    left: '8%',
    width: '60px',
    height: '60px',
    background: 'linear-gradient(45deg, #fbb6ce, #f687b3)',
    borderRadius: '50%',
    opacity: 0.6,
    animation: `${reportFloat} 5s ease-in-out infinite reverse`,
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
  border: '2px solid #e53e3e',
  boxShadow: '0 2px 10px rgba(229, 62, 62, 0.1)',
  zIndex: 10,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    backgroundColor: '#e53e3e',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(229, 62, 62, 0.2)',
    '& .MuiSvgIcon-root': {
      color: '#ffffff',
    },
  },
  
  '& .MuiSvgIcon-root': {
    fontSize: '24px',
    color: '#e53e3e',
    transition: 'all 0.3s ease',
  },
}));

const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // 언어별 텍스트 반환
  const getLocalizedText = () => ({
    title: i18n.language === 'ko' ? '⚠️ 계정 복구' : '⚠️ ACCOUNT RECOVERY',
    subtitle: i18n.language === 'ko' ? 'TravelLight 계정 복구 신청서' : 'TRAVELLIGHT ACCOUNT RECOVERY FORM',
    description: i18n.language === 'ko' ? '계정 복구 신청 · TravelLight 서비스' : 'ACCOUNT RECOVERY REQUEST · TRAVELLIGHT SERVICE',
    formTitle: i18n.language === 'ko' ? '복구 신청서' : 'RECOVERY FORM',
    emergencyTitle: i18n.language === 'ko' ? '긴급 계정 복구 신청' : 'EMERGENCY ACCOUNT RECOVERY REQUEST',
    process: i18n.language === 'ko' ? '이메일 발송' : 'EMAIL SENT',
    verification: i18n.language === 'ko' ? '회원 확인' : 'VERIFICATION',
    time: i18n.language === 'ko' ? '즉시 처리' : 'INSTANT',
    memberInfo: i18n.language === 'ko' ? '회원 정보' : 'MEMBER INFORMATION',
    email: i18n.language === 'ko' ? '등록된 이메일 주소' : 'REGISTERED EMAIL',
    emailPlaceholder: i18n.language === 'ko' ? 'TravelLight 가입 시 사용한 이메일 주소를 정확히 입력해주세요' : 'Please enter the email address used for TravelLight registration',
    recoveryGuide: i18n.language === 'ko' ? '📋 복구 신청 안내' : '📋 RECOVERY GUIDE',
    guideEmail: i18n.language === 'ko' ? '• 입력하신 이메일로 계정 복구 안내가 발송됩니다' : '• Recovery instructions will be sent to your email',
    guideLink: i18n.language === 'ko' ? '• 이메일 내 링크를 통해 새로운 비밀번호를 설정할 수 있습니다' : '• You can set a new password through the link in the email',
    guideTime: i18n.language === 'ko' ? '• 처리 시간: 즉시 발송 (이메일 확인 필요)' : '• Processing time: Instant (Email verification required)',
    submitButton: i18n.language === 'ko' ? '계정 복구 신청' : 'SUBMIT RECOVERY',
    submitting: i18n.language === 'ko' ? '복구 신청 처리 중...' : 'Processing...',
    loginLink: i18n.language === 'ko' ? '🧳 보관함 바로 이용하기' : '🧳 Access Storage',
    registerLink: i18n.language === 'ko' ? '📝 TravelLight 새로 가입하기' : '📝 Sign Up for TravelLight',
    // 성공 메시지
    successTitle: i18n.language === 'ko' ? '복구 신청 완료' : 'Recovery Request Complete',
    successMessage: i18n.language === 'ko' ? 'TravelLight 계정 복구 신청이 정상적으로 접수되었습니다.' : 'Your TravelLight account recovery request has been successfully submitted.',
    successEmail: i18n.language === 'ko' ? '계정 복구 안내 메일이 발송되었습니다.' : 'Recovery instructions have been sent to your email.',
    successInstruction: i18n.language === 'ko' ? '이메일을 확인하여 새로운 비밀번호를 설정하세요.' : 'Please check your email to set a new password.',
    goToLogin: i18n.language === 'ko' ? '로그인 페이지로 이동' : 'Go to Login Page',
    // 에러 메시지
    emailRequired: i18n.language === 'ko' ? '이메일을 입력해주세요' : 'Please enter your email',
    emailInvalid: i18n.language === 'ko' ? '유효한 이메일 주소를 입력해주세요' : 'Please enter a valid email address',
    recoveryError: i18n.language === 'ko' ? '계정 복구 신청 처리 중 오류가 발생했습니다.' : 'An error occurred while processing your recovery request.',
    recoverySuccess: i18n.language === 'ko' ? 'TravelLight 계정 복구 신청이 접수되었습니다! 이메일을 확인해주세요 📧' : 'TravelLight account recovery request submitted! Please check your email 📧',
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;

    if (!email) {
      setEmailError(localizedText.emailRequired);
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(localizedText.emailInvalid);
      isValid = false;
    }

    if (isValid) {
      setIsLoading(true);
      try {
        // 실제 API 호출 (구현 필요)
        // await userService.resetPassword({ email });
        
      setIsSubmitted(true);
        setSnackbar({
          open: true,
          message: localizedText.recoverySuccess,
          severity: 'success'
        });
        
      } catch (error: any) {
        console.error('비밀번호 재설정 오류:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || localizedText.recoveryError,
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '/').replace(/ /g, '');
  };

  if (isSubmitted) {
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

        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 50%, #fff5f5 100%)',
            position: 'relative',
          }}
        >
          <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                animation: `${fadeIn} 0.8s ease-out`,
                textAlign: 'center',
              }}
            >
              <Paper
                sx={{
                  p: 6,
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: '2px solid #68d391',
                  boxShadow: '0 10px 30px rgba(104, 211, 145, 0.2)',
                }}
              >
                <Support sx={{ fontSize: 60, color: '#38a169', mb: 3 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a202c', mb: 2 }}>
                  {localizedText.successTitle}
                </Typography>
                <Typography variant="body1" sx={{ color: '#4a5568', mb: 3 }}>
                  {localizedText.successMessage}
                </Typography>
                <Typography variant="body2" sx={{ color: '#718096', mb: 4 }}>
                  {localizedText.successEmail}<br />
                  <strong>{email}</strong><br />
                  {localizedText.successInstruction}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{
                    backgroundColor: '#38a169',
                    '&:hover': { backgroundColor: '#2f855a' },
                    borderRadius: '8px',
                    px: 4,
                    py: 1.5,
                  }}
                >
                  {localizedText.goToLogin}
                </Button>
              </Paper>
            </Box>
          </Container>
        </Box>
      </>
    );
  }

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

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 50%, #fff5f5 100%)',
          position: 'relative',
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: `${fadeIn} 0.8s ease-out`,
            }}
          >
            {/* 긴급 헤더 */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#e53e3e',
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
                  color: '#1a202c',
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                {localizedText.subtitle}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#4a5568',
                  fontSize: '0.85rem',
                  letterSpacing: '0.05em',
                }}
              >
                {localizedText.description}
              </Typography>
            </Box>

            <LostReportContainer elevation={6}>
              {/* 긴급 문서 헤더 */}
              <Box sx={{ mb: 4, mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ReportProblem sx={{ fontSize: 28, color: '#e53e3e', mr: 1 }} />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 800,
                        color: '#e53e3e',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {localizedText.formTitle}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: '#4a5568', fontWeight: 700 }}>
                      DATE: {getCurrentDate()}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 3, backgroundColor: '#fff5f5', border: '2px solid #fed7d7', borderRadius: '8px', mb: 3 }}>
                  <Typography 
                    variant="body1" 
          sx={{ 
                      color: '#e53e3e',
                      fontWeight: 700,
                      textAlign: 'center',
                      mb: 1,
                    }}
                  >
                    {localizedText.emergencyTitle}
                  </Typography>
                </Box>
              </Box>

              {/* 안내 정보 */}
              <Box sx={{ mb: 4, p: 3, backgroundColor: '#fffaf0', border: '1px solid #fbd38d', borderRadius: '6px' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Description sx={{ color: '#dd6b20', mb: 1, fontSize: 24 }} />
                      <Typography variant="caption" sx={{ color: '#744210', fontWeight: 700, display: 'block' }}>PROCESS</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: '#1a202c' }}>
                        {localizedText.process}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Person sx={{ color: '#dd6b20', mb: 1, fontSize: 24 }} />
                      <Typography variant="caption" sx={{ color: '#744210', fontWeight: 700, display: 'block' }}>VERIFICATION</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: '#1a202c' }}>
                        {localizedText.verification}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Support sx={{ color: '#dd6b20', mb: 1, fontSize: 24 }} />
                      <Typography variant="caption" sx={{ color: '#744210', fontWeight: 700, display: 'block' }}>TIME</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: '#1a202c' }}>
                        {localizedText.time}
          </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3, borderColor: '#e53e3e', borderWidth: 2 }} />

              {/* 회원 정보 */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#e53e3e',
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '2px solid #e53e3e',
                    paddingBottom: '4px',
                  }}
                >
                  {`${localizedText.memberInfo} (MEMBER INFORMATION)`}
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Box sx={{ mb: 0.5 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#744210', 
                      fontWeight: 700, 
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      mb: 1
                    }}
                  >
                    {`${localizedText.email} *`}
          </Typography>
                  <EmergencyTextField
              required
              fullWidth
                    variant="outlined"
              id="email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleEmailChange}
              error={!!emailError}
                    helperText={emailError || localizedText.emailPlaceholder}
                    disabled={isLoading}
                    placeholder="example@email.com"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlined sx={{ color: '#e53e3e', fontSize: '1.2rem' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ mb: 4, p: 3, backgroundColor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '6px' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#e53e3e', 
                      mb: 2,
                      textAlign: 'center',
                    }}
                  >
                    {localizedText.recoveryGuide}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#744210', mb: 1, fontSize: '0.85rem' }}>
                    {localizedText.guideEmail}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#744210', mb: 1, fontSize: '0.85rem' }}>
                    {localizedText.guideLink}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#744210', fontSize: '0.85rem' }}>
                    {localizedText.guideTime}
                  </Typography>
                </Box>

                <ReportSubmitButton
              type="submit"
              fullWidth
              variant="contained"
                  disableElevation
                  sx={{ mb: 3 }}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <Send />}
            >
                  {isLoading ? localizedText.submitting : localizedText.submitButton}
                </ReportSubmitButton>

                <Divider sx={{ my: 3, borderColor: '#fed7d7' }} />
                
                <Grid container spacing={2} justifyContent="center" alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Link 
                      component={RouterLink} 
                      to="/login" 
                      variant="body2"
                      sx={{
                        color: '#4a5568',
                        textDecoration: 'none',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        '&:hover': {
                          textDecoration: 'underline',
                          color: '#2d3748',
                        }
                      }}
                    >
                      {localizedText.loginLink}
              </Link>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Link 
                      component={RouterLink} 
                      to="/register" 
                      variant="body2"
                      sx={{
                        color: '#2b6cb0',
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
                      {localizedText.registerLink}
              </Link>
                  </Grid>
                </Grid>
              </Box>

              {/* 문서 하단 정보 */}
              <Box sx={{ mt: 4, pt: 3, borderTop: '2px solid #e53e3e' }}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Typography variant="caption" sx={{ color: '#4a5568', fontWeight: 700 }}>LOCATION</Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#e53e3e', fontSize: '0.8rem' }}>KOREA</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" sx={{ color: '#4a5568', fontWeight: 700 }}>VERSION</Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#e53e3e', fontSize: '0.8rem' }}>2025.6</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" sx={{ color: '#4a5568', fontWeight: 700 }}>PRIORITY</Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#e53e3e', fontSize: '0.8rem' }}>HIGH</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" sx={{ color: '#4a5568', fontWeight: 700 }}>STATUS</Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#e53e3e', fontSize: '0.8rem' }}>ACTIVE</Typography>
                  </Grid>
                </Grid>
            </Box>
            </LostReportContainer>
          </Box>
        </Container>
        
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
              borderRadius: '8px',
              border: '1px solid',
              borderColor: snackbar.severity === 'success' ? '#38a169' : '#e53e3e',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default ForgotPassword; 