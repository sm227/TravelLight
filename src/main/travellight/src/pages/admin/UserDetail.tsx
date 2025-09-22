import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Button,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ThemeProvider,
  createTheme
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Email,
  CalendarToday,
  Update,
  Security,
  InfoOutlined,
  Edit,
  Save,
  Cancel,
  Phone,
  LocationOn,
  Work,
  Badge,
  Business,
  AssignmentInd,
  CreditCard,
  History,
  Settings,
  Visibility,
  Payment,
  AdminPanelSettings,
  TrendingUp,
  ShoppingCart,
  LocalOffer,
  Star,
  Analytics,
  MonetizationOn,
  Repeat,
  Schedule
} from '@mui/icons-material';
import { adminUserService, AdminUserResponse } from '../../services/api';

// AdminLayout과 동일한 색상 정의
const COLORS = {
  backgroundDark: '#0f0f11',
  backgroundLight: '#18181b',
  backgroundCard: '#1f1f23',
  backgroundSurface: '#27272a',
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  borderPrimary: '#27272a',
  borderSecondary: '#3f3f46',
  accentPrimary: '#3b82f6',
  backgroundHover: 'rgba(255, 255, 255, 0.05)',
  backgroundSelected: 'rgba(59, 130, 246, 0.1)',
  backgroundSelectedHover: 'rgba(59, 130, 246, 0.15)'
};

// 다크 테마 생성
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: COLORS.backgroundDark,
      paper: COLORS.backgroundCard,
    },
    text: {
      primary: COLORS.textPrimary,
      secondary: COLORS.textSecondary,
    },
    primary: {
      main: COLORS.accentPrimary,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.backgroundCard,
          borderColor: COLORS.borderPrimary,
          border: `1px solid ${COLORS.borderPrimary}`,
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: COLORS.textSecondary,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: COLORS.textPrimary,
        },
        secondary: {
          color: COLORS.textSecondary,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: COLORS.textPrimary,
        },
        h6: {
          color: COLORS.textPrimary,
        },
      },
    },
  },
});

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
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// 역할 표시 함수
const getRoleDisplayName = (role: string) => {
  const roleMap: { [key: string]: string } = {
    'ADMIN': '관리자',
    'USER': '일반사용자',
    'PARTNER': '파트너 사용자',
    'WAIT': '승인대기중'
  };
  return roleMap[role] || role;
};

// 날짜 포맷 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 날짜시간 포맷 함수
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const UserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<AdminUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<AdminUserResponse>>({});
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // 사용자 정보 로드
  const loadUser = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      // TODO: 개별 사용자 조회 API가 있다면 사용, 없으면 전체 목록에서 찾기
      const response = await adminUserService.getAllUsers();
      if (response.success) {
        const foundUser = response.data.find(u => u.id === parseInt(userId));
        if (foundUser) {
          setUser(foundUser);
          setEditData(foundUser);
        } else {
          setAlertMessage({type: 'error', message: '사용자를 찾을 수 없습니다.'});
        }
      }
    } catch (error) {
      console.error('사용자 정보 로드 중 오류:', error);
      setAlertMessage({type: 'error', message: '사용자 정보를 불러오는데 실패했습니다.'});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [userId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // 취소
      setEditData(user || {});
    }
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    // TODO: 사용자 정보 업데이트 API 호출
    console.log('저장할 데이터:', editData);
    setEditMode(false);
    setAlertMessage({type: 'success', message: '사용자 정보가 업데이트되었습니다.'});
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleInputChange = (field: keyof AdminUserResponse, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>사용자 정보를 불러오는 중...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">사용자를 찾을 수 없습니다.</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/admin/users')}
          sx={{ mt: 2 }}
        >
          사용자 목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ 
        p: 3, 
        bgcolor: COLORS.backgroundDark,
        minHeight: '100vh',
        color: COLORS.textPrimary
      }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <IconButton 
            onClick={() => navigate('/admin/users')}
            sx={{ 
              color: COLORS.textSecondary,
              '&:hover': { 
                color: COLORS.textPrimary,
                bgcolor: COLORS.backgroundHover 
              }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="bold"
            sx={{ color: COLORS.textPrimary }}
          >
            사용자 상세 정보
          </Typography>
        </Stack>

        {alertMessage && (
          <Alert 
            severity={alertMessage.type} 
            sx={{ mb: 2 }}
            onClose={() => setAlertMessage(null)}
          >
            {alertMessage.message}
          </Alert>
        )}
      </Box>

      {/* 사용자 기본 정보 헤더 */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          bgcolor: COLORS.backgroundCard,
          border: `1px solid ${COLORS.borderPrimary}`
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                bgcolor: user.role === 'ADMIN' ? COLORS.accentPrimary : COLORS.backgroundSurface,
                fontSize: '2.5rem',
                color: COLORS.textPrimary,
                border: `2px solid ${COLORS.borderSecondary}`
              }}
            >
              {user.name.charAt(0)}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              gutterBottom
              sx={{ color: COLORS.textPrimary }}
            >
              {user.name}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip 
                label={getRoleDisplayName(user.role)} 
                color={user.role === 'ADMIN' ? 'secondary' : user.role === 'PARTNER' ? 'warning' : 'default'}
                size="medium"
                sx={{
                  bgcolor: user.role === 'ADMIN' ? COLORS.accentPrimary : COLORS.backgroundSurface,
                  color: COLORS.textPrimary,
                  border: `1px solid ${COLORS.borderSecondary}`
                }}
              />
              <Chip 
                label={user.status} 
                color={user.status === '활성' ? 'success' : 'error'} 
                size="medium" 
                variant="outlined"
                sx={{
                  color: user.status === '활성' ? '#10b981' : '#ef4444',
                  borderColor: user.status === '활성' ? '#10b981' : '#ef4444'
                }}
              />
            </Stack>
            <Typography 
              variant="body1" 
              sx={{ color: COLORS.textSecondary }}
            >
              사용자 ID: {user.id} | 가입일: {formatDate(user.createdAt)}
            </Typography>
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={1}>
              {editMode ? (
                <>
                  <Button 
                    variant="contained" 
                    startIcon={<Save />}
                    onClick={handleSave}
                    sx={{
                      bgcolor: COLORS.accentPrimary,
                      color: COLORS.textPrimary,
                      '&:hover': {
                        bgcolor: COLORS.accentPrimary,
                        opacity: 0.8
                      }
                    }}
                  >
                    저장
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<Cancel />}
                    onClick={handleEditToggle}
                    sx={{
                      color: COLORS.textSecondary,
                      borderColor: COLORS.borderSecondary,
                      '&:hover': {
                        color: COLORS.textPrimary,
                        borderColor: COLORS.textSecondary,
                        bgcolor: COLORS.backgroundHover
                      }
                    }}
                  >
                    취소
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outlined" 
                  startIcon={<Edit />}
                  onClick={handleEditToggle}
                  sx={{
                    color: COLORS.textSecondary,
                    borderColor: COLORS.borderSecondary,
                    '&:hover': {
                      color: COLORS.textPrimary,
                      borderColor: COLORS.textSecondary,
                      bgcolor: COLORS.backgroundHover
                    }
                  }}
                >
                  편집
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* 탭 네비게이션 */}
      <Paper 
        elevation={1} 
        sx={{ 
          borderRadius: 2,
          bgcolor: COLORS.backgroundCard,
          border: `1px solid ${COLORS.borderPrimary}`
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: COLORS.borderPrimary,
            '& .MuiTab-root': {
              color: COLORS.textSecondary,
              '&:hover': {
                color: COLORS.textPrimary
              },
              '&.Mui-selected': {
                color: COLORS.accentPrimary
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: COLORS.accentPrimary
            }
          }}
        >
          <Tab label="고객정보" icon={<Person />} iconPosition="start" />
          <Tab label="예약분석" icon={<Analytics />} iconPosition="start" />
          <Tab label="결제분석" icon={<MonetizationOn />} iconPosition="start" />
          <Tab label="마케팅" icon={<LocalOffer />} iconPosition="start" />
        </Tabs>

        {/* 고객정보 탭 */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card 
                elevation={1} 
                sx={{ 
                  height: '100%',
                  bgcolor: COLORS.backgroundCard,
                  border: `1px solid ${COLORS.borderPrimary}`
                }}
              >
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      color: COLORS.textPrimary
                    }}
                  >
                    <Person sx={{ mr: 1, color: COLORS.accentPrimary }} />
                    기본 정보
                  </Typography>
                  
                  <List 
                    dense
                    sx={{
                      '& .MuiListItem-root': {
                        color: COLORS.textPrimary
                      },
                      '& .MuiListItemIcon-root': {
                        color: COLORS.textSecondary
                      },
                      '& .MuiListItemText-primary': {
                        color: COLORS.textPrimary
                      },
                      '& .MuiListItemText-secondary': {
                        color: COLORS.textSecondary
                      }
                    }}
                  >
                    <ListItem>
                      <ListItemIcon><Person /></ListItemIcon>
                      <ListItemText 
                        primary="이름"
                        secondary={
                          editMode ? (
                            <TextField
                              size="small"
                              value={editData.name || ''}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              sx={{ 
                                mt: 1,
                                '& .MuiInputBase-root': {
                                  bgcolor: COLORS.backgroundSurface,
                                  color: COLORS.textPrimary
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: COLORS.borderSecondary
                                }
                              }}
                            />
                          ) : user.name
                        }
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon><Email color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="이메일"
                        secondary={
                          editMode ? (
                            <TextField
                              size="small"
                              type="email"
                              value={editData.email || ''}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              sx={{ mt: 1 }}
                            />
                          ) : user.email
                        }
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon><Badge color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="고객 ID"
                        secondary={`USER-${String(user.id).padStart(6, '0')}`}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon><CalendarToday color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="가입일"
                        secondary={formatDate(user.createdAt)}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon><Star color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="고객 등급"
                        secondary={user.role === 'PARTNER' ? 'VIP 고객' : '일반 고객'}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card 
                elevation={1} 
                sx={{ 
                  height: '100%',
                  bgcolor: COLORS.backgroundCard,
                  border: `1px solid ${COLORS.borderPrimary}`
                }}
              >
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      color: COLORS.textPrimary
                    }}
                  >
                    <TrendingUp sx={{ mr: 1, color: COLORS.accentPrimary }} />
                    고객 가치 요약
                  </Typography>
                  
                  <List 
                    dense
                    sx={{
                      '& .MuiListItem-root': {
                        color: COLORS.textPrimary
                      },
                      '& .MuiListItemIcon-root': {
                        color: COLORS.textSecondary
                      },
                      '& .MuiListItemText-primary': {
                        color: COLORS.textPrimary
                      },
                      '& .MuiListItemText-secondary': {
                        color: COLORS.textSecondary
                      }
                    }}
                  >
                    <ListItem>
                      <ListItemIcon><MonetizationOn /></ListItemIcon>
                      <ListItemText 
                        primary="총 구매 금액"
                        secondary="0원"
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon><ShoppingCart color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="총 예약 횟수"
                        secondary="0회"
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon><Repeat color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="재방문 횟수"
                        secondary="0회"
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon><CalendarToday color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="최근 이용일"
                        secondary="이용 내역 없음"
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon><Analytics color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="고객 활성도"
                        secondary={`${Math.ceil((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 3600 * 24))}일 전 가입`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 예약분석 탭 */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* 예약 통계 */}
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Analytics sx={{ mr: 1, color: 'primary.main' }} />
                    예약 통계
                  </Typography>

                  <List dense                  >
                    <ListItem>
                      <ListItemIcon><ShoppingCart /></ListItemIcon>
                      <ListItemText 
                        primary="총 예약 횟수"
                        secondary="0회"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CalendarToday color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="이번 달 예약"
                        secondary="0회"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Schedule color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="최근 예약일"
                        secondary="없음"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><TrendingUp color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="예약 증가율"
                        secondary="신규 고객"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* 선호 패턴 */}
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Star sx={{ mr: 1, color: 'primary.main' }} />
                    선호 패턴
                  </Typography>

                  <List dense>
                    <ListItem>
                      <ListItemIcon><LocationOn color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="자주 이용하는 지역"
                        secondary="데이터 없음"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Schedule color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="선호 시간대"
                        secondary="데이터 없음"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Badge color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="선호 서비스"
                        secondary="데이터 없음"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Repeat color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="재예약률"
                        secondary="0%"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* 최근 예약 내역 */}
            <Grid item xs={12}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <History sx={{ mr: 1, color: 'primary.main' }} />
                    최근 예약 내역
                  </Typography>

                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    예약 내역이 없습니다.
                  </Typography>

                  {/* TODO: 실제 예약 데이터가 있을 때 테이블로 구현
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>예약일</TableCell>
                          <TableCell>서비스</TableCell>
                          <TableCell>장소</TableCell>
                          <TableCell>금액</TableCell>
                          <TableCell>상태</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        // 예약 데이터 표시
                      </TableBody>
                    </Table>
                  </TableContainer>
                  */}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 결제분석 탭 */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* 결제 통계 */}
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <MonetizationOn sx={{ mr: 1, color: 'primary.main' }} />
                    결제 통계
                  </Typography>

                  <List dense>
                    <ListItem>
                      <ListItemIcon><MonetizationOn color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="총 결제 금액"
                        secondary="0원"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Payment color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="결제 횟수"
                        secondary="0회"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><TrendingUp color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="평균 결제 금액"
                        secondary="0원"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CalendarToday color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="최근 결제일"
                        secondary="없음"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* 결제 패턴 */}
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Analytics sx={{ mr: 1, color: 'primary.main' }} />
                    결제 패턴
                  </Typography>

                  <List dense>
                    <ListItem>
                      <ListItemIcon><CreditCard color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="선호 결제 수단"
                        secondary="데이터 없음"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Schedule color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="주요 결제 시간대"
                        secondary="데이터 없음"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><TrendingUp color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="월별 결제 증가율"
                        secondary="신규 고객"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Star color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="VIP 승급 가능성"
                        secondary="낮음 (결제 이력 없음)"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* 월별 결제 동향 */}
            <Grid item xs={12}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Analytics sx={{ mr: 1, color: 'primary.main' }} />
                    월별 결제 동향
                  </Typography>

                  <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h2" color="text.secondary" sx={{ fontSize: '3rem', mb: 2 }}>
                      📊
                    </Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      결제 데이터가 없습니다
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      첫 결제 후 상세한 분석 데이터를 확인할 수 있습니다.
                    </Typography>
                  </Box>

                  {/* TODO: 실제 결제 데이터가 있을 때 차트로 구현
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyPaymentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                  */}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 마케팅 탭 */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* 마케팅 대상 분석 */}
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LocalOffer sx={{ mr: 1, color: 'primary.main' }} />
                    마케팅 대상 분석
                  </Typography>

                  <List dense>
                    <ListItem>
                      <ListItemIcon><Star color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="고객 세그먼트"
                        secondary="신규 고객"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><TrendingUp color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="구매 가능성"
                        secondary="보통 (신규 고객)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><MonetizationOn color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="예상 구매력"
                        secondary="데이터 수집 중"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Repeat color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="재구매 확률"
                        secondary="예측 불가 (이용 이력 없음)"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* 추천 프로모션 */}
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LocalOffer sx={{ mr: 1, color: 'primary.main' }} />
                    추천 프로모션
                  </Typography>

                  <List dense>
                    <ListItem>
                      <ListItemIcon><LocalOffer color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="신규 고객 할인"
                        secondary="첫 예약 20% 할인 쿠폰"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Star color="warning" /></ListItemIcon>
                      <ListItemText 
                        primary="웰컴 패키지"
                        secondary="가입 축하 무료 서비스 체험"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CalendarToday color="info" /></ListItemIcon>
                      <ListItemText 
                        primary="계절 프로모션"
                        secondary="여름휴가 특별 할인"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Repeat color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="재방문 유도"
                        secondary="추천인 혜택 프로그램"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* 마케팅 액션 */}
            <Grid item xs={12}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Analytics sx={{ mr: 1, color: 'primary.main' }} />
                    마케팅 액션 계획
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                        <Typography variant="h6" color="primary">
                          1단계
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          환영 이메일 발송
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          가입 후 24시간 내
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                        <Typography variant="h6" color="success.main">
                          2단계
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          할인 쿠폰 제공
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          가입 후 3일 내
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                        <Typography variant="h6" color="warning.main">
                          3단계
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          서비스 추천
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          가입 후 1주일 내
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                        <Typography variant="h6" color="info.main">
                          4단계
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          재방문 유도
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          첫 이용 후 1개월
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      💡 마케팅 팁
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 신규 고객이므로 첫 경험이 중요합니다<br/>
                      • 명확하고 간단한 혜택을 제공하세요<br/>
                      • 개인화된 서비스 추천으로 관심을 끄세요<br/>
                      • 정기적인 소통을 통해 브랜드 인지도를 높이세요
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default UserDetail;
