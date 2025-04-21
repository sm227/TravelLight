import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  Divider,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StoreIcon from '@mui/icons-material/Store';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SettingsIcon from '@mui/icons-material/Settings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../services/AuthContext';
import { useTranslation } from 'react-i18next';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`partner-tabpanel-${index}`}
      aria-labelledby={`partner-tab-${index}`}
      {...other}
      style={{ padding: '24px 0' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

// 임시 예약 데이터
const reservations = [
  {
    id: 1,
    customerName: '김영희',
    date: '2023-11-01',
    startTime: '14:00',
    endTime: '16:00',
    status: '예약 완료',
    items: '소형 2, 중형 1',
    total: '15,000원'
  },
  {
    id: 2,
    customerName: '이철수',
    date: '2023-11-02',
    startTime: '10:00',
    endTime: '18:00',
    status: '이용 완료',
    items: '대형 1',
    total: '10,000원'
  },
  {
    id: 3,
    customerName: '박지민',
    date: '2023-11-03',
    startTime: '09:00',
    endTime: '20:00',
    status: '예약 완료',
    items: '중형 2',
    total: '16,000원'
  }
];

// 임시 매장 정보
const storeInfo = {
  name: '트래블라이트 강남점',
  address: '서울시 강남구 테헤란로 123',
  businessHours: '09:00 - 18:00',
  capacity: '소형 10개, 중형 5개, 대형 3개',
  status: '영업 중'
};

const PartnerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, isAuthenticated, isPartner, isWaiting, refreshUserData } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    // 인증 및 권한 확인
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/partner-dashboard' } });
    } else {
      // 데이터 로딩 시뮬레이션
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);
  
  const handleRefreshUserData = async () => {
    try {
      setCheckingStatus(true);
      await refreshUserData();
    } catch (error) {
      setError('사용자 정보를 업데이트하는 중 오류가 발생했습니다.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Container sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
        <Footer />
      </Box>
    );
  }

  // 승인 대기 중인 경우 (PARTNER 역할이 아니거나 WAIT 역할인 경우)
  if (!isPartner || isWaiting) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Container component="main" maxWidth="md" sx={{ mb: 4, mt: 8, flexGrow: 1 }}>
          <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, boxShadow: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              py: 4
            }}>
              <Typography variant="h4" color="primary" gutterBottom>
                승인 대기 중
              </Typography>
              <Typography variant="body1" align="center" sx={{ mt: 2, mb: 4 }}>
                현재 파트너 신청이 관리자 승인 대기 중입니다. 
                승인이 완료되면 매장 관리 기능을 사용하실 수 있습니다.
                승인 과정은 일반적으로 1-3일이 소요됩니다.
                {checkingStatus && (
                  <Box component="span" fontStyle="italic" sx={{ display: 'block', mt: 2, fontSize: '0.9rem', color: 'text.secondary' }}>
                    승인 상태를 확인 중입니다...
                  </Box>
                )}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/partner')}
                  size="large"
                >
                  파트너 메인 페이지로 돌아가기
                </Button>
                <Button
                  variant="contained"
                  onClick={handleRefreshUserData}
                  size="large"
                  disabled={checkingStatus}
                >
                  상태 새로고침
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      {/* 헤더 배너 */}
      <Paper 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #2E7DF1 0%, #5D9FFF 100%)',
          color: 'white',
          py: 4,
          px: 3,
          borderRadius: 0
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                파트너 대시보드
              </Typography>
              <Typography variant="subtitle1">
                {storeInfo.name} · {storeInfo.status}
              </Typography>
            </Box>
            <Chip 
              label="매장 정보 수정" 
              color="primary" 
              variant="outlined" 
              onClick={() => setTabValue(2)}
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
              }} 
            />
          </Box>
        </Container>
      </Paper>
      
      <Container maxWidth="lg" sx={{ flexGrow: 1, mb: 4, mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleChangeTab} 
            aria-label="partner dashboard tabs"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : undefined}
            centered={!isMobile}
          >
            <Tab icon={<StoreIcon />} label="매장 현황" />
            <Tab icon={<EventNoteIcon />} label="예약 관리" />
            <Tab icon={<SettingsIcon />} label="설정" />
            <Tab icon={<ReceiptIcon />} label="정산 내역" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              매장 현황
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      매장 정보
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">상호명</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">{storeInfo.name}</Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">주소</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">{storeInfo.address}</Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">영업시간</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">{storeInfo.businessHours}</Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">보관 용량</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">{storeInfo.capacity}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      오늘의 예약 현황
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">3</Typography>
                        <Typography variant="body2" color="textSecondary">예약 완료</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">2</Typography>
                        <Typography variant="body2" color="textSecondary">이용 중</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">1</Typography>
                        <Typography variant="body2" color="textSecondary">금일 완료</Typography>
                      </Box>
                    </Box>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      onClick={() => setTabValue(1)}
                    >
                      예약 관리로 이동
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      이번 달 수익 현황
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 3 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">12</Typography>
                        <Typography variant="body2" color="textSecondary">총 예약 수</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">152,000원</Typography>
                        <Typography variant="body2" color="textSecondary">총 매출</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">136,800원</Typography>
                        <Typography variant="body2" color="textSecondary">정산 예정액</Typography>
                      </Box>
                    </Box>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      onClick={() => setTabValue(3)}
                    >
                      정산 내역으로 이동
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              예약 관리
            </Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>예약번호</TableCell>
                      <TableCell>고객명</TableCell>
                      <TableCell>날짜</TableCell>
                      <TableCell>시간</TableCell>
                      <TableCell>보관 물품</TableCell>
                      <TableCell>금액</TableCell>
                      <TableCell>상태</TableCell>
                      <TableCell>관리</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reservations.map((row) => (
                      <TableRow hover key={row.id}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.customerName}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{`${row.startTime} - ${row.endTime}`}</TableCell>
                        <TableCell>{row.items}</TableCell>
                        <TableCell>{row.total}</TableCell>
                        <TableCell>
                          <Chip 
                            label={row.status} 
                            color={row.status === '예약 완료' ? 'primary' : 'success'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="small">상세보기</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              매장 설정
            </Typography>
            <Typography variant="body1" paragraph>
              매장 정보 수정 기능은 개발 중입니다. 곧 제공될 예정입니다.
            </Typography>
            <Button variant="contained" disabled>
              설정 저장하기
            </Button>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              정산 내역
            </Typography>
            <Typography variant="body1" paragraph>
              정산 내역 기능은 개발 중입니다. 곧 제공될 예정입니다.
            </Typography>
          </Box>
        </TabPanel>
      </Container>
      
      <Footer />
    </Box>
  );
};

export default PartnerDashboard; 