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
  Alert
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  PersonAdd,
  Refresh
} from '@mui/icons-material';

// 샘플 사용자 데이터
const sampleUsers = [
  { id: 1, name: '김철수', email: 'kim@example.com', role: '일반회원', status: '활성', createdAt: '2023-06-15', lastLogin: '2023-07-14 15:32' },
  { id: 2, name: '이영희', email: 'lee@example.com', role: 'VIP회원', status: '활성', createdAt: '2023-05-20', lastLogin: '2023-07-15 09:45' },
  { id: 3, name: '박민준', email: 'park@example.com', role: '일반회원', status: '비활성', createdAt: '2023-04-10', lastLogin: '2023-06-30 11:20' },
  { id: 4, name: '정수민', email: 'jung@example.com', role: '일반회원', status: '활성', createdAt: '2023-07-01', lastLogin: '2023-07-12 18:15' },
  { id: 5, name: '최재현', email: 'choi@example.com', role: 'VIP회원', status: '활성', createdAt: '2023-03-15', lastLogin: '2023-07-14 20:05' },
  { id: 6, name: '강지원', email: 'kang@example.com', role: '일반회원', status: '활성', createdAt: '2023-02-28', lastLogin: '2023-07-13 12:40' },
  { id: 7, name: '윤서연', email: 'yoon@example.com', role: '일반회원', status: '비활성', createdAt: '2023-05-05', lastLogin: '2023-06-20 09:30' },
  { id: 8, name: '장민서', email: 'jang@example.com', role: 'VIP회원', status: '활성', createdAt: '2023-04-22', lastLogin: '2023-07-15 14:25' },
  { id: 9, name: '한지민', email: 'han@example.com', role: '일반회원', status: '활성', createdAt: '2023-06-10', lastLogin: '2023-07-14 16:55' },
  { id: 10, name: '오준호', email: 'oh@example.com', role: '일반회원', status: '활성', createdAt: '2023-07-05', lastLogin: '2023-07-15 10:10' },
  { id: 11, name: '서예지', email: 'seo@example.com', role: '일반회원', status: '비활성', createdAt: '2023-05-15', lastLogin: '2023-06-25 13:15' },
  { id: 12, name: '임태양', email: 'lim@example.com', role: 'VIP회원', status: '활성', createdAt: '2023-04-18', lastLogin: '2023-07-12 19:40' },
];

const AdminUsers = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(sampleUsers);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

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

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    setUsers(sampleUsers);
    setSearchTerm('');
    setPage(0);
    setAlertMessage({type: 'success', message: '사용자 목록이 새로고침되었습니다.'});
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete !== null) {
      setUsers(users.filter(user => user.id !== userToDelete));
      setAlertMessage({type: 'success', message: '사용자가 삭제되었습니다.'});
      setTimeout(() => setAlertMessage(null), 3000);
    }
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        사용자 관리
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
            placeholder="이름 또는 이메일로 검색"
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
            startIcon={<PersonAdd />}
            sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}
          >
            사용자 추가
          </Button>
          <IconButton onClick={handleRefresh} color="primary">
            <Refresh />
          </IconButton>
        </Stack>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="사용자 테이블">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>이름</TableCell>
                <TableCell>이메일</TableCell>
                <TableCell>등급</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>가입일</TableCell>
                <TableCell>최근 로그인</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        color={user.role === 'VIP회원' ? 'secondary' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.status} 
                        color={user.status === '활성' ? 'success' : 'error'} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteClick(user.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
              ))}
              {filteredUsers.length === 0 && (
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
          count={filteredUsers.length}
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
        <DialogTitle>사용자 삭제</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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

export default AdminUsers; 