import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Paper,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MapIcon from '@mui/icons-material/Map';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../services/AuthContext';

const Partner: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, isPartner, isWaiting } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'store' | 'map' | null>(null);

  // 페이지 진입 시 사용자 역할에 따라 자동 이동
  useEffect(() => {
    if (isAuthenticated) {
      if (isPartner) {
        // PARTNER 역할: 매장 관리 페이지로 이동
        navigate('/partner-dashboard');
      } else if (isWaiting) {
        // WAIT 역할: 승인 대기 화면으로 이동
        navigate('/partner-dashboard');
      }
      // USER 역할은 현재 페이지에 머무름
    }
  }, [isAuthenticated, isPartner, isWaiting, navigate]);

  const handleStoreManagement = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/partner' } });
      return;
    }

    if (isPartner) {
      // 파트너인 경우 대시보드로 이동
      navigate('/partner-dashboard');
    } else {
      // 파트너가 아닌 경우 다이얼로그 표시
      setPendingAction('store');
      setDialogOpen(true);
    }
  };

  const handleMapView = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/partner' } });
      return;
    }

    if (isPartner) {
      // 파트너인 경우 지도 페이지로 이동
      navigate('/map');
    } else {
      // 파트너가 아닌 경우 다이얼로그 표시
      setPendingAction('map');
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setPendingAction(null);
  };

  const handlePartnerSignup = () => {
    handleCloseDialog();
    navigate('/partner-signup');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      {/* 파트너 메인 배너 */}
      <Paper 
        elevation={0}
        sx={{
          background: '#2E7DF1',
          color: 'white',
          py: { xs: 8, md: 12 },
          px: 3,
          textAlign: 'center',
          position: 'relative',
          borderRadius: 0
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              lineHeight: 1.2,
              mb: 3
            }}
          >
            {t('partnerMainTitle', '트래블라이트 파트너 프로그램')}
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 5, 
              maxWidth: '700px', 
              mx: 'auto',
              fontWeight: 400,
              opacity: 0.95
            }}
          >
            {t('partnerSubtitle', '고객들에게 수하물 보관 서비스를 제공하고 추가 수익을 창출하세요. 트래블라이트와 함께 여행자들의 편의를 돕고 비즈니스를 성장시키세요.')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained"
              size="large"
              onClick={handleStoreManagement}
              sx={{ 
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {isPartner ? t('manageStore', '매장 관리하기') : t('applyPartner', '파트너 신청하기')}
            </Button>
            <Button 
              variant="outlined"
              size="large"
              onClick={handleMapView}
              sx={{ 
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {t('viewMap', '지도 보기')}
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* 파트너 혜택 섹션 - 간결하게 */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          gutterBottom 
          textAlign="center" 
          sx={{ mb: 6, fontWeight: 700 }}
        >
          {t('whyPartner', '왜 파트너가 되어야 할까요?')}
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ 
                bgcolor: 'primary.main', 
                borderRadius: '50%', 
                width: 80, 
                height: 80, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <StorefrontIcon sx={{ color: 'white', fontSize: 40 }} />
              </Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                {t('extraTraffic', '추가 고객')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {t('extraTrafficDescription', '지역 주민과 관광객 모두를 매장으로 유도합니다. 수하물을 맡기러 온 고객들이 자연스럽게 매장 상품을 구매할 기회를 만들어보세요.')}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ 
                bgcolor: 'primary.main', 
                borderRadius: '50%', 
                width: 80, 
                height: 80, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <AnalyticsIcon sx={{ color: 'white', fontSize: 40 }} />
              </Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                {t('extraRevenue', '추가 수익')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {t('extraRevenueDescription', '보관하는 모든 아이템에서 수익을 얻습니다. 매월 말 자동으로 정산됩니다. 유휴 공간을 활용한 완전히 새로운 수익원입니다.')}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ 
                bgcolor: 'primary.main', 
                borderRadius: '50%', 
                width: 80, 
                height: 80, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <HelpOutlineIcon sx={{ color: 'white', fontSize: 40 }} />
              </Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                {t('extraFlexible', '완전 자율')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {t('extraFlexibleDescription', '온라인 플랫폼으로 모든 것이 처리됩니다. 보관 용량과 운영 시간을 직접 관리하세요. 이메일과 SMS로 고객 방문을 알려드립니다.')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
      
      {/* 파트너 신청 CTA 섹션 */}
      <Box sx={{ bgcolor: 'background.default', py: 8, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            {t('readyToStart', '파트너 신청 준비 완료')}
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.6 }}>
            {t('ctaDescription', '간단한 절차를 통해 트래블라이트 파트너가 되어 새로운 수익원을 만들어보세요.')}
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={isPartner ? () => navigate('/partner-dashboard') : handlePartnerSignup}
            sx={{ 
              px: 6, 
              py: 2, 
              fontSize: '1.2rem',
              fontWeight: 600,
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(46, 125, 241, 0.3)',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 30px rgba(46, 125, 241, 0.4)'
              }
            }}
          >
            {isPartner ? t('manageStore', '매장 관리하기') : t('applyNow', '지금 신청하기')}
          </Button>
        </Container>
      </Box>
      
      {/* FAQ 섹션 */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom textAlign="center" sx={{ mb: 6, fontWeight: 700 }}>
          {t('faq', '자주 묻는 질문')}
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                {t('faqSpace', '보관할 공간이 많지 않은데도 파트너가 될 수 있나요?')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {t('faqSpaceAnswer', '최소 5개 아이템 정도의 공간을 권장하지만, 용량에 대한 최소/최대 요구사항은 없습니다. 공간이 많을수록 수익 가능성이 높아집니다.')}
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                {t('faqBenefit', '파트너십을 통해 어떤 혜택을 얻을 수 있나요?')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {t('faqBenefitAnswer', '추가 수익원 확보, 새로운 고객 유입, 브랜드 인지도 향상 등의 혜택을 얻을 수 있습니다. 보관하는 모든 아이템에 대해 수수료를 받습니다.')}
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                {t('faqNotification', '고객이 언제 오는지 어떻게 알 수 있나요?')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {t('faqNotificationAnswer', '새로운 예약이 들어오면 이메일과 SMS로 알림을 보내드립니다. 보관할 아이템 수와 예상 맡김/찾기 시간을 미리 알려드립니다.')}
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                {t('faqSecurity', '보안 문제는 어떻게 해결되나요?')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {t('faqSecurityAnswer', '고객 아이템에 대해 최대 천만원까지 보장합니다. 각 가방에는 고유 번호가 있는 보안 태그를 제공하며, 모든 결제는 온라인으로 처리됩니다.')}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* 파트너 신청 다이얼로그 */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"파트너 신청 필요"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {pendingAction === 'store' 
              ? '매장 관리 기능을 이용하시려면 파트너 신청이 필요합니다. 파트너 신청 절차를 진행하시겠습니까?' 
              : '파트너 지도 기능을 이용하시려면 파트너 신청이 필요합니다. 파트너 신청 절차를 진행하시겠습니까?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            취소
          </Button>
          <Button onClick={handlePartnerSignup} color="primary" variant="contained" autoFocus>
            파트너 신청하기
          </Button>
        </DialogActions>
      </Dialog>
      
      <Footer />
    </Box>
  );
};

export default Partner; 