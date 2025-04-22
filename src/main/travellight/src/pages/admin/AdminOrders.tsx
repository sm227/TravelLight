// @ts-ignore
import React, { useState } from 'react';
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
  Divider
} from '@mui/material';
import {
  Search,
  Visibility,
  Refresh,
  FilterList,
  LocalShipping
} from '@mui/icons-material';

// 샘플 주문 데이터
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orders, setOrders] = useState(sampleOrders);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [openOrderDetail, setOpenOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // 검색 시 첫 페이지로 초기화
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter && order.status !== statusFilter) {
      return false;
    }
    
    return matchesSearch;
  });

  const handleRefresh = () => {
    setOrders(sampleOrders);
    setSearchTerm('');
    setStatusFilter('');
    setPage(0);
    setAlertMessage({type: 'success', message: '주문 목록이 새로고침되었습니다.'});
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

  // 주문 상태에 따른 색상 반환 함수
  const getStatusColor = (status: string) => {
    switch (status) {
      case '배송 완료':
        return 'success';
      case '배송 중':
        return 'info';
      case '결제 완료':
        return 'primary';
      case '주문 접수':
        return 'warning';
      case '주문 취소':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        주문 관리
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
            placeholder="주문번호, 고객명, 이메일로 검색"
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
            <InputLabel id="status-filter-label">주문 상태</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="주문 상태"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="주문 접수">주문 접수</MenuItem>
              <MenuItem value="결제 완료">결제 완료</MenuItem>
              <MenuItem value="배송 중">배송 중</MenuItem>
              <MenuItem value="배송 완료">배송 완료</MenuItem>
              <MenuItem value="주문 취소">주문 취소</MenuItem>
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
          <Table sx={{ minWidth: 650 }} aria-label="주문 테이블">
            <TableHead>
              <TableRow>
                <TableCell>주문번호</TableCell>
                <TableCell>고객명</TableCell>
                <TableCell>이메일</TableCell>
                <TableCell>주문일시</TableCell>
                <TableCell>상품수</TableCell>
                <TableCell>주문금액</TableCell>
                <TableCell>결제방법</TableCell>
                <TableCell>상태</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.email}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.items}개</TableCell>
                    <TableCell>₩{order.amount}</TableCell>
                    <TableCell>{order.paymentMethod}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        color={getStatusColor(order.status) as any} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleViewOrder(order)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      {order.status === '결제 완료' && (
                        <IconButton size="small" color="success">
                          <LocalShipping fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
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

      {/* 주문 상세 정보 다이얼로그 */}
      <Dialog
        open={openOrderDetail}
        onClose={handleCloseOrderDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>주문 상세 정보</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box sx={{ p: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">주문번호</Typography>
                  <Typography variant="body1" gutterBottom>{selectedOrder.id}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">주문일시</Typography>
                  <Typography variant="body1" gutterBottom>{selectedOrder.date}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">주문 상태</Typography>
                  <Chip 
                    label={selectedOrder.status} 
                    color={getStatusColor(selectedOrder.status) as any} 
                    size="small" 
                    sx={{ my: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">고객명</Typography>
                  <Typography variant="body1" gutterBottom>{selectedOrder.customer}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">이메일</Typography>
                  <Typography variant="body1" gutterBottom>{selectedOrder.email}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">결제방법</Typography>
                  <Typography variant="body1" gutterBottom>{selectedOrder.paymentMethod}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>주문 상품</Typography>
                  
                  {/* 여기에는 실제로는 해당 주문의 상품 목록이 표시되어야 합니다. */}
                  <Typography variant="body2" color="text.secondary">
                    샘플 데이터에는 상품 목록이 포함되어 있지 않습니다. 실제 구현 시 연동 필요.
                  </Typography>
                  
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="subtitle2">총 상품수:</Typography>
                      <Typography variant="subtitle2">{selectedOrder.items}개</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="subtitle2">총 주문금액:</Typography>
                      <Typography variant="subtitle1" fontWeight="bold">₩{selectedOrder.amount}</Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDetail}>닫기</Button>
          {selectedOrder && selectedOrder.status === '결제 완료' && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<LocalShipping />}
            >
              배송 처리
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrders; 