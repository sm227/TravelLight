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
    { name: t('aboutUs'), href: '/about' },
    { name: t('notice'), href: '#' },
    { name: t('pressRelease'), href: '#' },
    { name: '채용', href: '/careers' },
    { name: t('partnership2'), href: '#' }
  ];
  
  const supportLinks = [
    { name: t('faq'), href: '/FAQ' },
    { name: t('inquiry'), href: '/Inquiry' },
    { name: t('termsOfService'), href: '/terms' },
    { name: t('privacyPolicy'), href: '/privacy' },
    { name: '위치약관', href: '/location-terms' }
  ];
  
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(180deg, #04102B 0%, #071A42 100%)',
        color: 'white',
        py: { xs: 6, md: 8 },
        px: { xs: 'var(--safe-area-inset-left)', md: 0 },
        pb: { xs: 'calc(48px + var(--safe-area-inset-bottom))', md: 8 },
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
        <Grid container spacing={{ xs: 4, md: 6 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 3 } }}>
              <Box
                sx={{
                  width: { xs: 40, md: 48 },
                  height: { xs: 40, md: 48 },
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: alpha(theme.palette.primary.main, 0.2),
                  marginRight: 2,
                }}
              >
                <LuggageIcon sx={{ fontSize: { xs: 28, md: 32 }, color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', md: '2.125rem' }, backgroundImage: 'linear-gradient(90deg, #FFFFFF 0%, #5D9FFF 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Travelight
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: '0.875rem', md: '1rem' }, color: alpha('#fff', 0.8), lineHeight: 1.7 }}>
              {t('footerDescription')}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mb: { xs: 3, md: 3 } }}>
              {[
                { icon: <FacebookIcon />, label: 'Facebook' },
                { icon: <TwitterIcon />, label: 'Twitter' },
                { icon: <InstagramIcon />, label: 'Instagram' },
                { icon: <YouTubeIcon />, label: 'YouTube' },
              ].map((social, index) => (
                <IconButton
                  key={index}
                  aria-label={social.label}
                  size={index === 0 ? 'small' : 'small'}
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

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: { xs: 2, md: 3 }, fontSize: { xs: '0.95rem', md: '1rem' }, color: '#FFF' }}>
              {t('footerServices')}
            </Typography>
            <Stack spacing={{ xs: 1.5, md: 2 }}>
              {serviceLinks.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  underline="none"
                  color="inherit"
                  sx={{
                    color: alpha('#fff', 0.7),
                    fontSize: { xs: '0.875rem', md: '1rem' },
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
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: { xs: 2, md: 3 }, fontSize: { xs: '0.95rem', md: '1rem' }, color: '#FFF' }}>
              {t('aboutCompany')}
            </Typography>
            <Stack spacing={{ xs: 1.5, md: 2 }}>
              {companyLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  underline="none"
                  color="inherit"
                  sx={{
                    color: alpha('#fff', 0.7),
                    fontSize: { xs: '0.875rem', md: '1rem' },
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
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: { xs: 2, md: 3 }, fontSize: { xs: '0.95rem', md: '1rem' }, color: '#FFF' }}>
              {t('customerSupport')}
            </Typography>
            <Stack spacing={{ xs: 1.5, md: 2 }}>
              {supportLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  underline="none"
                  color="inherit"
                  sx={{
                    color: alpha('#fff', 0.7),
                    fontSize: { xs: '0.875rem', md: '1rem' },
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
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: { xs: 2, md: 3 }, fontSize: { xs: '0.95rem', md: '1rem' }, color: '#FFF' }}>
              {t('customerCenter')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.813rem', md: '0.875rem' }, color: alpha('#fff', 0.7) }}>
              {t('businessHours')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, fontSize: { xs: '0.813rem', md: '0.875rem' }, color: alpha('#fff', 0.7) }}>
              {t('closed')}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1.25rem', md: '1.5rem' }, color: theme.palette.primary.light }}>
              1588-0000
            </Typography>
            <Link
              href="mailto:haveagoodtrip.travellight@gmail.com"
              underline="none"
              sx={{
                color: alpha('#fff', 0.9),
                transition: 'all 0.2s',
                display: 'inline-block',
                fontSize: { xs: '0.813rem', md: '0.875rem' },
                wordBreak: 'break-all',
                '&:hover': {
                  color: theme.palette.primary.light
                }
              }}
            >
              haveagoodtrip.travellight@gmail.com
            </Link>
          </Grid>
        </Grid>
        
        <Divider sx={{ borderColor: alpha('#fff', 0.1), my: { xs: 4, md: 5 } }} />

        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: { xs: 2, md: 0 },
        }}>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, color: alpha('#fff', 0.6) }}>
            © {currentYear} TravelLight. {t('allRights')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 3 }} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Link href="/terms" underline="none" sx={{ fontSize: { xs: '0.813rem', md: '0.875rem' }, color: alpha('#fff', 0.6), '&:hover': { color: alpha('#fff', 0.9) } }}>
              {t('termsOfService')}
            </Link>
            <Link href="/privacy" underline="none" sx={{ fontSize: { xs: '0.813rem', md: '0.875rem' }, color: alpha('#fff', 0.6), '&:hover': { color: alpha('#fff', 0.9) } }}>
              {t('privacyPolicy')}
            </Link>
            <Link href="/refund" underline="none" sx={{ fontSize: { xs: '0.813rem', md: '0.875rem' }, color: alpha('#fff', 0.6), '&:hover': { color: alpha('#fff', 0.9) } }}>
              환불정책
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 