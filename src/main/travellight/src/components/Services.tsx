import React from 'react';
import {Link} from 'react-router-dom';
import {
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  Button,
  useTheme,
  Tab,
  Tabs,
  Theme,
  Paper
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LuggageIcon from '@mui/icons-material/Luggage';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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

interface IconWrapperProps {
  color?: 'primary' | 'secondary' | 'info';
}

// 스타일 컴포넌트
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: 20,
  overflow: 'visible',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  },
}));

const IconWrapper = styled(Box)<IconWrapperProps>(({ theme, color = 'primary' }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: alpha(theme.palette[color].main, 0.1),
  marginBottom: theme.spacing(3),
  position: 'relative',
  zIndex: 1,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -5,
    left: -5,
    width: 90,
    height: 90,
    borderRadius: '50%',
    background: alpha(theme.palette[color].main, 0.06),
    zIndex: -1,
  },
}));

// 스타일된 탭
const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  padding: '8px 12px',
  margin: '0 4px',
  minWidth: 100,
  borderRadius: 12,
  transition: 'all 0.3s ease',
  color: theme.palette.text.secondary,
  whiteSpace: 'nowrap',
  '&.Mui-selected': {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
    boxShadow: '0px 4px 10px rgba(46, 125, 241, 0.25)',
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
  },
  '&.Mui-selected:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.875rem',
    padding: '6px 10px',
    minWidth: 'auto',
    margin: '0 2px',
  }
}));

type ServiceColorType = 'primary' | 'secondary' | 'info';

interface ServiceData {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  color: ServiceColorType;
  buttonText: string;
  path?: string;
}

const Services: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const serviceData: ServiceData[] = [
    {
      id: 'manned-storage',
      title: t('attendedServiceTitle'),
      icon: <StorefrontIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
      description: t('attendedServiceDesc'),
      features: [
        t('feature1'),
        t('feature2'),
        t('feature3'),
        t('feature4'),
        t('feature5')
      ],
      color: 'primary',
      buttonText: t('useAttendedStorage'),
      path:'/map'
    },
    {
      id: 'unmanned-storage',
      title: t('selfStorageTitle'),
      icon: <LuggageIcon sx={{ fontSize: 36, color: 'secondary.main' }} />,
      description: t('selfStorageDesc'),
      features: [
        t('feature6'),
        t('feature7'),
        t('feature8'),
        t('feature9'),
        t('feature10')
      ],
      color: 'secondary',
      buttonText: t('useSelfStorage')
    },
    {
      id: 'luggage-delivery',
      title: t('deliveryServiceTitle'),
      icon: <LocalShippingIcon sx={{ fontSize: 36, color: 'info.main' }} />,
      description: t('deliveryServiceDesc'),
      features: [
        t('feature11'),
        t('feature12'),
        t('feature13'),
        t('feature14'),
        t('feature15')
      ],
      color: 'info',
      buttonText: t('useDeliveryService'),
      path:'/carry'
    }
  ];

  return (
    <Box
      id="services"
      sx={{
        py: { xs: 10, md: 16 },
        background: 'linear-gradient(180deg, #FAFBFC 0%, #F0F5FF 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 배경 장식 */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          width: '30%',
          height: '30%',
          background: 'radial-gradient(circle, rgba(93, 159, 255, 0.1) 0%, rgba(93, 159, 255, 0) 70%)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(255, 90, 90, 0.08) 0%, rgba(255, 90, 90, 0) 70%)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box 
          sx={{ 
            mb: { xs: 6, md: 10 }, 
            textAlign: 'center',
            maxWidth: 800,
            mx: 'auto',
            animation: `${fadeIn} 0.6s ease-out`,
          }}
        >
          {/* <Typography
            variant="h6"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
              mb: 2,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {t('ourServicesSubtitle')}
          </Typography> */}
          <Typography
            component="h2"
            variant="h3"
            sx={{ 
              fontWeight: 700,
              mb: 3,
              background: 'linear-gradient(90deg, #1A2138 0%, #2E7DF1 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('ourServices')}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 650, mx: 'auto' }}
          >
            {t('servicesDescription')}
          </Typography>
        </Box>

        {/* 서비스 탭 네비게이션 */}
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 6, 
            display: 'flex',
            width: '100%',
            maxWidth: { xs: '95%', sm: '90%', md: '80%' },
            mx: 'auto',
            p: { xs: 0.5, sm: 1 },
            borderRadius: { xs: 1.5, sm: 2 },
            backgroundColor: alpha(theme.palette.primary.light, 0.08),
            overflow: 'hidden'
          }}
        >
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            TabIndicatorProps={{
              style: {
                display: 'none',
              }
            }}
            sx={{
              minHeight: { xs: '40px', sm: '48px' },
              width: '100%',
              '& .MuiTabs-flexContainer': {
                gap: { xs: 0.5, sm: 1 },
                justifyContent: { xs: 'flex-start', md: 'center' },
                width: '100%',
              },
              '& .MuiTabs-scroller': {
                width: '100%'
              },
              '& .MuiTabs-scrollButtons': {
                color: theme.palette.primary.main,
                '&.Mui-disabled': {
                  opacity: 0.3,
                }
              }
            }}
          >
            {serviceData.map((service, index) => (
              <StyledTab
                key={service.id}
                label={service.title}
                id={`service-tab-${index}`}
                aria-controls={`service-tabpanel-${index}`}
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                  flex: { xs: '0 0 auto', md: '1 1 auto' },
                  minWidth: { xs: 'auto', sm: '100px', md: '120px' },
                  px: { xs: 1.5, sm: 2, md: 3 }
                }}
              />
            ))}
          </Tabs>
        </Paper>

        {/* 서비스 콘텐츠 */}
        {serviceData.map((service, index) => (
          <Box
            key={service.id}
            role="tabpanel"
            hidden={activeTab !== index}
            id={`service-tabpanel-${index}`}
            aria-labelledby={`service-tab-${index}`}
            sx={{ 
              animation: activeTab === index ? `${fadeIn} 0.6s ease-out` : 'none',
              mt: 4,
            }}
          >
            {activeTab === index && (
              <Grid container justifyContent="center">
                <Grid item xs={12} md={10} lg={8}>
                  <Card
                    elevation={3}
                    sx={{
                      p: 4,
                      borderRadius: 1,
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12)',
                      }
                    }}
                  >
                    {/* 색상 액센트 */}
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '8px', 
                        bgcolor: theme.palette[service.color].main 
                      }} 
                    />
                    
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'center', sm: 'flex-start' },
                        gap: 3,
                        mb: 3,
                      }}
                    >
                      <IconWrapper color={service.color}>
                        {service.icon}
                      </IconWrapper>
                      <Box>
                        <Typography
                          variant="h4"
                          component="h3"
                          sx={{ fontWeight: 'bold', mb: 2, textAlign: { xs: 'center', sm: 'left' } }}
                        >
                          {service.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          paragraph
                          sx={{ lineHeight: 1.8, textAlign: { xs: 'center', sm: 'left' } }}
                        >
                          {service.description}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {t('keyFeatures')}
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                      {service.features.map((feature, idx) => (
                        <Grid item xs={12} sm={6} key={idx}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              p: 1,
                              borderRadius: 2,
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette[service.color].main, 0.05),
                              }
                            }}
                          >
                            <CheckCircleOutlineIcon sx={{ color: theme.palette[service.color].main }} />
                            <Typography variant="body1">{feature}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: { xs: 'center', sm: 'flex-end' },
                        mt: 3
                      }}
                    >
                      {service.path ? (
                        <Button 
                          variant="contained" 
                          size="large"
                          component={Link}
                          to={service.path}
                          endIcon={<ArrowForwardIcon />}
                          sx={{ 
                            py: 1.5,
                            px: 4,
                            borderRadius: 3,
                            fontWeight: 'bold',
                            bgcolor: theme.palette[service.color].main,
                            boxShadow: `0 4px 14px ${alpha(theme.palette[service.color].main, 0.4)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: theme.palette[service.color].dark,
                              transform: 'translateY(-3px)',
                              boxShadow: `0 6px 20px ${alpha(theme.palette[service.color].main, 0.6)}`,
                            }
                          }}
                        >
                          {service.buttonText}
                        </Button>
                      ) : (
                        <Button 
                          variant="contained" 
                          size="large"
                          endIcon={<ArrowForwardIcon />}
                          sx={{ 
                            py: 1.5,
                            px: 4,
                            borderRadius: 3,
                            fontWeight: 'bold',
                            bgcolor: theme.palette[service.color].main,
                            boxShadow: `0 4px 14px ${alpha(theme.palette[service.color].main, 0.4)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: theme.palette[service.color].dark,
                              transform: 'translateY(-3px)',
                              boxShadow: `0 6px 20px ${alpha(theme.palette[service.color].main, 0.6)}`,
                            }
                          }}
                        >
                          {service.buttonText}
                        </Button>
                      )}
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        ))}
      </Container>
    </Box>
  );
};

export default Services; 