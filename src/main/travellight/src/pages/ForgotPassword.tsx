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
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link as RouterLink } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    if (isValid) {
      // 여기서는 백엔드 구현 없이 성공 메시지만 표시
      console.log('비밀번호 재설정 이메일 요청:', email);
      setIsSubmitted(true);
      setAlertOpen(true);
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
            비밀번호 찾기
          </Typography>
          
          <Collapse in={alertOpen}>
            <Alert
              severity="success"
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setAlertOpen(false);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{ mb: 2 }}
            >
              비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.
            </Alert>
          </Collapse>
          
          <Typography variant="body1" align="center" paragraph>
            가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
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
              disabled={isSubmitted}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isSubmitted}
            >
              비밀번호 재설정 링크 받기
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Link component={RouterLink} to="/login" variant="body2">
                로그인으로 돌아가기
              </Link>
              <Link component={RouterLink} to="/register" variant="body2">
                새 계정 만들기
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 