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
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
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
import api, { ApiResponse } from '../services/api';

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

interface Store {
  id: number;
  name: string;
  address: string;
  businessHours: Record<string, string>;
  is24Hours: boolean;
  capacity: string;
  status: string;
}

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
  const [storeList, setStoreList] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  
  // 예약 상태별 카운트를 추적하는 상태 변수들 추가
  const [reservedCount, setReservedCount] = useState(0);
  const [inUseCount, setInUseCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    // 인증 및 권한 확인
    if (!isAuthenticated) {
      // navigate('/login', { state: { from: '/partner-dashboard' } });
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

  const handleStoreChange = (event: SelectChangeEvent<number>) => {
    const store = storeList.find(s => s.id === event.target.value);
    if (store) {
      setSelectedStore(store);
    }
  };

  const handleAddStore = () => {
    navigate('/partner-signup');
  };

  // 파트너의 매장 목록을 API로부터 가져옵니다.
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await api.get<ApiResponse<any[]>>('/partnership');
        const data = response.data.data;
        const userStores = data.filter((p: any) => p.email === user?.email && p.status === 'APPROVED');
        const mappedStores = userStores.map((p: any) => ({
          id: p.id,
          name: p.businessName,
          address: p.address,
          businessHours: p.businessHours,
          is24Hours: p.is24Hours,
          capacity: p.spaceSize,
          status: p.status === 'APPROVED' ? '영업 중' : p.status === 'PENDING' ? '승인 대기 중' : '거절됨',
        }));
        setStoreList(mappedStores);
        if (mappedStores.length > 0) {
          setSelectedStore(mappedStores[0]);
        }
      } catch (e) {
        setError('매장 정보를 불러오는 중 오류가 발생했습니다.');
      }
    };
    if (user && user.email) {
      fetchStores();
    }
  }, [user]);

  // 선택된 매장의 예약 목록을 API로부터 가져옵니다.
  useEffect(() => {
    const fetchReservations = async () => {
      if (!selectedStore) return;
      try {
        const result = await api.get<any[]>(`/reservations/store/${encodeURIComponent(selectedStore.name)}`);
        const data: any[] = result.data;
        console.log("API에서 받아온 예약 데이터:", data); // 디버깅용 로그 추가
        
        // 현재 시간에 따라 예약 상태 업데이트
        const now = new Date();
        const updatedData = updateReservationStatuses(data, now);
        
        const mapped = updatedData.map(r => {
          const items = [
            r.smallBags ? `소형 ${r.smallBags}` : null,
            r.mediumBags ? `중형 ${r.mediumBags}` : null,
            r.largeBags ? `대형 ${r.largeBags}` : null
          ].filter(Boolean).join(', ');
          
          // 표시용 상태 텍스트
          const displayStatus = r.displayStatus || (r.status === 'RESERVED' ? '예약 완료' : r.status === 'COMPLETED' ? '이용 완료' : r.status);
          
          return {
            id: r.id,
            customerName: r.userName,
            date: r.storageDate,
            startTime: r.storageStartTime,
            endTime: r.storageEndTime,
            items,
            total: `${r.totalPrice.toLocaleString()}원`,
            status: displayStatus,
            rawStatus: r.status // 원본 상태값 추가로 저장
          };
        });
        setReservations(mapped);
        
        // 예약 상태별 카운트 계산
        const { reserved, inUse, completed } = calculateReservationCounts(mapped);
        setReservedCount(reserved);
        setInUseCount(inUse);
        setCompletedCount(completed);
        
      } catch (e) {
        console.error("예약 정보 로딩 중 오류:", e); // 더 자세한 오류 정보
        setError('예약 정보를 불러오는 중 오류가 발생했습니다.');
      }
    };
    fetchReservations();

    // 추가: 1분마다 예약 정보 새로고침
    const refreshInterval = setInterval(fetchReservations, 60000);
    return () => clearInterval(refreshInterval);
  }, [selectedStore]);

  // 백엔드 예약 데이터에 시간 기반 상태 추가
  const updateReservationStatuses = (reservations: any[], now: Date) => {
    return reservations.map(reservation => {
      const updatedReservation = { ...reservation };
      
      // 날짜와 시간 파싱
      if (reservation.storageDate && reservation.storageStartTime && reservation.storageEndTime) {
        // 시간 파싱
        const parseTime = (timeStr: string) => {
          const parts = timeStr.split(':');
          if (parts.length >= 2) {
            return {
              hours: parseInt(parts[0], 10),
              minutes: parseInt(parts[1], 10)
            };
          }
          return { hours: 0, minutes: 0 };
        };
        
        // 날짜 파싱
        const parseDate = (dateStr: string) => {
          try {
            return new Date(dateStr);
          } catch (e) {
            console.error("날짜 파싱 오류:", e);
            return new Date();
          }
        };
        
        const storageDate = parseDate(reservation.storageDate);
        const startTime = parseTime(reservation.storageStartTime);
        const endTime = parseTime(reservation.storageEndTime);
        
        // 시작 및 종료 일시 생성
        const startDateTime = new Date(storageDate);
        startDateTime.setHours(startTime.hours, startTime.minutes, 0);
        
        const endDateTime = new Date(storageDate);
        endDateTime.setHours(endTime.hours, endTime.minutes, 0);
        
        // 오늘인지 확인
        const isToday = 
          storageDate.getDate() === now.getDate() &&
          storageDate.getMonth() === now.getMonth() &&
          storageDate.getFullYear() === now.getFullYear();
        
        // 상태 업데이트
        if (reservation.status === 'RESERVED') {
          if (now < startDateTime) {
            updatedReservation.displayStatus = '예약 완료';
          } else if (now >= startDateTime && now < endDateTime) {
            updatedReservation.displayStatus = '이용 중';
          } else if (now >= endDateTime) {
            updatedReservation.displayStatus = '이용 완료';
            
            // 선택적으로 백엔드 API 호출하여 상태 업데이트 가능
            // 여기서는 표시용 상태만 변경
          }
        } else if (reservation.status === 'COMPLETED') {
          updatedReservation.displayStatus = '이용 완료';
        }
      }
      
      return updatedReservation;
    });
  };
  
  // 예약 상태에 따라 카운트를 계산하는 함수 개선
  const calculateReservationCounts = (reservations: any[]) => {
    const now = new Date();
    let reserved = 0;
    let inUse = 0;
    let completed = 0;

    console.log("상태 계산 시작:", now.toLocaleTimeString(), "총 예약수:", reservations.length); // 디버깅용 로그

    // 오늘 날짜인지 확인하는 함수
    const isToday = (dateStr: string) => {
      if (!dateStr) return false;
      
      const today = new Date();
      const date = new Date(dateStr);
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    };

    reservations.forEach(res => {
      // 오늘 날짜의 예약만 필터링
      if (!isToday(res.date)) return;

      console.log(`예약 ID: ${res.id}, 상태: ${res.status}, 시작: ${res.startTime}, 종료: ${res.endTime}`);

      // 표시 상태에 따라 카운트
      if (res.status === '예약 완료') {
        reserved++;
        console.log(`  => 예약 완료 카운트 증가 (ID: ${res.id})`);
      } else if (res.status === '이용 중') {
        inUse++;
        console.log(`  => 이용 중 카운트 증가 (ID: ${res.id})`);
      } else if (res.status === '이용 완료') {
        completed++;
        console.log(`  => 금일 완료 카운트 증가 (ID: ${res.id})`);
      }
    });

    console.log(`계산 결과 - 예약 완료: ${reserved}, 이용 중: ${inUse}, 금일 완료: ${completed}`);
    return { reserved, inUse, completed };
  };

  // 주기적으로 예약 상태 업데이트 (1분마다)
  useEffect(() => {
    if (!reservations.length) return;
    
    const intervalId = setInterval(() => {
      const { reserved, inUse, completed } = calculateReservationCounts(reservations);
      setReservedCount(reserved);
      setInUseCount(inUse);
      setCompletedCount(completed);
    }, 60000); // 1분마다 업데이트
    
    // 초기 실행
    const { reserved, inUse, completed } = calculateReservationCounts(reservations);
    setReservedCount(reserved);
    setInUseCount(inUse);
    setCompletedCount(completed);
    
    return () => clearInterval(intervalId);
  }, [reservations]);

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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4" component="h1">
              파트너 대시보드
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddStore}
              sx={{ 
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
            >
              매장 추가하기
            </Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl sx={{ minWidth: 300, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1 }}>
              <Select
                value={selectedStore?.id}
                onChange={handleStoreChange}
                sx={{ 
                  color: 'white',
                  '.MuiSelect-icon': { color: 'white' },
                  '&:before': { borderColor: 'white' },
                  '&:after': { borderColor: 'white' }
                }}
              >
                {storeList.map((store) => (
                  <MenuItem key={store.id} value={store.id}>
                    {store.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Chip 
              label={selectedStore?.status} 
              color="primary" 
              variant="outlined" 
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
                        <Typography variant="body1">{selectedStore?.name}</Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">주소</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">{selectedStore?.address}</Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">영업시간</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">
                          {selectedStore?.is24Hours ? (
                            <div>24시간 영업</div>
                          ) : (
                            selectedStore?.businessHours ? (
                              ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => {
                                const hours = selectedStore.businessHours[day];
                                if (!hours) return null;
                                const formattedDay = day === 'MONDAY' ? '월요일' :
                                                    day === 'TUESDAY' ? '화요일' :
                                                    day === 'WEDNESDAY' ? '수요일' :
                                                    day === 'THURSDAY' ? '목요일' :
                                                    day === 'FRIDAY' ? '금요일' :
                                                    day === 'SATURDAY' ? '토요일' :
                                                    day === 'SUNDAY' ? '일요일' : day;
                                return (
                                  <div key={day}>
                                    {formattedDay}: {hours}
                                  </div>
                                );
                              }).filter(Boolean)
                            ) : '영업 시간이 없습니다.'
                          )}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">보관 용량</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">{selectedStore?.capacity}</Typography>
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
                        <Typography variant="h4" color="primary">{reservedCount}</Typography>
                        <Typography variant="body2" color="textSecondary">예약 완료</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">{inUseCount}</Typography>
                        <Typography variant="body2" color="textSecondary">이용 중</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">{completedCount}</Typography>
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
                        <Typography variant="h4" color="primary">{reservations.length}</Typography>
                        <Typography variant="body2" color="textSecondary">총 예약 수</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {reservations.reduce((sum, reservation) => {
                            const priceStr = reservation.total.replace(/[^0-9]/g, '');
                            return sum + (parseInt(priceStr) || 0);
                          }, 0).toLocaleString()}원
                        </Typography>
                        <Typography variant="body2" color="textSecondary">총 매출</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {Math.floor(reservations.reduce((sum, reservation) => {
                            const priceStr = reservation.total.replace(/[^0-9]/g, '');
                            return sum + (parseInt(priceStr) || 0);
                          }, 0) * 0.9).toLocaleString()}원
                        </Typography>
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