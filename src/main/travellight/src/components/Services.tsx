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
  width: 48,
  height: 48,
  borderRadius: '12px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  marginBottom: 0,
  marginRight: theme.spacing(2),
  position: 'relative',
  transition: 'all 0.3s ease',
  flexShrink: 0,
  '&:hover': {
    transform: 'scale(1.05)',
    borderColor: '#CBD5E1'
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
        py: { xs: 8, md: 12 },
        background: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 미니멀한 배경 장식 */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, rgba(59, 130, 246, 0) 70%)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* 헤더 섹션 */}
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 6, md: 8 },
            animation: `${fadeIn} 0.8s ease-out`,
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#0F172A',
              mb: 2,
              letterSpacing: '-0.01em'
            }}
          >
            {t('ourServices')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#64748B',
              maxWidth: '600px',
              mx: 'auto',
              fontSize: '1.1rem',
              fontWeight: 400,
              lineHeight: 1.6
            }}
          >
            {t('servicesDescription')}
          </Typography>
        </Box>

        {/* 서비스 카드들 */}
        <Grid container spacing={3}>
          {serviceData.map((service, index) => (
            <Grid item xs={12} md={4} key={service.id}>
              <StyledCard
                sx={{
                  p: 3,
                  height: '100%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #F1F5F9',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                    borderColor: '#E2E8F0'
                  },
                  animation: `${fadeIn} 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* 헤더 섹션 */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <IconWrapper color={service.color}>
                    <Box sx={{ 
                      fontSize: 24, 
                      color: '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {service.icon}
                    </Box>
                  </IconWrapper>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        color: '#1E293B',
                        fontSize: '1.1rem',
                        lineHeight: 1.3
                      }}
                    >
                      {service.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748B',
                        fontSize: '0.9rem',
                        lineHeight: 1.5
                      }}
                    >
                      {service.description}
                    </Typography>
                  </Box>
                </Box>

                {/* 기능 목록 */}
                <Box sx={{ mb: 3 }}>
                  {service.features.slice(0, 3).map((feature, featureIndex) => (
                    <Box
                      key={featureIndex}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                        gap: 1.5
                      }}
                    >
                      <Box
                        sx={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#94A3B8',
                          flexShrink: 0
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#475569',
                          fontSize: '0.85rem',
                          lineHeight: 1.4
                        }}
                      >
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* 버튼 */}
                <Button
                  variant="outlined"
                  fullWidth
                  component={service.path ? Link : 'button'}
                  to={service.path}
                  sx={{
                    mt: 'auto',
                    py: 1,
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    color: '#475569',
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    '&:hover': {
                      backgroundColor: '#F8FAFC',
                      borderColor: '#CBD5E1',
                      color: '#374151'
                    }
                  }}
                >
                  {service.buttonText}
                </Button>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Services; 