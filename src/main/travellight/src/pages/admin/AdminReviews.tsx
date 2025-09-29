import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Rating,
  Pagination,
  Avatar,
  Badge,
  CircularProgress,
  InputAdornment,
  Stack,
  Grid,
  ThemeProvider,
  createTheme,
  Checkbox,
  Toolbar
} from '@mui/material';
import {
  Visibility,
  Reply,
  Block,
  Warning,
  TrendingUp,
  Assessment,
  Search,
  Refresh,
  Delete,
  Flag
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ReviewResponse, reviewService } from '../../services/api';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// ERP 색상 정의 (AdminUsers와 동일)
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
  accentSecondary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
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
    divider: COLORS.borderPrimary,
    primary: {
      main: COLORS.accentPrimary,
    },
    secondary: {
      main: COLORS.accentSecondary,
    },
    success: {
      main: COLORS.success,
    },
    warning: {
      main: COLORS.warning,
    },
    error: {
      main: COLORS.danger,
    },
    info: {
      main: COLORS.info,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.backgroundCard,
          backgroundImage: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: COLORS.borderPrimary,
        },
      },
    },
  },
});

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const AdminReviews: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [highReportReviews, setHighReportReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewResponse | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [adminReply, setAdminReply] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    reportedReviews: 0,
    averageRating: 0
  });
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    loadData();
  }, [tabValue, currentPage]);

  useEffect(() => {
    // 5초마다 자동 새로고침
    const interval = setInterval(() => {
      if (!loading) {
        loadData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [tabValue, currentPage, loading]);

  const loadData = () => {
    if (tabValue === 0) {
      fetchRecentReviews();
    } else if (tabValue === 1) {
      fetchHighReportReviews();
    }
    fetchReviewStats();
  };

  const fetchRecentReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getRecentReviews(currentPage - 1, 20);
      setReviews(response.data.content);
      setTotalPages(response.data.totalPages);
      setAlertMessage(null);
    } catch (error) {
      console.error('최근 리뷰 조회 실패:', error);
      setAlertMessage({type: 'error', message: '리뷰 목록을 불러오는데 실패했습니다.'});
    } finally {
      setLoading(false);
    }
  };

  const fetchHighReportReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getHighReportReviews(3);
      setHighReportReviews(response.data);
      setAlertMessage(null);
    } catch (error) {
      console.error('신고 리뷰 조회 실패:', error);
      setAlertMessage({type: 'error', message: '신고된 리뷰를 불러오는데 실패했습니다.'});
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      // 통계 계산 (실제로는 별도 API가 있을 수 있음)
      const recentResponse = await reviewService.getRecentReviews(0, 1000);
      const reportedResponse = await reviewService.getHighReportReviews(1);
      
      const totalReviews = recentResponse.data.totalElements;
      const reportedReviews = reportedResponse.data.length;
      
      // 평균 평점 계산
      const avgRating = recentResponse.data.content.length > 0 
        ? recentResponse.data.content.reduce((sum, review) => sum + review.rating, 0) / recentResponse.data.content.length
        : 0;

      setReviewStats({
        totalReviews,
        reportedReviews,
        averageRating: Math.round(avgRating * 10) / 10
      });
    } catch (error) {
      console.error('리뷰 통계 조회 실패:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setCurrentPage(1);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setCurrentPage(1);
    loadData();
  };

  const handleViewReview = (review: ReviewResponse) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
  };

  const handleReplyReview = (review: ReviewResponse) => {
    setSelectedReview(review);
    setAdminReply(review.adminReply || '');
    setReplyDialogOpen(true);
  };

  const handleChangeStatus = (review: ReviewResponse) => {
    setSelectedReview(review);
    setNewStatus(review.status);
    setStatusDialogOpen(true);
  };

  const submitAdminReply = async () => {
    if (!selectedReview || !adminReply.trim()) return;

    try {
      await reviewService.addAdminReply(selectedReview.id, adminReply);
      loadData();
      setReplyDialogOpen(false);
      setAdminReply('');
      setAlertMessage({type: 'success', message: '관리자 답변이 추가되었습니다.'});
    } catch (error) {
      console.error('관리자 답변 추가 실패:', error);
      setAlertMessage({type: 'error', message: '답변 추가에 실패했습니다.'});
    }
  };

  const submitStatusChange = async () => {
    if (!selectedReview || !newStatus) return;

    try {
      await reviewService.updateReviewStatus(selectedReview.id, newStatus);
      loadData();
      setStatusDialogOpen(false);
      setAlertMessage({type: 'success', message: '리뷰 상태가 변경되었습니다.'});
    } catch (error) {
      console.error('리뷰 상태 변경 실패:', error);
      setAlertMessage({type: 'error', message: '상태 변경에 실패했습니다.'});
    }
  };

  const filteredReviews = reviews.filter(review => 
    review.placeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (review.title && review.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (review.content && review.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredHighReportReviews = highReportReviews.filter(review => 
    review.placeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (review.title && review.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(filteredReviews.map(review => review.id));
    } else {
      setSelectedReviews([]);
    }
  };

  const handleSelectReview = (reviewId: number) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setBulkActionDialogOpen(true);
  };

  const submitBulkAction = async () => {
    if (!bulkAction || selectedReviews.length === 0) return;

    try {
      // 일괄 처리를 위해 순차적으로 API 호출
      for (const reviewId of selectedReviews) {
        await reviewService.updateReviewStatus(reviewId, bulkAction);
      }
      
      setSelectedReviews([]);
      setBulkActionDialogOpen(false);
      loadData();
      setAlertMessage({
        type: 'success', 
        message: `${selectedReviews.length}개 리뷰의 상태가 ${bulkAction}(으)로 변경되었습니다.`
      });
    } catch (error) {
      console.error('일괄 상태 변경 실패:', error);
      setAlertMessage({type: 'error', message: '일괄 처리 중 오류가 발생했습니다.'});
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig: { [key: string]: { label: string; color: any } } = {
      'ACTIVE': { label: '활성', color: 'success' },
      'HIDDEN': { label: '숨김', color: 'warning' },
      'DELETED': { label: '삭제', color: 'error' },
      'PENDING': { label: '대기', color: 'default' }
    };

    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ 
        bgcolor: COLORS.backgroundDark, 
        minHeight: '100vh',
        color: COLORS.textPrimary,
        p: 3
      }}>
        {/* 헤더 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          pb: 2,
          borderBottom: `1px solid ${COLORS.borderPrimary}`
        }}>
          <Typography variant="h4" sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>
            리뷰 관리
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="리뷰 검색..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: COLORS.textSecondary }} />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: COLORS.backgroundCard,
                  color: COLORS.textPrimary,
                  borderRadius: 1,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: COLORS.borderPrimary,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: COLORS.accentPrimary,
                  },
                }
              }}
            />
            <Button
              variant="outlined"
              onClick={handleRefresh}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
              sx={{
                borderColor: COLORS.borderSecondary,
                color: COLORS.textPrimary,
                '&:hover': {
                  borderColor: COLORS.accentPrimary,
                  bgcolor: COLORS.backgroundHover,
                }
              }}
            >
              새로고침
            </Button>
          </Stack>
        </Box>

        {/* 알림 메시지 */}
        {alertMessage && (
          <Alert 
            severity={alertMessage.type} 
            sx={{ mb: 3 }}
            onClose={() => setAlertMessage(null)}
          >
            {alertMessage.message}
          </Alert>
        )}

        {/* 상단 통계 카드 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 2
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: `${COLORS.accentPrimary}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Assessment sx={{ color: COLORS.accentPrimary, fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                      총 리뷰
                    </Typography>
                    <Typography variant="h4" sx={{ color: COLORS.textPrimary, fontWeight: 700 }}>
                      {reviewStats.totalReviews.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 2
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: `${COLORS.warning}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Flag sx={{ color: COLORS.warning, fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                      신고된 리뷰
                    </Typography>
                    <Typography variant="h4" sx={{ color: COLORS.warning, fontWeight: 700 }}>
                      {reviewStats.reportedReviews.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 2
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: `${COLORS.success}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TrendingUp sx={{ color: COLORS.success, fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                      평균 평점
                    </Typography>
                    <Typography variant="h4" sx={{ color: COLORS.success, fontWeight: 700 }}>
                      {reviewStats.averageRating || '0.0'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 탭 메뉴 */}
        <Paper sx={{ 
          bgcolor: COLORS.backgroundCard,
          border: `1px solid ${COLORS.borderPrimary}`,
          borderRadius: 2,
          mb: 3
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: COLORS.textSecondary,
                fontWeight: 500,
                '&.Mui-selected': {
                  color: COLORS.accentPrimary,
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: COLORS.accentPrimary,
              }
            }}
          >
            <Tab label="최근 리뷰" />
            <Tab label="신고된 리뷰" />
            <Tab label="리뷰 통계" />
          </Tabs>
        </Paper>

        {/* 최근 리뷰 탭 */}
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* 일괄 액션 툴바 */}
              {selectedReviews.length > 0 && (
                <Paper sx={{ 
                  bgcolor: COLORS.backgroundCard,
                  border: `1px solid ${COLORS.borderPrimary}`,
                  borderRadius: 2,
                  mb: 2
                }}>
                  <Toolbar sx={{ 
                    bgcolor: `${COLORS.accentPrimary}20`,
                    borderRadius: 2,
                    minHeight: '64px !important'
                  }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        color: COLORS.textPrimary, 
                        flex: 1,
                        fontWeight: 600
                      }}
                    >
                      {selectedReviews.length}개 리뷰 선택됨
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleBulkAction('HIDDEN')}
                        sx={{
                          borderColor: COLORS.warning,
                          color: COLORS.warning,
                          '&:hover': { bgcolor: `${COLORS.warning}20` }
                        }}
                      >
                        숨김
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleBulkAction('ACTIVE')}
                        sx={{
                          borderColor: COLORS.success,
                          color: COLORS.success,
                          '&:hover': { bgcolor: `${COLORS.success}20` }
                        }}
                      >
                        활성화
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleBulkAction('DELETED')}
                        sx={{
                          borderColor: COLORS.danger,
                          color: COLORS.danger,
                          '&:hover': { bgcolor: `${COLORS.danger}20` }
                        }}
                      >
                        삭제
                      </Button>
                    </Stack>
                  </Toolbar>
                </Paper>
              )}

              <TableContainer component={Paper} sx={{ 
                bgcolor: COLORS.backgroundCard,
                border: `1px solid ${COLORS.borderPrimary}`,
                borderRadius: 2
              }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: COLORS.backgroundSurface }}>
                      <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600, width: 50 }}>
                        <Checkbox
                          checked={selectedReviews.length === filteredReviews.length && filteredReviews.length > 0}
                          indeterminate={selectedReviews.length > 0 && selectedReviews.length < filteredReviews.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          sx={{
                            color: COLORS.textSecondary,
                            '&.Mui-checked': {
                              color: COLORS.accentPrimary,
                            },
                            '&.MuiCheckbox-indeterminate': {
                              color: COLORS.accentPrimary,
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>작성자</TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>제휴점</TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>평점</TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>제목/내용</TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>상태</TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>작성일</TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>액션</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReviews.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4, color: COLORS.textSecondary }}>
                          리뷰가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReviews.map((review) => (
                        <TableRow 
                          key={review.id}
                          onClick={(e) => {
                            // 체크박스나 액션 버튼 클릭 시에는 상세보기 열지 않음
                            const target = e.target as HTMLElement;
                            if (
                              target.closest('.MuiCheckbox-root') ||
                              target.closest('.MuiIconButton-root') ||
                              target.closest('.MuiButton-root')
                            ) {
                              return;
                            }
                            handleViewReview(review);
                          }}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: COLORS.backgroundHover,
                              cursor: 'pointer'
                            },
                            borderBottom: `1px solid ${COLORS.borderPrimary}`,
                            bgcolor: selectedReviews.includes(review.id) ? COLORS.backgroundSelected : 'transparent'
                          }}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedReviews.includes(review.id)}
                              onChange={() => handleSelectReview(review.id)}
                              sx={{
                                color: COLORS.textSecondary,
                                '&.Mui-checked': {
                                  color: COLORS.accentPrimary,
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ 
                                width: 36, 
                                height: 36,
                                bgcolor: COLORS.accentPrimary,
                                fontSize: '0.875rem'
                              }}>
                                {review.user.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                                  {review.user.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                                  {(review.user as any).email || `ID: ${review.user.id}`}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                                {review.placeName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                                {review.placeAddress}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating value={review.rating} readOnly size="small" />
                              <Typography variant="body2" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                                {review.rating}.0
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: COLORS.textPrimary, 
                                  fontWeight: 500,
                                  mb: 0.5
                                }}
                              >
                                {review.title || '제목 없음'}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: COLORS.textSecondary,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {review.content || '내용 없음'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {getStatusChip(review.status)}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                              {formatDateTime(review.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewReview(review)}
                                sx={{ 
                                  color: COLORS.textSecondary,
                                  '&:hover': { 
                                    color: COLORS.accentPrimary,
                                    bgcolor: COLORS.backgroundHover
                                  }
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleReplyReview(review)}
                                sx={{ 
                                  color: COLORS.textSecondary,
                                  '&:hover': { 
                                    color: COLORS.info,
                                    bgcolor: COLORS.backgroundHover
                                  }
                                }}
                              >
                                <Reply fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleChangeStatus(review)}
                                sx={{ 
                                  color: COLORS.textSecondary,
                                  '&:hover': { 
                                    color: COLORS.warning,
                                    bgcolor: COLORS.backgroundHover
                                  }
                                }}
                              >
                                <Block fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => setCurrentPage(page)}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: COLORS.textSecondary,
                        '&.Mui-selected': {
                          bgcolor: COLORS.accentPrimary,
                          color: 'white'
                        }
                      }
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </TabPanel>

        {/* 신고된 리뷰 탭 */}
        <TabPanel value={tabValue} index={1}>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              bgcolor: `${COLORS.info}20`,
              color: COLORS.textPrimary,
              border: `1px solid ${COLORS.info}40`
            }}
          >
            신고 횟수가 3회 이상인 리뷰를 표시합니다.
          </Alert>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredHighReportReviews.length === 0 ? (
            <Paper sx={{ 
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 2,
              p: 4,
              textAlign: 'center'
            }}>
              <Typography variant="body1" sx={{ color: COLORS.textSecondary }}>
                신고된 리뷰가 없습니다.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ 
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 2
            }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: COLORS.backgroundSurface }}>
                    <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>작성자</TableCell>
                    <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>제휴점</TableCell>
                    <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>평점</TableCell>
                    <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>신고 횟수</TableCell>
                    <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>상태</TableCell>
                    <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>작성일</TableCell>
                    <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>액션</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHighReportReviews.map((review) => (
                    <TableRow 
                      key={review.id}
                      onClick={(e) => {
                        // 액션 버튼 클릭 시에는 상세보기 열지 않음
                        const target = e.target as HTMLElement;
                        if (
                          target.closest('.MuiIconButton-root') ||
                          target.closest('.MuiButton-root')
                        ) {
                          return;
                        }
                        handleViewReview(review);
                      }}
                      sx={{ 
                        '&:hover': { 
                          bgcolor: COLORS.backgroundHover,
                          cursor: 'pointer'
                        },
                        borderBottom: `1px solid ${COLORS.borderPrimary}`
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Badge
                            badgeContent={<Flag sx={{ fontSize: 12 }} />}
                            color="error"
                            overlap="circular"
                          >
                            <Avatar sx={{ 
                              width: 36, 
                              height: 36,
                              bgcolor: COLORS.danger,
                              fontSize: '0.875rem'
                            }}>
                              {review.user.name.charAt(0)}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="body2" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                              {review.user.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                              {(review.user as any).email || `ID: ${review.user.id}`}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                            {review.placeName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                            {review.placeAddress}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={review.rating} readOnly size="small" />
                          <Typography variant="body2" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                            {review.rating}.0
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${review.reportCount || 3}회`}
                          color="error" 
                          size="small"
                          icon={<Warning />}
                        />
                      </TableCell>
                      <TableCell>
                        {getStatusChip(review.status)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                          {formatDateTime(review.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewReview(review)}
                            sx={{ 
                              color: COLORS.textSecondary,
                              '&:hover': { 
                                color: COLORS.accentPrimary,
                                bgcolor: COLORS.backgroundHover
                              }
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleChangeStatus(review)}
                            sx={{ 
                              color: COLORS.textSecondary,
                              '&:hover': { 
                                color: COLORS.danger,
                                bgcolor: COLORS.backgroundHover
                              }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* 리뷰 통계 탭 */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                bgcolor: COLORS.backgroundCard,
                border: `1px solid ${COLORS.borderPrimary}`,
                borderRadius: 2,
                p: 3
              }}>
                <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 2 }}>
                  평점 분포
                </Typography>
                <Box sx={{ space: 1 }}>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <Box key={rating} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Rating value={rating} readOnly size="small" max={1} />
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, minWidth: 20 }}>
                        {rating}
                      </Typography>
                      <Box sx={{ 
                        flex: 1, 
                        height: 8, 
                        bgcolor: COLORS.backgroundSurface, 
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: `${Math.random() * 80 + 10}%`, 
                          height: '100%', 
                          bgcolor: COLORS.accentPrimary 
                        }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, minWidth: 40 }}>
                        {Math.floor(Math.random() * 100) + 1}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                bgcolor: COLORS.backgroundCard,
                border: `1px solid ${COLORS.borderPrimary}`,
                borderRadius: 2,
                p: 3
              }}>
                <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 2 }}>
                  월별 리뷰 추이
                </Typography>
                <Box sx={{ 
                  height: 200, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: COLORS.textSecondary
                }}>
                  차트 영역 (추후 구현)
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ 
                bgcolor: COLORS.backgroundCard,
                border: `1px solid ${COLORS.borderPrimary}`,
                borderRadius: 2,
                p: 3
              }}>
                <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 2 }}>
                  상위 평점 제휴점
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>순위</TableCell>
                        <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>제휴점명</TableCell>
                        <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>평균 평점</TableCell>
                        <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>리뷰 수</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[1, 2, 3, 4, 5].map((rank) => (
                        <TableRow key={rank}>
                          <TableCell sx={{ color: COLORS.textPrimary }}>#{rank}</TableCell>
                          <TableCell sx={{ color: COLORS.textPrimary }}>샘플 제휴점 {rank}</TableCell>
                          <TableCell sx={{ color: COLORS.textPrimary }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating value={4 + Math.random()} readOnly size="small" />
                              <Typography variant="body2">
                                {(4 + Math.random()).toFixed(1)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: COLORS.textPrimary }}>
                            {Math.floor(Math.random() * 50) + 10}개
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 리뷰 상세보기 다이얼로그 */}
        <Dialog 
          open={viewDialogOpen} 
          onClose={() => setViewDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
            }
          }}
        >
          <DialogTitle sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
            리뷰 상세보기
          </DialogTitle>
          <DialogContent sx={{ color: COLORS.textPrimary }}>
            {selectedReview && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: COLORS.accentPrimary }}>
                        {selectedReview.user.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ color: COLORS.textPrimary }}>
                          {selectedReview.user.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                          {(selectedReview.user as any).email || `ID: ${selectedReview.user.id}`}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        {getStatusChip(selectedReview.status)}
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                      제휴점
                    </Typography>
                    <Typography variant="body1" sx={{ color: COLORS.textPrimary, mb: 2 }}>
                      {selectedReview.placeName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                      {selectedReview.placeAddress}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                      평점
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={selectedReview.rating} readOnly />
                      <Typography variant="h6" sx={{ color: COLORS.textPrimary }}>
                        {selectedReview.rating}.0
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                      작성일
                    </Typography>
                    <Typography variant="body1" sx={{ color: COLORS.textPrimary }}>
                      {formatDateTime(selectedReview.createdAt)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                      제목
                    </Typography>
                    <Typography variant="body1" sx={{ color: COLORS.textPrimary, mb: 2 }}>
                      {selectedReview.title || '제목 없음'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                      내용
                    </Typography>
                    <Paper sx={{ 
                      p: 2, 
                      bgcolor: COLORS.backgroundSurface,
                      border: `1px solid ${COLORS.borderPrimary}`
                    }}>
                      <Typography variant="body1" sx={{ color: COLORS.textPrimary }}>
                        {selectedReview.content || '내용 없음'}
                      </Typography>
                    </Paper>
                  </Grid>

                  {selectedReview.adminReply && (
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                        관리자 답변
                      </Typography>
                      <Paper sx={{ 
                        p: 2, 
                        bgcolor: `${COLORS.accentPrimary}20`,
                        border: `1px solid ${COLORS.accentPrimary}40`
                      }}>
                        <Typography variant="body1" sx={{ color: COLORS.textPrimary }}>
                          {selectedReview.adminReply}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ borderTop: `1px solid ${COLORS.borderPrimary}`, p: 2 }}>
            <Button 
              onClick={() => setViewDialogOpen(false)}
              sx={{ color: COLORS.textSecondary }}
            >
              닫기
            </Button>
            {selectedReview && (
              <>
                <Button 
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleReplyReview(selectedReview);
                  }}
                  variant="outlined"
                  sx={{ 
                    borderColor: COLORS.accentPrimary,
                    color: COLORS.accentPrimary
                  }}
                >
                  답변 작성
                </Button>
                <Button 
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleChangeStatus(selectedReview);
                  }}
                  variant="contained"
                  sx={{ bgcolor: COLORS.accentPrimary }}
                >
                  상태 변경
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* 관리자 답변 다이얼로그 */}
        <Dialog 
          open={replyDialogOpen} 
          onClose={() => setReplyDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
            }
          }}
        >
          <DialogTitle sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
            관리자 답변
          </DialogTitle>
          <DialogContent sx={{ color: COLORS.textPrimary }}>
            {selectedReview && (
              <Box sx={{ mb: 3, mt: 2 }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                  원본 리뷰:
                </Typography>
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: COLORS.backgroundSurface,
                  border: `1px solid ${COLORS.borderPrimary}`,
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>
                    {selectedReview.content || '내용 없음'}
                  </Typography>
                </Paper>
              </Box>
            )}
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="관리자 답변"
              value={adminReply}
              onChange={(e) => setAdminReply(e.target.value)}
              placeholder="고객에게 전달할 답변을 작성해주세요."
              InputProps={{
                sx: {
                  bgcolor: COLORS.backgroundSurface,
                  color: COLORS.textPrimary,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: COLORS.borderPrimary,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: COLORS.accentPrimary,
                  },
                }
              }}
              InputLabelProps={{
                sx: { color: COLORS.textSecondary }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ borderTop: `1px solid ${COLORS.borderPrimary}`, p: 2 }}>
            <Button 
              onClick={() => setReplyDialogOpen(false)}
              sx={{ color: COLORS.textSecondary }}
            >
              취소
            </Button>
            <Button 
              onClick={submitAdminReply} 
              variant="contained" 
              disabled={!adminReply.trim()}
              sx={{ bgcolor: COLORS.accentPrimary }}
            >
              답변 등록
            </Button>
          </DialogActions>
        </Dialog>

        {/* 상태 변경 다이얼로그 */}
        <Dialog 
          open={statusDialogOpen} 
          onClose={() => setStatusDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
              minWidth: 400,
            }
          }}
        >
          <DialogTitle sx={{ 
            color: COLORS.textPrimary, 
            borderBottom: `1px solid ${COLORS.borderPrimary}`,
            fontSize: '1.25rem',
            fontWeight: 600,
            pb: 2
          }}>
            리뷰 상태 변경
          </DialogTitle>
          <DialogContent sx={{ color: COLORS.textPrimary, pt: 3, pb: 3 }}>
            {selectedReview && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                  변경할 리뷰:
                </Typography>
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: COLORS.backgroundSurface,
                  border: `1px solid ${COLORS.borderPrimary}`,
                  borderRadius: 1 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: COLORS.accentPrimary, fontSize: '0.75rem' }}>
                      {selectedReview.user.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                        {selectedReview.user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                        {selectedReview.placeName}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                      <Rating value={selectedReview.rating} readOnly size="small" />
                    </Box>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: COLORS.textPrimary,
                      mt: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {selectedReview.title && `${selectedReview.title} - `}
                    {selectedReview.content || '내용 없음'}
                  </Typography>
                </Paper>
              </Box>
            )}

            <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 2 }}>
              새로운 상태를 선택해주세요:
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel sx={{ 
                color: COLORS.textSecondary,
                fontSize: '1rem'
              }}>
                새 상태
              </InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="새 상태"
                sx={{
                  bgcolor: COLORS.backgroundSurface,
                  color: COLORS.textPrimary,
                  fontSize: '1rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: COLORS.borderPrimary,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: COLORS.accentPrimary,
                  },
                  '& .MuiSelect-select': {
                    py: 1.5,
                  }
                }}
              >
                <MenuItem value="ACTIVE" sx={{ fontSize: '1rem', py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip label="활성" color="success" size="small" />
                    <Typography>활성 - 공개 상태로 표시됩니다</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="HIDDEN" sx={{ fontSize: '1rem', py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip label="숨김" color="warning" size="small" />
                    <Typography>숨김 - 일시적으로 비공개 처리됩니다</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="DELETED" sx={{ fontSize: '1rem', py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip label="삭제" color="error" size="small" />
                    <Typography>삭제 - 완전히 삭제됩니다</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="PENDING" sx={{ fontSize: '1rem', py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip label="대기" color="default" size="small" />
                    <Typography>대기 - 검토 대기 상태입니다</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {newStatus === 'DELETED' && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mt: 2,
                  bgcolor: `${COLORS.danger}20`,
                  color: COLORS.textPrimary,
                  border: `1px solid ${COLORS.danger}40`,
                  '& .MuiAlert-icon': {
                    color: COLORS.danger
                  }
                }}
              >
                <Typography variant="body2">
                  <strong>주의:</strong> 삭제된 리뷰는 복구할 수 없습니다.
                </Typography>
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            borderTop: `1px solid ${COLORS.borderPrimary}`, 
            p: 3,
            gap: 1
          }}>
            <Button 
              onClick={() => setStatusDialogOpen(false)}
              sx={{ 
                color: COLORS.textSecondary,
                px: 3,
                py: 1
              }}
            >
              취소
            </Button>
            <Button 
              onClick={submitStatusChange} 
              variant="contained" 
              disabled={!newStatus}
              sx={{ 
                bgcolor: newStatus === 'DELETED' ? COLORS.danger : COLORS.accentPrimary,
                px: 3,
                py: 1,
                fontWeight: 600,
                '&:hover': {
                  bgcolor: newStatus === 'DELETED' ? `${COLORS.danger}dd` : `${COLORS.accentPrimary}dd`
                }
              }}
            >
              {newStatus === 'DELETED' ? '삭제하기' : '상태 변경'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 일괄 액션 확인 다이얼로그 */}
        <Dialog 
          open={bulkActionDialogOpen} 
          onClose={() => setBulkActionDialogOpen(false)}
          PaperProps={{
            sx: {
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
            }
          }}
        >
          <DialogTitle sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
            일괄 처리 확인
          </DialogTitle>
          <DialogContent sx={{ color: COLORS.textPrimary, pt: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              선택된 <strong>{selectedReviews.length}개</strong>의 리뷰를 
              <strong> {bulkAction === 'ACTIVE' ? '활성' : bulkAction === 'HIDDEN' ? '숨김' : '삭제'}</strong> 
              상태로 변경하시겠습니까?
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
              이 작업은 되돌릴 수 없습니다.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ borderTop: `1px solid ${COLORS.borderPrimary}`, p: 2 }}>
            <Button 
              onClick={() => setBulkActionDialogOpen(false)}
              sx={{ color: COLORS.textSecondary }}
            >
              취소
            </Button>
            <Button 
              onClick={submitBulkAction} 
              variant="contained" 
              sx={{ 
                bgcolor: bulkAction === 'DELETED' ? COLORS.danger : COLORS.accentPrimary,
                '&:hover': {
                  bgcolor: bulkAction === 'DELETED' ? `${COLORS.danger}dd` : `${COLORS.accentPrimary}dd`
                }
              }}
            >
              확인
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default AdminReviews;
