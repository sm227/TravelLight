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
  Avatar,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  Add,
  Refresh,
  FilterList
} from '@mui/icons-material';

// 샘플 상품 데이터
const sampleProducts = [
  { id: 1, name: '여행용 캐리어', category: '여행가방', price: '129,000', stock: 45, status: '판매중', image: 'https://via.placeholder.com/40' },
  { id: 2, name: '목베개', category: '여행용품', price: '15,000', stock: 120, status: '판매중', image: 'https://via.placeholder.com/40' },
  { id: 3, name: '여권 케이스', category: '여행용품', price: '8,500', stock: 78, status: '판매중', image: 'https://via.placeholder.com/40' },
  { id: 4, name: '여행용 어댑터', category: '전자기기', price: '22,000', stock: 32, status: '판매중', image: 'https://via.placeholder.com/40' },
  { id: 5, name: '방수 파우치', category: '여행용품', price: '12,500', stock: 55, status: '판매중', image: 'https://via.placeholder.com/40' },
  { id: 6, name: '미니 세면도구 세트', category: '여행용품', price: '9,800', stock: 87, status: '판매중', image: 'https://via.placeholder.com/40' },
  { id: 7, name: '접이식 우산', category: '여행용품', price: '14,500', stock: 41, status: '품절', image: 'https://via.placeholder.com/40' },
  { id: 8, name: '여행용 디지털 저울', category: '전자기기', price: '18,900', stock: 0, status: '품절', image: 'https://via.placeholder.com/40' },
  { id: 9, name: '휴대용 공기 펌프', category: '여행용품', price: '35,000', stock: 13, status: '판매중', image: 'https://via.placeholder.com/40' },
  { id: 10, name: '접이식 슬리퍼', category: '의류', price: '7,500', stock: 64, status: '판매중', image: 'https://via.placeholder.com/40' },
  { id: 11, name: '보조 배터리', category: '전자기기', price: '28,000', stock: 27, status: '판매중', image: 'https://via.placeholder.com/40' },
  { id: 12, name: '여행용 세탁 비누', category: '생활용품', price: '5,500', stock: 92, status: '판매중', image: 'https://via.placeholder.com/40' },
];

const AdminProducts = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState(sampleProducts);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [showOutOfStock, setShowOutOfStock] = useState(true);

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

  const handleOutOfStockToggle = () => {
    setShowOutOfStock(!showOutOfStock);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!showOutOfStock && product.stock === 0) {
      return false;
    }
    
    return matchesSearch;
  });

  const handleRefresh = () => {
    setProducts(sampleProducts);
    setSearchTerm('');
    setPage(0);
    setAlertMessage({type: 'success', message: '상품 목록이 새로고침되었습니다.'});
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete !== null) {
      setProducts(products.filter(product => product.id !== productToDelete));
      setAlertMessage({type: 'success', message: '상품이 삭제되었습니다.'});
      setTimeout(() => setAlertMessage(null), 3000);
    }
    setOpenDeleteDialog(false);
    setProductToDelete(null);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setProductToDelete(null);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        상품 관리
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
            placeholder="상품명 또는 카테고리로 검색"
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
          <Button 
            variant="contained" 
            startIcon={<Add />}
            sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}
          >
            상품 추가
          </Button>
          <IconButton onClick={handleRefresh} color="primary">
            <Refresh />
          </IconButton>
          <IconButton color="primary">
            <FilterList />
          </IconButton>
          <FormControlLabel
            control={
              <Switch
                checked={showOutOfStock}
                onChange={handleOutOfStockToggle}
                color="primary"
              />
            }
            label="품절 상품 표시"
            sx={{ ml: 1 }}
          />
        </Stack>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="상품 테이블">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>이미지</TableCell>
                <TableCell>상품명</TableCell>
                <TableCell>카테고리</TableCell>
                <TableCell>가격</TableCell>
                <TableCell>재고</TableCell>
                <TableCell>상태</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>
                      <Avatar src={product.image} variant="rounded" sx={{ width: 40, height: 40 }} />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>₩{product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Chip 
                        label={product.status} 
                        color={product.status === '판매중' ? 'success' : 'error'} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteClick(product.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
              ))}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
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
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 행 수:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 전체 ${count}`}
        />
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>상품 삭제</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            정말로 이 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>취소</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProducts; 