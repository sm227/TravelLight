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
          background: 'linear-gradient(135deg, #2E7DF1 0%, #5D9FFF 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          px: 3,
          textAlign: 'center',
          position: 'relative',
          borderRadius: 0
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" component="h1" gutterBottom>
            {t('partnerWelcome', '트래블라이트 파트너 프로그램')}
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
            {t('partnerDescription', '고객들에게 수하물 보관 서비스를 제공하고 추가 수익을 창출하세요. 트래블라이트와 함께 여행자들의 편의를 돕고 비즈니스를 성장시키세요.')}
          </Typography>
        </Container>
      </Paper>

      {/* 메인 액션 버튼 */}
      <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Card 
              elevation={3} 
              sx={{ 
                textAlign: 'center', 
                py: 4,
                height: '100%',
                borderRadius: 4,
                background: theme.palette.background.paper,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 30px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <CardContent>
                <StorefrontIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  {isPartner ? t('storeManagement', '매장 관리') : t('partnerSignup', '파트너 신청')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {isPartner 
                    ? t('storeManagementDescription', '예약 관리, 매장 정보 설정, 운영 시간 조정 등 매장 운영에 필요한 모든 기능을 제공합니다.') 
                    : t('partnerSignupDescription', '여행자들에게 수하물 보관 서비스를 제공하고 추가 수익을 창출하세요. 지금 파트너 신청을 시작하세요.')}
                </Typography>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={handleStoreManagement}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {isPartner ? t('manageStore', '매장 관리하기') : t('applyPartner', '파트너 신청하기')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card 
              elevation={3} 
              sx={{ 
                textAlign: 'center', 
                py: 4,
                height: '100%',
                borderRadius: 4,
                background: theme.palette.background.paper,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 30px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <CardContent>
                <MapIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  {t('mapView', '지도 보기')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {t('mapViewDescription', '내 매장 위치 및 주변 트래블라이트 파트너 매장을 지도에서 확인하세요.')}
                </Typography>
                <Button 
                  variant="outlined" 
                  size="large" 
                  onClick={handleMapView}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {t('viewMap', '지도 보기')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* 파트너 혜택 섹션 */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 5 }}>
          {t('partnerBenefits', '파트너 프로그램 혜택')}
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'primary.light', 
                    borderRadius: '50%', 
                    width: 50, 
                    height: 50, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <StorefrontIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6">
                    {t('additionalRevenue', '추가 수익 창출')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {t('additionalRevenueDescription', '유휴 공간을 활용해 추가 수익을 창출하세요. 여행자들의 수하물 보관 수요를 통해 새로운 비즈니스 기회를 얻을 수 있습니다.')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'primary.light', 
                    borderRadius: '50%', 
                    width: 50, 
                    height: 50, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <AnalyticsIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6">
                    {t('increasedTraffic', '방문객 증가')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {t('increasedTrafficDescription', '수하물을 맡기러 온 여행자들이 매장 내 상품이나 서비스를 구매할 가능성이 높아집니다. 새로운 고객층을 확보하세요.')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'primary.light', 
                    borderRadius: '50%', 
                    width: 50, 
                    height: 50, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <HelpOutlineIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6">
                    {t('marketingSupport', '마케팅 지원')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {t('marketingSupportDescription', '트래블라이트 앱과 웹사이트에 매장이 노출되어 홍보 효과를 얻을 수 있습니다. 여행자들에게 자연스럽게 매장을 알릴 수 있는 기회입니다.')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* 파트너 가입 안내 섹션 */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" gutterBottom>
                {t('howToJoin', '파트너 가입 방법')}
              </Typography>
              <Typography variant="body1" paragraph>
                {t('joinDescription', '간단한 절차를 통해 트래블라이트 파트너가 될 수 있습니다. 아래 단계를 따라 진행해 주세요:')}
              </Typography>
              
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                <Box sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  width: 30, 
                  height: 30, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mr: 2,
                  flexShrink: 0
                }}>
                  1
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('registerTitle', '가입 신청')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3 }}>
                    {t('registerDescription', '파트너 페이지에서 필요한 정보를 입력하여 파트너 가입을 신청합니다.')}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                <Box sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  width: 30, 
                  height: 30, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mr: 2,
                  flexShrink: 0
                }}>
                  2
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('reviewTitle', '검토 및 승인')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3 }}>
                    {t('reviewDescription', '트래블라이트 팀이 신청 내용을 검토하고 승인 여부를 이메일로 안내해 드립니다.')}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Box sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  width: 30, 
                  height: 30, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mr: 2,
                  flexShrink: 0
                }}>
                  3
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('startTitle', '서비스 시작')}
                  </Typography>
                  <Typography variant="body2">
                    {t('startDescription', '승인 후 파트너 계정을 생성하여 매장 관리 시스템에 접속하고 서비스를 시작합니다.')}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}>
                <CardMedia
                  component="img"
                  height="300"
                  image="/traveler-luggage.jpg"
                  alt="Partner Program"
                  sx={{ 
                    objectFit: 'cover',
                    // 이미지가 없을 경우 임시로 색상 그라데이션 표시
                    background: 'linear-gradient(45deg, #2E7DF1 30%, #5D9FFF 90%)'
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    {t('joinNow', '지금 파트너 가입하기')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('joinNowDescription', '더 많은 정보가 필요하시면 문의하세요. 트래블라이트 팀이 상세히 안내해 드리겠습니다.')}
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="large" 
                    fullWidth
                    onClick={isPartner ? () => navigate('/partner-dashboard') : handlePartnerSignup}
                  >
                    {isPartner ? t('manageStore', '매장 관리하기') : t('applyNow', '지금 신청하기')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
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