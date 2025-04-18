import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  useTheme,
  useMediaQuery,
  InputBase,
  Paper,
  IconButton
} from '@mui/material';
import { keyframes } from '@mui/system';
import LuggageIcon from '@mui/icons-material/Luggage';
import ExploreIcon from '@mui/icons-material/Explore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useTranslation } from 'react-i18next';

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

const floatAnimation = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const Hero: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();

  return (
    <Box
      id="home"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #F8FAFF 0%, #E8F0FF 100%)',
        pt: { xs: 16, md: 20 },
        pb: { xs: 12, md: 16 },
      }}
    >
      {/* 장식 요소들 */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(93, 159, 255, 0.2) 0%, rgba(93, 159, 255, 0) 70%)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '5%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255, 90, 90, 0.1) 0%, rgba(255, 90, 90, 0) 70%)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center" justifyContent="center">
          <Grid 
            item 
            xs={12} 
            md={8} 
            sx={{ 
              animation: `${fadeIn} 0.8s ease-out`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
             
              <Typography
                component="h1"
                variant={isMobile ? 'h4' : 'h3'}
                sx={{ 
                  fontWeight: 800,
                  mb: 3,
                  background: 'linear-gradient(90deg, #1A2138 0%, #2E7DF1 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.5,
                }}
              >
                {t('heroTitle1')}{' '}
                <Box component="span" sx={{ color: theme.palette.primary.main }}>
                  {t('heroTitle2')}
                </Box>
              </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ 
                mb: 4,
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.6,
                fontWeight: 'normal',
              }}
            >
              {t('heroDescription')}
            </Typography>
            
            {/* 검색 박스 */}
            <Paper
              component="form"
              elevation={2}
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                maxWidth: '600px',
                mb: 4,
                borderRadius: '50px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}
            >
              <IconButton sx={{ p: '10px', color: 'primary.main' }} aria-label="search">
                <SearchIcon />
              </IconButton>
              <InputBase
                sx={{ ml: 1, flex: 1, py: 1.2 }}
                placeholder="장소 또는 주소 검색"
                inputProps={{ 'aria-label': '장소 또는 주소 검색' }}
              />
              <Button
                variant="contained"
                sx={{
                  borderRadius: '40px',
                  py: 1,
                  px: 3,
                  mx: 1,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  background: 'linear-gradient(90deg, #2E7DF1 0%, #5D9FFF 100%)'
                }}
              >
                검색
              </Button>
            </Paper>
            
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/map"
              startIcon={<ExploreIcon />}
              sx={{ 
                py: 1.5,
                px: 4,
                fontSize: '1rem',
                width: { xs: '100%', sm: 'auto' },
                maxWidth: '600px',
                background: 'linear-gradient(90deg, #2E7DF1 0%, #5D9FFF 100%)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #0051BF 0%, #2E7DF1 100%)',
                }
              }}
            >
              가까운 위치 찾기
            </Button>
            
            {/* 간단한 통계 정보 */}
            <Box
              sx={{
                mt: 4,
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: { xs: 3, md: 5 },
                  width: '100%',
                  maxWidth: '900px',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: { xs: 'auto', sm: '100%' },
                    left: { xs: '50%', sm: 'auto' },
                    width: { xs: '80%', sm: '100%' },
                    height: { xs: '1px', sm: '1px' },
                    background: 'rgba(0,0,0,0.06)',
                    transform: { xs: 'translateX(-50%)', sm: 'none' },
                    display: { xs: 'none', sm: 'block' },
                    zIndex: 0
                  }
                }}
              >
                {[
                  { value: '1.2천+', label: t('stores'), icon: <StorefrontIcon sx={{ fontSize: 28 }} /> },
                  { value: '4.8/5', label: t('rating'), icon: <LuggageIcon sx={{ fontSize: 28 }} /> },
                  { value: '7천+', label: t('users'), icon: <AccessTimeIcon sx={{ fontSize: 28 }} /> },
                ].map((stat, index) => (
                  <Box
                    key={index}
                    sx={{ 
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      position: 'relative',
                      zIndex: 1,
                      background: 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 50,
                        height: 50,
                        borderRadius: '12px',
                        background: 'rgba(46, 125, 241, 0.08)',
                        color: 'primary.main'
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="600" sx={{ lineHeight: 1.2 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero; 