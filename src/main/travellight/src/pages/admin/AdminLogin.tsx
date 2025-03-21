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
  Collapse
} from '@mui/material';
import { Visibility, VisibilityOff, AdminPanelSettings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';

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
    } catch (error: any) {
      console.error('관리자 로그인 오류:', error);
      setError(error.message || '로그인에 실패했습니다.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          my: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 2
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
              <Typography component="h1" variant="h5" fontWeight="bold" gutterBottom>
                관리자 로그인
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" mb={3}>
                관리자 계정으로 로그인하여 시스템을 관리하세요.
              </Typography>
              
              <Collapse in={showError}>
                <Alert 
                  severity="error" 
                  sx={{ width: '100%', mb: 2 }}
                  onClose={() => setShowError(false)}
                >
                  {error}
                </Alert>
              </Collapse>
              
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="관리자 아이디"
                  name="email"
                  autoComplete="username"
                  autoFocus
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="비밀번호"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                  InputProps={{
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
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    '로그인'
                  )}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default AdminLogin; 