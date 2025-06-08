import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  useTheme
} from '@mui/material';
import { Home, ArrowBack, Explore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { alpha, styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import notFoundImage from '../assets/images/404.png';

// 애니메이션 정의
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

// 스타일된 버튼
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 0,
  padding: '10px 20px',
  fontWeight: 600,
  fontSize: '0.95rem',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  margin: theme.spacing(0.5),
  minWidth: '140px',
  [theme.breakpoints.up('md')]: {
    padding: '12px 28px',
    fontSize: '1rem',
    minWidth: '160px',
  },
  [theme.breakpoints.up('lg')]: {
    padding: '14px 32px',
    fontSize: '1.1rem',
    minWidth: '180px',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const NotFound: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleExplore = () => {
    navigate('/map');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 2,
        background: 'linear-gradient(180deg, #FAFBFC 0%, #F0F5FF 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >


      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            animation: `${fadeIn} 0.8s ease-out`,
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 3, sm: 4, md: 5 }, 
              width: '100%',
              maxWidth: { xs: '500px', sm: '600px', md: '800px', lg: '900px' },
              borderRadius: 2,
              backgroundColor: '#fff',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              position: 'relative',
            }}
          >
            {/* 귀여운 404 이미지 */}
            <Box
              sx={{
                mb: 2,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <img
                src={notFoundImage}
                alt="404 Not Found"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: '250px',
                  borderRadius: '12px',
                  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))',
                }}
              />
            </Box>

            {/* 404 숫자 */}
            {/* <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '4rem', sm: '6rem', md: '8rem' },
                fontWeight: 900,
                color: theme.palette.primary.main,
                mb: 2,
                animation: `${bounce} 2s ease-in-out infinite`,
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              404
            </Typography> */}

            {/* 메인 메시지 */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: theme.palette.text.primary,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.2rem', lg: '2.5rem' },
              }}
            >
              페이지를 찾을 수 없습니다
            </Typography>

            {/* 서브 메시지 */}
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                mb: 3,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' },
                lineHeight: 1.5,
                maxWidth: { xs: '400px', md: '500px', lg: '600px' },
                mx: 'auto',
              }}
            >
              여행하다 보면  예상치 못한 곳에 도착하기도 하죠!
              <br />
              트래블라이트와 함께 다시 올바른 길을 찾아보세요
            </Typography>

            {/* 여행 관련 아이콘 */}
            <Box
              sx={{
                mb: 3,
                display: 'flex',
                justifyContent: 'center',
                gap: { xs: 2, md: 3, lg: 4 },
              }}
            >
              <Box
                sx={{
                  fontSize: { xs: '2.5rem', md: '3rem', lg: '3.2rem' },
                  animation: `${float} 2s ease-in-out infinite`,
                }}
              >
                ✈️
              </Box>
              <Box
                sx={{
                  fontSize: { xs: '2.5rem', md: '3rem', lg: '3.2rem' },
                  animation: `${float} 2.5s ease-in-out infinite`,
                }}
              >
                🧳
              </Box>
              <Box
                sx={{
                  fontSize: { xs: '2.5rem', md: '3rem', lg: '3.2rem' },
                  animation: `${float} 3s ease-in-out infinite`,
                }}
              >
                🗺️
              </Box>
            </Box>

            {/* 액션 버튼들 */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center',
                alignItems: 'center',
                gap: { xs: 2, md: 3, lg: 4 },
                flexWrap: 'wrap',
                mb: 1,
              }}
            >
              <StyledButton
                variant="contained"
                color="primary"
                startIcon={<Home />}
                onClick={handleGoHome}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                홈으로 가기
              </StyledButton>

              <StyledButton
                variant="outlined"
                color="primary"
                startIcon={<ArrowBack />}
                onClick={handleGoBack}
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                이전 페이지
              </StyledButton>

              <StyledButton
                variant="outlined"
                color="secondary"
                startIcon={<Explore />}
                onClick={handleExplore}
                sx={{
                  borderColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.main,
                  '&:hover': {
                    borderColor: theme.palette.secondary.dark,
                    backgroundColor: alpha(theme.palette.secondary.main, 0.04),
                  },
                }}
              >
                지도 탐색
              </StyledButton>
            </Box>

            {/* 추가 도움말 */}
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.85rem',
                }}
              >
                문제가 지속되면{' '}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate('/inquiry')}
                  sx={{
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    color: theme.palette.primary.main,
                    fontSize: '0.85rem',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  고객센터
                </Button>
                로 문의해주세요.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFound; 