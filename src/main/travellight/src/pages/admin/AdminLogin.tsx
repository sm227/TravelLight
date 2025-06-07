import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Collapse,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, AdminPanelSettings, Security } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';

// 더 차갑고 무거운 ERP 색상 테마
const COLORS = {
  backgroundDark: '#0a0a0b',
  backgroundLight: '#141416',
  backgroundCard: '#1a1a1c',
  backgroundSurface: '#202022',
  textPrimary: '#e5e5e7',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  borderPrimary: '#1f2937',
  borderSecondary: '#374151',
  accentPrimary: '#2563eb',
  accentSecondary: '#1d4ed8',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0891b2',
  backgroundHover: 'rgba(255, 255, 255, 0.03)',
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  // 이미 관리자로 로그인되어 있으면 대시보드로 리다이렉트
  React.useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
    setShowError(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
    setShowError(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 간단한 유효성 검사
    if (!email) {
      setError('아이디를 입력해주세요');
      setShowError(true);
      return;
    }
    
    if (!password) {
      setError('비밀번호를 입력해주세요');
      setShowError(true);
      return;
    }
    
    setIsLoading(true);
    try {
      await adminLogin({ email, password });
      navigate('/admin');
    } catch (error: unknown) {
      console.error('관리자 로그인 오류:', error);
      setError((error as Error).message || '로그인에 실패했습니다.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: COLORS.backgroundDark,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Container component="main" maxWidth="xs">
        {/* 헤더 */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 3,
          p: 2.5,
          bgcolor: COLORS.backgroundCard,
          border: `2px solid ${COLORS.borderSecondary}`,
          borderRadius: 0
        }}>
          <Typography variant="h4" sx={{ 
            color: COLORS.textPrimary,
            fontWeight: 800,
            fontSize: '1.5rem',
            mb: 0.5,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontFamily: 'monospace'
          }}>
            TRAVELLIGHT
          </Typography>
          <Typography variant="h6" sx={{ 
            color: COLORS.textMuted,
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: 'monospace'
          }}>
            ENTERPRISE RESOURCE PLANNING
          </Typography>
        </Box>

        {/* 로그인 폼 */}
        <Paper 
          elevation={0}
          sx={{ 
            bgcolor: COLORS.backgroundCard,
            border: `2px solid ${COLORS.borderSecondary}`,
            borderRadius: 0,
            overflow: 'hidden'
          }}
        >
          {/* 폼 헤더 */}
          <Box sx={{
            bgcolor: COLORS.backgroundLight,
            borderBottom: `2px solid ${COLORS.borderSecondary}`,
            p: 2,
            textAlign: 'center'
          }}>
            <Typography variant="h6" sx={{ 
              color: COLORS.textPrimary,
              fontWeight: 800,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: 'monospace'
            }}>
              SYSTEM ACCESS
            </Typography>
            <Typography variant="body2" sx={{ 
              color: COLORS.danger,
              fontSize: '0.625rem',
              mt: 0.25,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: 'monospace'
            }}>
              RESTRICTED ACCESS
            </Typography>
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Collapse in={showError}>
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%', 
                  mb: 2,
                  bgcolor: alpha(COLORS.danger, 0.1),
                  color: COLORS.danger,
                  border: `2px solid ${COLORS.danger}`,
                  borderRadius: 0,
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  '& .MuiAlert-icon': {
                    color: COLORS.danger
                  }
                }}
                onClose={() => setShowError(false)}
              >
                {error}
              </Alert>
            </Collapse>
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="USER_ID"
                name="email"
                autoComplete="username"
                autoFocus
                value={email}
                onChange={handleEmailChange}
                disabled={isLoading}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: COLORS.backgroundDark,
                    borderRadius: 0,
                    color: COLORS.textPrimary,
                    fontSize: '0.875rem',
                    height: 44,
                    '& fieldset': {
                      borderColor: COLORS.borderSecondary,
                      borderWidth: 2
                    },
                    '&:hover fieldset': {
                      borderColor: COLORS.accentPrimary,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: COLORS.accentPrimary,
                    },
                    '& input': {
                      '&:-webkit-autofill': {
                        WebkitBoxShadow: `0 0 0 1000px ${COLORS.backgroundDark} inset !important`,
                        WebkitTextFillColor: `${COLORS.textPrimary} !important`,
                        transition: 'background-color 5000s ease-in-out 0s'
                      },
                      '&:-webkit-autofill:hover': {
                        WebkitBoxShadow: `0 0 0 1000px ${COLORS.backgroundDark} inset !important`,
                        WebkitTextFillColor: `${COLORS.textPrimary} !important`
                      },
                      '&:-webkit-autofill:focus': {
                        WebkitBoxShadow: `0 0 0 1000px ${COLORS.backgroundDark} inset !important`,
                        WebkitTextFillColor: `${COLORS.textPrimary} !important`
                      }
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: COLORS.textMuted,
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontFamily: 'monospace',
                    '&.Mui-focused': {
                      color: COLORS.accentPrimary,
                    }
                  }
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="PASSWORD"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                disabled={isLoading}
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: COLORS.backgroundDark,
                    borderRadius: 0,
                    color: COLORS.textPrimary,
                    fontSize: '0.875rem',
                    height: 44,
                    '& fieldset': {
                      borderColor: COLORS.borderSecondary,
                      borderWidth: 2
                    },
                    '&:hover fieldset': {
                      borderColor: COLORS.accentPrimary,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: COLORS.accentPrimary,
                    },
                    '& input': {
                      '&:-webkit-autofill': {
                        WebkitBoxShadow: `0 0 0 1000px ${COLORS.backgroundDark} inset !important`,
                        WebkitTextFillColor: `${COLORS.textPrimary} !important`,
                        transition: 'background-color 5000s ease-in-out 0s'
                      },
                      '&:-webkit-autofill:hover': {
                        WebkitBoxShadow: `0 0 0 1000px ${COLORS.backgroundDark} inset !important`,
                        WebkitTextFillColor: `${COLORS.textPrimary} !important`
                      },
                      '&:-webkit-autofill:focus': {
                        WebkitBoxShadow: `0 0 0 1000px ${COLORS.backgroundDark} inset !important`,
                        WebkitTextFillColor: `${COLORS.textPrimary} !important`
                      }
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: COLORS.textMuted,
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontFamily: 'monospace',
                    '&.Mui-focused': {
                      color: COLORS.accentPrimary,
                    }
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        disabled={isLoading}
                        sx={{ 
                          color: COLORS.textMuted,
                          '&:hover': {
                            color: COLORS.textPrimary
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{ 
                  py: 1.75,
                  bgcolor: COLORS.backgroundLight,
                  color: COLORS.textPrimary,
                  borderRadius: 0,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontFamily: 'monospace',
                  border: `2px solid ${COLORS.borderSecondary}`,
                  '&:hover': {
                    bgcolor: COLORS.accentPrimary,
                    borderColor: COLORS.accentPrimary,
                    color: 'white'
                  },
                  '&:disabled': {
                    bgcolor: COLORS.backgroundSurface,
                    color: COLORS.textMuted,
                    borderColor: COLORS.borderPrimary
                  }
                }}
              >
                {isLoading ? (
                  <CircularProgress size={20} sx={{ color: COLORS.textMuted }} />
                ) : (
                  'LOGIN'
                )}
              </Button>
            </Box>
          </CardContent>
        </Paper>

        {/* 푸터 */}
        <Box sx={{ 
          mt: 3,
          p: 2,
          bgcolor: COLORS.backgroundCard,
          border: `2px solid ${COLORS.borderSecondary}`,
          borderRadius: 0,
          textAlign: 'center'
        }}>
          <Typography variant="body2" sx={{ 
            color: COLORS.textMuted, 
            fontSize: '0.625rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: 'monospace',
            fontWeight: 600,
            mb: 0.5
          }}>
            TRAVELLIGHT ERP SYS v2.1.4
          </Typography>
          <Typography variant="body2" sx={{ 
            color: COLORS.danger, 
            fontSize: '0.5625rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: 'monospace',
            fontWeight: 700
          }}>
            UNAUTHORIZED ACCESS WILL BE PROSECUTED
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminLogin; 