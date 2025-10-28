import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Grid,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Search,
  Visibility,
  Refresh,
  FilterList,
  LocalShipping
} from '@mui/icons-material';
import { getAllReservations } from '../../services/reservationService';
import { ReservationDto } from '../../types/reservation';
import { partnershipService } from '../../services/api';

// 샘플 주문 데이터 (백업용)
const sampleOrders = [
  { 
    id: 'ORD-2023-001', 
    customer: '김민준', 
    email: 'kim@example.com', 
    date: '2023-07-15 14:30', 
    status: '배송 완료', 
    items: 3, 
    amount: '52,000', 
    paymentMethod: '신용카드' 
  },
  { 
    id: 'ORD-2023-002', 
    customer: '이지현', 
    email: 'lee@example.com', 
    date: '2023-07-15 11:15', 
    status: '결제 완료', 
    items: 2, 
    amount: '38,500', 
    paymentMethod: '계좌이체' 
  },
  { 
    id: 'ORD-2023-003', 
    customer: '박서준', 
    email: 'park@example.com', 
    date: '2023-07-14 16:45', 
    status: '배송 중', 
    items: 5, 
    amount: '125,000', 
    paymentMethod: '신용카드' 
  },
  { 
    id: 'ORD-2023-004', 
    customer: '정하은', 
    email: 'jung@example.com', 
    date: '2023-07-14 09:20', 
    status: '주문 접수', 
    items: 4, 
    amount: '76,300', 
    paymentMethod: '카카오페이' 
  },
  { 
    id: 'ORD-2023-005', 
    customer: '최예은', 
    email: 'choi@example.com', 
    date: '2023-07-13 13:10', 
    status: '배송 완료', 
    items: 1, 
    amount: '45,900', 
    paymentMethod: '신용카드' 
  },
  { 
    id: 'ORD-2023-006', 
    customer: '강지원', 
    email: 'kang@example.com', 
    date: '2023-07-12 18:40', 
    status: '배송 중', 
    items: 2, 
    amount: '32,500', 
    paymentMethod: '네이버페이' 
  },
  { 
    id: 'ORD-2023-007', 
    customer: '윤서연', 
    email: 'yoon@example.com', 
    date: '2023-07-10 10:55', 
    status: '배송 완료', 
    items: 3, 
    amount: '67,800', 
    paymentMethod: '신용카드' 
  },
  { 
    id: 'ORD-2023-008', 
    customer: '장민서', 
    email: 'jang@example.com', 
    date: '2023-07-09 15:25', 
    status: '배송 완료', 
    items: 6, 
    amount: '98,500', 
    paymentMethod: '카카오페이' 
  },
  { 
    id: 'ORD-2023-009', 
    customer: '한지민', 
    email: 'han@example.com', 
    date: '2023-07-08 14:20', 
    status: '배송 완료', 
    items: 2, 
    amount: '29,800', 
    paymentMethod: '신용카드' 
  },
  { 
    id: 'ORD-2023-010', 
    customer: '오준호', 
    email: 'oh@example.com', 
    date: '2023-07-07 12:40', 
    status: '주문 취소', 
    items: 1, 
    amount: '15,000', 
    paymentMethod: '계좌이체' 
  },
];

const AdminOrders = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [openOrderDetail, setOpenOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ReservationDto | null>(null);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 예약 데이터 로드
  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await getAllReservations();
      setReservations(data);
    } catch (error) {
      console.error('예약 데이터 로드 실패:', error);
      setAlertMessage({type: 'error', message: '예약 데이터를 불러오는데 실패했습니다.'});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const filteredOrders = reservations.filter(reservation => {
    const matchesSearch = 
      (reservation.reservationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (reservation.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (reservation.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (reservation.placeName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    if (statusFilter && reservation.status !== statusFilter) {
      return false;
    }
    
    return matchesSearch;
  });

  const handleRefresh = () => {
    loadReservations();
    setSearchTerm('');
    setStatusFilter('');
    setPage(0);
    setAlertMessage({type: 'success', message: '예약 목록이 새로고침되었습니다.'});
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setOpenOrderDetail(true);
  };

  const handleCloseOrderDetail = () => {
    setOpenOrderDetail(false);
    setSelectedOrder(null);
  };

  // 예약 상태에 따른 색상 반환 함수
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'RESERVED':
        return 'primary';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  // 상태 한글 표시
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '완료';
      case 'RESERVED':
        return '예약중';
      case 'CANCELLED':
        return '취소';
      default:
        return status;
    }
  };

  // 날짜 포맷
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR');
  };

  // 회원 이름 클릭 핸들러
  const handleUserClick = (userId?: number) => {
    if (userId) {
      navigate(`/admin/users/${userId}`);
    }
  };

  // 매장 이름 클릭 핸들러
  const handleStoreClick = async (placeName: string, placeAddress: string) => {
    try {
      // 모든 제휴점 목록 가져오기
      const response = await partnershipService.getAllPartnerships();
      if (response.success && response.data) {
        // placeName과 placeAddress로 제휴점 찾기
        const matchingPartnership = response.data.find((p: any) => {
          // 정확히 일치하거나 유사한 경우
          return p.businessName === placeName || 
                 p.address === placeAddress ||
                 p.businessName.includes(placeName) ||
                 placeName.includes(p.businessName);
        });
        
        if (matchingPartnership) {
          // 제휴점 상세 페이지로 이동
          navigate(`/admin/partnerships/${matchingPartnership.id}`);
        } else {
          setAlertMessage({ type: 'error', message: '해당 매장의 제휴점 정보를 찾을 수 없습니다.' });
        }
      }
    } catch (error) {
      console.error('제휴점 정보 조회 실패:', error);
      setAlertMessage({ type: 'error', message: '제휴점 정보를 불러오는데 실패했습니다.' });
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        예약 관리
      </Typography>

      {alertMessage && (
        <Alert 
          severity={alertMessage.type} 
          sx={{ mb: 2 }}
          onClose={() => setAlertMessage(null)}
        >
          {alertMessage.message}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }} elevation={3}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            placeholder="예약번호, 고객명, 이메일, 매장명으로 검색"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="status-filter-label">예약 상태</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="예약 상태"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="RESERVED">예약중</MenuItem>
              <MenuItem value="COMPLETED">완료</MenuItem>
              <MenuItem value="CANCELLED">취소</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={handleRefresh} color="primary">
            <Refresh />
          </IconButton>
          <IconButton color="primary">
            <FilterList />
          </IconButton>
        </Stack>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="예약 테이블">
            <TableHead>
              <TableRow>
                <TableCell>예약번호</TableCell>
                <TableCell>고객명</TableCell>
                <TableCell>매장명</TableCell>
                <TableCell>예약일시</TableCell>
                <TableCell>보관일</TableCell>
                <TableCell>금액</TableCell>
                <TableCell>상태</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>로딩 중...</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredOrders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((reservation) => (
                      <TableRow key={reservation.id} hover>
                        <TableCell>{reservation.reservationNumber}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleUserClick(reservation.userId)}
                            sx={{ 
                              textTransform: 'none', 
                              color: 'primary.main',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            {reservation.userName || '-'}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleStoreClick(reservation.placeName || '', reservation.placeAddress || '')}
                            sx={{ 
                              textTransform: 'none', 
                              color: 'secondary.main',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            {reservation.placeName || '-'}
                          </Button>
                        </TableCell>
                        <TableCell>{formatDate(reservation.createdAt)}</TableCell>
                        <TableCell>{reservation.storageDate || '-'}</TableCell>
                        <TableCell>₩{reservation.totalPrice?.toLocaleString() || 0}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusLabel(reservation.status || '')} 
                            color={getStatusColor(reservation.status || '') as any} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleViewOrder(reservation)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                  ))}
                  {filteredOrders.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        검색 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 행 수:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 전체 ${count}`}
        />
      </Paper>

      {/* 예약 상세 정보 다이얼로그 */}
      <Dialog
        open={openOrderDetail}
        onClose={handleCloseOrderDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>예약 상세 정보</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box sx={{ p: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">예약번호</Typography>
                  <Typography variant="body1" gutterBottom>{selectedOrder.reservationNumber}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">예약일시</Typography>
                  <Typography variant="body1" gutterBottom>{formatDate(selectedOrder.createdAt)}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">예약 상태</Typography>
                  <Chip 
                    label={getStatusLabel(selectedOrder.status || '')} 
                    color={getStatusColor(selectedOrder.status || '') as any} 
                    size="small" 
                    sx={{ my: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">고객명</Typography>
                  <Typography variant="body1" gutterBottom>{selectedOrder.userName || '-'}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">이메일</Typography>
                  <Typography variant="body1" gutterBottom>{selectedOrder.userEmail || '-'}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">매장명</Typography>
                  <Typography variant="body1" gutterBottom>{selectedOrder.placeName || '-'}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>보관 정보</Typography>
                  
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle2">보관일:</Typography>
                        <Typography variant="subtitle2">{selectedOrder.storageDate || '-'}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle2">소형 가방:</Typography>
                        <Typography variant="subtitle2">{selectedOrder.smallBags || 0}개</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle2">중형 가방:</Typography>
                        <Typography variant="subtitle2">{selectedOrder.mediumBags || 0}개</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle2">대형 가방:</Typography>
                        <Typography variant="subtitle2">{selectedOrder.largeBags || 0}개</Typography>
                      </Stack>
                      <Divider sx={{ my: 1 }} />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle2">총 금액:</Typography>
                        <Typography variant="subtitle1" fontWeight="bold">₩{selectedOrder.totalPrice?.toLocaleString() || 0}</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDetail}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrders; 