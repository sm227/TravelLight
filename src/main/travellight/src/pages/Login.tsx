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
  useTheme
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined, EmailOutlined } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { alpha, styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';

// 애니메이션 정의
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 스타일된 텍스트필드
const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    backgroundColor: alpha(theme.palette.common.white, 0.9),
    transition: 'all 0.2s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: 1,
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    transition: 'all 0.2s ease',
  },
  '& .MuiInputLabel-outlined.Mui-focused': {
    color: theme.palette.primary.main,
  },
  '& .MuiInputBase-input': {
    padding: '14px 12px',
  },
}));

// 스타일된 버튼
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 0,
  padding: '12px 0',
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  transition: 'all 0.2s ease',
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
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
        
        setSnackbar({
          open: true,
          message: '로그인이 완료되었습니다.',
          severity: 'success'
        });
        
        // 홈 페이지로 이동
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } catch (error: any) {
        console.error('로그인 오류:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || '로그인 중 오류가 발생했습니다.',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        background: 'linear-gradient(180deg, #FAFBFC 0%, #F0F5FF 100%)',
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: `${fadeIn} 0.5s ease-out`,
          }}
        >
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 4, sm: 5 }, 
              width: '100%',
              borderRadius: 0,
              backgroundColor: '#fff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography 
                component="h1" 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  color: theme.palette.primary.main,
                }}
              >
                로그인
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                계정에 로그인하여 여행을 시작하세요
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <StyledTextField
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: theme.palette.primary.main, opacity: 0.7 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <StyledTextField
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: theme.palette.primary.main, opacity: 0.7 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <StyledButton
                type="submit"
                fullWidth
                variant="contained"
                disableElevation
                sx={{ mt: 3, mb: 3 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  '로그인'
                )}
              </StyledButton>
              
              <Grid 
                container 
                justifyContent="space-between" 
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <Grid item>
                  <Link 
                    component={RouterLink} 
                    to="/forgot-password" 
                    variant="body2"
                    sx={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    비밀번호를 잊으셨나요?
                  </Link>
                </Grid>
                <Grid item>
                  <Link 
                    component={RouterLink} 
                    to="/register" 
                    variant="body2"
                    sx={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    계정이 없으신가요? 회원가입
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Paper>
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
            borderRadius: 0,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login; 