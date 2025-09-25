import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  Collapse,
  IconButton,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: reset
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const baseURL = 'http://localhost:8080';

  const clearMessages = () => {
    setMessage('');
    setError('');
  };

  const sendCode = async () => {
    if (!email) {
      setError('이메일을 입력해주세요');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('유효한 이메일 주소를 입력해주세요');
      return;
    }

    clearMessages();
    setLoading(true);

    try {
      await axios.post('/api/auth/password-reset/send-code', 
        { email }, 
        { baseURL }
      );
      setMessage('인증코드를 이메일로 발송했습니다.');
      setStep(2);
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || '코드 발송 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code) {
      setError('인증코드를 입력해주세요');
      return;
    }

    clearMessages();
    setLoading(true);

    try {
      await axios.post('/api/auth/password-reset/verify-code', 
        { email, code }, 
        { baseURL }
      );
      setMessage('인증이 완료되었습니다. 새 비밀번호를 입력해주세요.');
      setStep(3);
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || '인증코드 검증에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword) {
      setError('새 비밀번호를 입력해주세요');
      return;
    }

    if (newPassword.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    clearMessages();
    setLoading(true);

    try {
      await axios.post('/api/auth/password-reset/confirm', 
        { email, code, newPassword }, 
        { baseURL }
      );
      setMessage('비밀번호가 재설정되었습니다. 이제 로그인해주세요.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || '비밀번호 재설정에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      sendCode();
    } else if (step === 2) {
      verifyCode();
    } else if (step === 3) {
      resetPassword();
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return '비밀번호 찾기';
      case 2: return '인증 코드 확인';
      case 3: return '새 비밀번호 설정';
      default: return '비밀번호 찾기';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return '가입하신 이메일 주소를 입력하시면 인증 코드를 보내드립니다.';
      case 2: return '이메일로 받은 6자리 인증 코드를 입력해주세요.';
      case 3: return '새로운 비밀번호를 설정해주세요.';
      default: return '';
    }
  };

  return (
      <Container maxWidth="sm">
        <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
        >
          <Paper
              elevation={3}
              sx={{
                p: 4,
                width: '100%',
                borderRadius: 2,
              }}
          >
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              {getStepTitle()}
            </Typography>

            {/* 성공/에러 메시지 */}
            {message && (
              <Collapse in={!!message}>
                <Alert
                    severity="success"
                    action={
                      <IconButton
                          aria-label="close"
                          color="inherit"
                          size="small"
                          onClick={() => setMessage('')}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                    sx={{ mb: 2 }}
                >
                  {message}
                </Alert>
              </Collapse>
            )}

            {error && (
              <Collapse in={!!error}>
                <Alert
                    severity="error"
                    action={
                      <IconButton
                          aria-label="close"
                          color="inherit"
                          size="small"
                          onClick={() => setError('')}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                    sx={{ mb: 2 }}
                >
                  {error}
                </Alert>
              </Collapse>
            )}

            <Typography variant="body1" align="center" paragraph>
              {getStepDescription()}
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              {/* 1단계: 이메일 입력 */}
              {step === 1 && (
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="이메일 주소"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />
              )}

              {/* 2단계: 인증 코드 입력 */}
              {step === 2 && (
                <>
                  <TextField
                      margin="normal"
                      fullWidth
                      id="email"
                      label="이메일 주소"
                      value={email}
                      disabled
                      sx={{ mb: 2 }}
                  />
                  <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="code"
                      label="인증 코드"
                      name="code"
                      autoFocus
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={loading}
                      inputProps={{ maxLength: 6 }}
                  />
                </>
              )}

              {/* 3단계: 새 비밀번호 입력 */}
              {step === 3 && (
                <>
                  <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="newPassword"
                      label="새 비밀번호"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      autoFocus
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                      helperText="6자 이상 입력해주세요"
                  />
                  <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="confirmPassword"
                      label="비밀번호 확인"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                  />
                </>
              )}

              <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={loading}
              >
                {loading && <CircularProgress size={20} sx={{ mr: 1 }} />}
                {step === 1 && '인증 코드 보내기'}
                {step === 2 && '코드 확인'}
                {step === 3 && '비밀번호 재설정'}
              </Button>

              {/* 단계별 뒤로가기 및 기타 링크 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                {step > 1 ? (
                  <Button
                      variant="text"
                      onClick={() => setStep(step - 1)}
                      disabled={loading}
                  >
                    이전 단계
                  </Button>
                ) : (
                  <Link component={RouterLink} to="/login" variant="body2">
                    로그인으로 돌아가기
                  </Link>
                )}
                
                {step === 1 && (
                  <Link component={RouterLink} to="/register" variant="body2">
                    새 계정 만들기
                  </Link>
                )}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
  );
};

export default ForgotPassword; 