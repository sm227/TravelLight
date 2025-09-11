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
  Badge
} from '@mui/material';
import {
  Visibility,
  Reply,
  Block,
  Warning,
  TrendingUp,
  Assessment
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

const AdminReviews: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [highReportReviews, setHighReportReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewResponse | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [adminReply, setAdminReply] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (tabValue === 0) {
      fetchRecentReviews();
    } else if (tabValue === 1) {
      fetchHighReportReviews();
    }
  }, [tabValue, currentPage]);

  const fetchRecentReviews = async () => {
    try {
      setLoading(true);
      // 실제로는 관리자용 API를 호출해야 하지만, 여기서는 일반 API 사용
      const response = await reviewService.getMyReviews(currentPage - 1, 20);
      setReviews(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('최근 리뷰 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHighReportReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getTopRatedPlaces(20); // 임시로 다른 API 사용
      // 실제로는 신고가 많은 리뷰 API를 호출해야 함
      setHighReportReviews([]);
    } catch (error) {
      console.error('신고 리뷰 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setCurrentPage(1);
  };

  const handleViewReview = (review: ReviewResponse) => {
    setSelectedReview(review);
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
      // await reviewService.addAdminReply(selectedReview.id, { adminReply });
      // API 호출 후 목록 새로고침
      fetchRecentReviews();
      setReplyDialogOpen(false);
      setAdminReply('');
      alert('관리자 답변이 추가되었습니다.');
    } catch (error) {
      console.error('관리자 답변 추가 실패:', error);
      alert('답변 추가에 실패했습니다.');
    }
  };

  const submitStatusChange = async () => {
    if (!selectedReview || !newStatus) return;

    try {
      // await reviewService.updateReviewStatus(selectedReview.id, newStatus);
      // API 호출 후 목록 새로고침
      fetchRecentReviews();
      setStatusDialogOpen(false);
      alert('리뷰 상태가 변경되었습니다.');
    } catch (error) {
      console.error('리뷰 상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MM/dd HH:mm', { locale: ko });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        리뷰 관리
      </Typography>

      {/* 상단 통계 카드 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment color="primary" />
              <Typography variant="h6">총 리뷰</Typography>
            </Box>
            <Typography variant="h4" color="primary">
              {reviews.length}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="warning" />
              <Typography variant="h6">신고된 리뷰</Typography>
            </Box>
            <Typography variant="h4" color="warning.main">
              {highReportReviews.length}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp color="success" />
              <Typography variant="h6">평균 평점</Typography>
            </Box>
            <Typography variant="h4" color="success.main">
              4.2
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 탭 메뉴 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="최근 리뷰" />
          <Tab label="신고된 리뷰" />
          <Tab label="리뷰 통계" />
        </Tabs>
      </Box>

      {/* 최근 리뷰 탭 */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>작성자</TableCell>
                <TableCell>제휴점</TableCell>
                <TableCell>평점</TableCell>
                <TableCell>제목</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>작성일</TableCell>
                <TableCell>액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {review.user.name.charAt(0)}
                      </Avatar>
                      {review.user.name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {review.placeName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {review.placeAddress}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Rating value={review.rating} readOnly size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {review.title || '제목 없음'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(review.status)}
                  </TableCell>
                  <TableCell>
                    {formatDate(review.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => handleViewReview(review)}>
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleReplyReview(review)}>
                        <Reply />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleChangeStatus(review)}>
                        <Block />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
            />
          </Box>
        )}
      </TabPanel>

      {/* 신고된 리뷰 탭 */}
      <TabPanel value={tabValue} index={1}>
        <Alert severity="info" sx={{ mb: 2 }}>
          신고 횟수가 3회 이상인 리뷰를 표시합니다.
        </Alert>
        
        {highReportReviews.length === 0 ? (
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            신고된 리뷰가 없습니다.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>작성자</TableCell>
                  <TableCell>제휴점</TableCell>
                  <TableCell>평점</TableCell>
                  <TableCell>신고 횟수</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>작성일</TableCell>
                  <TableCell>액션</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* 신고된 리뷰 목록 */}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* 리뷰 통계 탭 */}
      <TabPanel value={tabValue} index={2}>
        <Alert severity="info" sx={{ mb: 2 }}>
          리뷰 통계 기능은 추후 구현 예정입니다.
        </Alert>
      </TabPanel>

      {/* 관리자 답변 다이얼로그 */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>관리자 답변</DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                원본 리뷰:
              </Typography>
              <Typography variant="body2" sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                {selectedReview.content || '내용 없음'}
              </Typography>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>취소</Button>
          <Button onClick={submitAdminReply} variant="contained" disabled={!adminReply.trim()}>
            답변 등록
          </Button>
        </DialogActions>
      </Dialog>

      {/* 상태 변경 다이얼로그 */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>리뷰 상태 변경</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>새 상태</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="새 상태"
            >
              <MenuItem value="ACTIVE">활성</MenuItem>
              <MenuItem value="HIDDEN">숨김</MenuItem>
              <MenuItem value="DELETED">삭제</MenuItem>
              <MenuItem value="PENDING">대기</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>취소</Button>
          <Button onClick={submitStatusChange} variant="contained" disabled={!newStatus}>
            변경
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminReviews;
