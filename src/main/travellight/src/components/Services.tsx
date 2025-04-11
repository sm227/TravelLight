import React from 'react';
import {Link} from 'react-router-dom';
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
import { useTranslation } from 'react-i18next';

const Services: React.FC = () => {
  const { t } = useTranslation();

  const serviceData = [
    {
      id: 'manned-storage',
      title: t('attendedServiceTitle'),
      icon: <StorefrontIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      description: t('attendedServiceDesc'),
      features: [
        t('feature1'),
        t('feature2'),
        t('feature3'),
        t('feature4'),
        t('feature5')
      ],
      color: 'primary.main',
      bgColor: 'primary.light',
      buttonText: t('useAttendedStorage'),
      path:'/map'
    },
    {
      id: 'unmanned-storage',
      title: t('selfStorageTitle'),
      icon: <LuggageIcon sx={{ fontSize: 60, color: 'secondary.main' }} />,
      description: t('selfStorageDesc'),
      features: [
        t('feature6'),
        t('feature7'),
        t('feature8'),
        t('feature9'),
        t('feature10')
      ],
      color: 'secondary.main',
      bgColor: 'secondary.light',
      buttonText: t('useSelfStorage')
    },
    {
      id: 'luggage-delivery',
      title: t('deliveryServiceTitle'),
      icon: <LocalShippingIcon sx={{ fontSize: 60, color: 'info.main' }} />,
      description: t('deliveryServiceDesc'),
      features: [
        t('feature11'),
        t('feature12'),
        t('feature13'),
        t('feature14'),
        t('feature15')
      ],
      color: 'info.main',
      bgColor: 'info.light',
      buttonText: t('useDeliveryService'),
      path:'/carry'
    }
  ];

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
            {t('ourServices')}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: 'auto' }}
          >
            {t('servicesDescription')}
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
                  {service.path ? (
                    <Button 
                      variant="contained" 
                      fullWidth 
                      size="large"
                      component={Link}
                      to={service.path}
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
                  ) : (
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
                  )}
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