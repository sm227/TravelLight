import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LuggageIcon from '@mui/icons-material/Luggage';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  const serviceLinks = [
    { name: t('attendedStorage2'), href: '#' },
    { name: t('selfStorage2'), href: '#' },
    { name: t('luggageDelivery2'), href: '#' },
    { name: t('priceGuide'), href: '#' },
    { name: t('howToUse'), href: '#' }
  ];
  
  const companyLinks = [
    { name: t('aboutUs'), href: '#' },
    { name: t('notice'), href: '#' },
    { name: t('pressRelease'), href: '#' },
    { name: t('careers'), href: '#' },
    { name: t('partnership2'), href: '#' }
  ];
  
  const supportLinks = [
    { name: t('faq'), href: '#' },
    { name: t('inquiry'), href: '#' },
    { name: t('termsOfService'), href: '#' },
    { name: t('privacyPolicy'), href: '#' },
    { name: t('location'), href: '#' }
  ];
  
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(180deg, #04102B 0%, #071A42 100%)',
        color: 'white',
        py: 8,
        mt: 'auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 배경 장식 */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(46, 125, 241, 0.1) 0%, rgba(46, 125, 241, 0) 70%)',
          borderRadius: '50%',
          opacity: 0.5,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '60%',
          background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0) 100%)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: alpha(theme.palette.primary.main, 0.2),
                  marginRight: 2,
                }}
              >
                <LuggageIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', backgroundImage: 'linear-gradient(90deg, #FFFFFF 0%, #5D9FFF 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                TravelLight
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, color: alpha('#fff', 0.8), lineHeight: 1.7 }}>
              {t('footerDescription')}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
              {[
                { icon: <FacebookIcon />, label: 'Facebook' },
                { icon: <TwitterIcon />, label: 'Twitter' },
                { icon: <InstagramIcon />, label: 'Instagram' },
                { icon: <YouTubeIcon />, label: 'YouTube' },
              ].map((social, index) => (
                <IconButton 
                  key={index}
                  aria-label={social.label} 
                  sx={{ 
                    color: 'white', 
                    backgroundColor: alpha('#fff', 0.1),
                    transition: 'all 0.2s',
                    '&:hover': { 
                      backgroundColor: theme.palette.primary.main,
                      transform: 'translateY(-4px)'
                    } 
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 3, color: '#FFF' }}>
              {t('footerServices')}
            </Typography>
            <Stack spacing={2}>
              {serviceLinks.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  underline="none"
                  color="inherit"
                  sx={{ 
                    color: alpha('#fff', 0.7),
                    transition: 'all 0.2s',
                    display: 'inline-block',
                    '&:hover': { 
                      color: theme.palette.primary.light,
                      transform: 'translateX(4px)'
                    } 
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 3, color: '#FFF' }}>
              {t('aboutCompany')}
            </Typography>
            <Stack spacing={2}>
              {companyLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  underline="none"
                  color="inherit"
                  sx={{ 
                    color: alpha('#fff', 0.7),
                    transition: 'all 0.2s',
                    display: 'inline-block',
                    '&:hover': { 
                      color: theme.palette.primary.light,
                      transform: 'translateX(4px)'
                    } 
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 3, color: '#FFF' }}>
              {t('customerSupport')}
            </Typography>
            <Stack spacing={2}>
              {supportLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  underline="none"
                  color="inherit"
                  sx={{ 
                    color: alpha('#fff', 0.7),
                    transition: 'all 0.2s',
                    display: 'inline-block',
                    '&:hover': { 
                      color: theme.palette.primary.light,
                      transform: 'translateX(4px)'
                    } 
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 3, color: '#FFF' }}>
              {t('customerCenter')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: alpha('#fff', 0.7) }}>
              {t('businessHours')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: alpha('#fff', 0.7) }}>
              {t('closed')}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.primary.light }}>
              1588-0000
            </Typography>
            <Link
              href="mailto:haveagoodtrip.travellight@travellight.com"
              underline="none"
              sx={{ 
                color: alpha('#fff', 0.9),
                transition: 'all 0.2s',
                display: 'inline-block',
                '&:hover': { 
                  color: theme.palette.primary.light
                } 
              }}
            >
              haveagoodtrip.travellight@gmail.com
            </Link>
          </Grid>
        </Grid>
        
        <Divider sx={{ borderColor: alpha('#fff', 0.1), my: 5 }} />
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between', 
          alignItems: 'center',
        }}>
          <Typography variant="body2" sx={{ mb: { xs: 2, md: 0 }, color: alpha('#fff', 0.6) }}>
            © {currentYear} TravelLight. {t('allRights')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <Link href="#" underline="none" sx={{ color: alpha('#fff', 0.6), '&:hover': { color: alpha('#fff', 0.9) } }}>
              {t('termsOfService')}
            </Link>
            <Link href="#" underline="none" sx={{ color: alpha('#fff', 0.6), '&:hover': { color: alpha('#fff', 0.9) } }}>
              {t('privacyPolicy')}
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 