import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import LuggageIcon from '@mui/icons-material/Luggage';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StorefrontIcon from '@mui/icons-material/Storefront';

const Hero: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      id="home"
      sx={{
        bgcolor: 'background.paper',
        pt: { xs: 12, md: 16 },
        pb: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 배경 장식 */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          backgroundColor: 'primary.light',
          opacity: 0.1,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          backgroundColor: 'secondary.light',
          opacity: 0.1,
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              component="h1"
              variant={isMobile ? 'h3' : 'h2'}
              color="text.primary"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              여행은 가볍게,<br />
              <Box component="span" sx={{ color: 'primary.main', display: 'block', whiteSpace: 'nowrap' }}>
                짐은 TravelLight에게
              </Box>
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              paragraph
              sx={{ mb: 4 }}
            >
              여행 중 무거운 짐 때문에 불편하셨나요? TravelLight가 여러분의 짐을 안전하게 보관하고 배송해 드립니다.
              유인보관, 무인보관, 짐배송 서비스로 여행의 자유를 느껴보세요.
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                color="primary"
                component={Link}
                to="/map"
                sx={{ 
                  borderRadius: '28px',
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                서비스 이용하기
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  borderRadius: '28px',
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                더 알아보기
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Grid container spacing={2}>
                {[
                  { 
                    icon: <StorefrontIcon sx={{ fontSize: 40, color: 'primary.main' }} />, 
                    title: '유인보관', 
                    description: '전문 직원이 여러분의 짐을 안전하게 보관합니다.' 
                  },
                  { 
                    icon: <LuggageIcon sx={{ fontSize: 40, color: 'secondary.main' }} />, 
                    title: '무인보관', 
                    description: '24시간 언제든지 이용 가능한 무인 보관함 서비스입니다.' 
                  },
                  { 
                    icon: <LocalShippingIcon sx={{ fontSize: 40, color: 'info.main' }} />, 
                    title: '짐배송', 
                    description: '원하는 장소로 짐을 안전하게 배송해 드립니다.' 
                  },
                ].map((service, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 6,
                        },
                      }}
                    >
                      {service.icon}
                      <Typography variant="h6" component="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
                        {service.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {service.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero; 