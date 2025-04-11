import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LuggageIcon from '@mui/icons-material/Luggage';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  
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
        bgcolor: 'primary.dark',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LuggageIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                TravelLight
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t('footerDescription')}
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton aria-label="facebook" sx={{ color: 'white' }}>
                <FacebookIcon />
              </IconButton>
              <IconButton aria-label="twitter" sx={{ color: 'white' }}>
                <TwitterIcon />
              </IconButton>
              <IconButton aria-label="instagram" sx={{ color: 'white' }}>
                <InstagramIcon />
              </IconButton>
              <IconButton aria-label="youtube" sx={{ color: 'white' }}>
                <YouTubeIcon />
              </IconButton>
            </Stack>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {t('footerServices')}
            </Typography>
            <Stack spacing={1}>
              {serviceLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  underline="hover"
                  color="inherit"
                  sx={{ '&:hover': { color: 'primary.light' } }}
                >
                  {item.name}
                </Link>
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {t('aboutCompany')}
            </Typography>
            <Stack spacing={1}>
              {companyLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  underline="hover"
                  color="inherit"
                  sx={{ '&:hover': { color: 'primary.light' } }}
                >
                  {item.name}
                </Link>
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {t('customerSupport')}
            </Typography>
            <Stack spacing={1}>
              {supportLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  underline="hover"
                  color="inherit"
                  sx={{ '&:hover': { color: 'primary.light' } }}
                >
                  {item.name}
                </Link>
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {t('customerCenter')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t('businessHours')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t('closed')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              1588-0000
            </Typography>
            <Link
              href="mailto:support@travellight.com"
              underline="hover"
              color="inherit"
              sx={{ '&:hover': { color: 'primary.light' } }}
            >
              support@travellight.com
            </Link>
          </Grid>
        </Grid>
        
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', my: 4 }} />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mb: { xs: 2, md: 0 } }}>
            © {currentYear} TravelLight. {t('allRights')}
          </Typography>
          <Box>
            <Link href="#" underline="hover" color="inherit" sx={{ mr: 3 }}>
              {t('termsOfService')}
            </Link>
            <Link href="#" underline="hover" color="inherit">
              {t('privacyPolicy')}
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 