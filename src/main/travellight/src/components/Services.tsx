import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LuggageIcon from '@mui/icons-material/Luggage';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const serviceData = [
  {
    id: 'manned-storage',
    title: '유인보관 서비스',
    icon: <StorefrontIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    description: '전문 직원이 상주하는 보관소에서 여러분의 짐을 안전하게 보관해 드립니다.',
    features: [
      '전문 직원의 안전한 짐 보관',
      '24시간 보안 시스템 운영',
      '다양한 크기의 짐 보관 가능',
      '장기 보관 할인 혜택',
      '보관 중 짐 확인 서비스'
    ],
    color: 'primary.main',
    bgColor: 'primary.light',
    buttonText: '유인보관 이용하기'
  },
  {
    id: 'unmanned-storage',
    title: '무인보관 서비스',
    icon: <LuggageIcon sx={{ fontSize: 60, color: 'secondary.main' }} />,
    description: '24시간 언제든지 이용 가능한 무인 보관함으로 편리하게 짐을 보관하세요.',
    features: [
      '24시간 연중무휴 이용 가능',
      '앱으로 간편한 예약 및 결제',
      '다양한 크기의 보관함 제공',
      '시간 단위 요금제',
      '주요 관광지 및 교통 요지에 위치'
    ],
    color: 'secondary.main',
    bgColor: 'secondary.light',
    buttonText: '무인보관 이용하기'
  },
  {
    id: 'luggage-delivery',
    title: '짐배송 서비스',
    icon: <LocalShippingIcon sx={{ fontSize: 60, color: 'info.main' }} />,
    description: '여행지에서 다음 목적지까지 짐을 안전하게 배송해 드립니다.',
    features: [
      '당일 배송 서비스',
      '실시간 배송 추적',
      '안전한 포장 서비스',
      '보험 서비스 제공',
      '국내 전 지역 배송 가능'
    ],
    color: 'info.main',
    bgColor: 'info.light',
    buttonText: '짐배송 이용하기'
  }
];

const Services: React.FC = () => {
  return (
    <Box
      id="services"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography
            component="h2"
            variant="h3"
            color="text.primary"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            우리의 서비스
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: 'auto' }}
          >
            TravelLight는 여행자들의 다양한 니즈에 맞춘 세 가지 핵심 서비스를 제공합니다.
            여행의 자유를 위한 최적의 솔루션을 경험해보세요.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {serviceData.map((service, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 4,
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 8,
                  },
                  overflow: 'visible'
                }}
              >
                <Box 
                  sx={{ 
                    bgcolor: service.bgColor, 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    position: 'relative'
                  }}
                >
                  <Box 
                    sx={{ 
                      bgcolor: 'white', 
                      borderRadius: '50%', 
                      p: 2, 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      boxShadow: 2,
                      mb: 2
                    }}
                  >
                    {service.icon}
                  </Box>
                  <Typography variant="h5" component="h3" align="center" gutterBottom sx={{ fontWeight: 'bold', color: service.color }}>
                    {service.title}
                  </Typography>
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="body1" paragraph>
                    {service.description}
                  </Typography>
                  <List>
                    {service.features.map((feature, idx) => (
                      <ListItem key={idx} disableGutters sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleOutlineIcon sx={{ color: service.color }} />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <Box sx={{ p: 3, pt: 0 }}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    sx={{ 
                      borderRadius: '28px',
                      py: 1.5,
                      bgcolor: service.color,
                      '&:hover': {
                        bgcolor: service.color,
                        filter: 'brightness(0.9)'
                      }
                    }}
                  >
                    {service.buttonText}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Services; 