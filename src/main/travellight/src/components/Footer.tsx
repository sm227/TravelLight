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

const Footer: React.FC = () => {
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
              여행의 자유를 위한 최고의 짐 보관 및 배송 서비스를 제공합니다.
              언제 어디서나 편리하게 이용하세요.
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
              서비스
            </Typography>
            <Stack spacing={1}>
              {['유인보관', '무인보관', '짐배송', '가격안내', '이용방법'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  underline="hover"
                  color="inherit"
                  sx={{ '&:hover': { color: 'primary.light' } }}
                >
                  {item}
                </Link>
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              회사소개
            </Typography>
            <Stack spacing={1}>
              {['회사소개', '공지사항', '보도자료', '채용정보', '파트너십'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  underline="hover"
                  color="inherit"
                  sx={{ '&:hover': { color: 'primary.light' } }}
                >
                  {item}
                </Link>
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              고객지원
            </Typography>
            <Stack spacing={1}>
              {['자주 묻는 질문', '1:1 문의', '이용약관', '개인정보처리방침', '위치'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  underline="hover"
                  color="inherit"
                  sx={{ '&:hover': { color: 'primary.light' } }}
                >
                  {item}
                </Link>
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              고객센터
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              평일 09:00 - 18:00
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              주말 및 공휴일 휴무
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
            © {new Date().getFullYear()} TravelLight. All rights reserved.
          </Typography>
          <Box>
            <Link href="#" underline="hover" color="inherit" sx={{ mr: 3 }}>
              이용약관
            </Link>
            <Link href="#" underline="hover" color="inherit">
              개인정보처리방침
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 