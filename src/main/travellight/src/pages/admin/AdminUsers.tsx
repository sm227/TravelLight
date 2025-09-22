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
  CircularProgress,
  ThemeProvider,
  createTheme
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  PersonAdd,
  Refresh
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
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.backgroundCard,
          border: `1px solid ${COLORS.borderPrimary}`,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.backgroundSurface,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: COLORS.borderPrimary,
          color: COLORS.textPrimary,
        },
        head: {
          backgroundColor: COLORS.backgroundSurface,
          color: COLORS.textPrimary,
          fontWeight: 600,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: COLORS.backgroundHover,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: COLORS.backgroundSurface,
            color: COLORS.textPrimary,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: COLORS.borderSecondary,
          },
          '& .MuiInputLabel-root': {
            color: COLORS.textSecondary,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: COLORS.backgroundCard,
          color: COLORS.textPrimary,
        },
      },
    },
  },
});

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

const AdminUsers = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
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

  // 사용자 목록 로드
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminUserService.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        setAlertMessage({type: 'error', message: '사용자 목록을 불러오는데 실패했습니다.'});
      }
    } catch (error) {
      console.error('사용자 목록 로드 중 오류:', error);
      setAlertMessage({type: 'error', message: '사용자 목록을 불러오는데 실패했습니다.'});
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadUsers();
  }, []);

  const handleRefresh = () => {
    setSearchTerm('');
    setPage(0);
    loadUsers();
    setAlertMessage({type: 'success', message: '사용자 목록이 새로고침되었습니다.'});
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete !== null) {
      try {
        setDeleting(true);
        const response = await adminUserService.deleteUser(userToDelete);
        if (response.success) {
          setUsers(users.filter(user => user.id !== userToDelete));
          setAlertMessage({type: 'success', message: '사용자가 삭제되었습니다.'});
        } else {
          setAlertMessage({type: 'error', message: '사용자 삭제에 실패했습니다.'});
        }
      } catch (error: any) {
        console.error('사용자 삭제 중 오류:', error);
        let errorMessage = '사용자 삭제에 실패했습니다.';
        
        if (error.response?.status === 403) {
          errorMessage = '사용자 삭제 권한이 없습니다.';
        } else if (error.response?.status === 404) {
          errorMessage = '삭제하려는 사용자를 찾을 수 없습니다.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        setAlertMessage({type: 'error', message: errorMessage});
      } finally {
        setDeleting(false);
        setTimeout(() => setAlertMessage(null), 3000);
      }
    }
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  // 사용자 상세 정보 핸들러
  const handleUserClick = (user: AdminUserResponse) => {
    navigate(`/admin/users/${user.id}`);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ 
        p: 3, 
        bgcolor: COLORS.backgroundDark,
        minHeight: '100vh',
        color: COLORS.textPrimary
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          fontWeight="bold"
          sx={{ color: COLORS.textPrimary }}
        >
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

      <Paper 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          bgcolor: COLORS.backgroundCard,
          border: `1px solid ${COLORS.borderPrimary}`
        }} 
        elevation={3}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            placeholder="이름 또는 이메일로 검색"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={handleSearch}
            sx={{
              '& .MuiInputBase-root': {
                bgcolor: COLORS.backgroundSurface,
                color: COLORS.textPrimary
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: COLORS.borderSecondary
              },
              '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                color: COLORS.textSecondary
              }
            }}
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
            sx={{ 
              whiteSpace: 'nowrap', 
              minWidth: 'auto',
              bgcolor: COLORS.accentPrimary,
              color: COLORS.textPrimary,
              '&:hover': {
                bgcolor: COLORS.accentPrimary,
                opacity: 0.8
              }
            }}
          >
            사용자 추가
          </Button>
          <IconButton 
            onClick={handleRefresh} 
            sx={{ 
              color: COLORS.textSecondary,
              '&:hover': { 
                color: COLORS.accentPrimary,
                bgcolor: COLORS.backgroundHover 
              }
            }}
          >
            <Refresh />
          </IconButton>
        </Stack>

        <Typography 
          variant="body2" 
          sx={{ 
            mb: 1,
            color: COLORS.textSecondary
          }}
        >
          💡 사용자 행을 클릭하면 상세 정보를 확인할 수 있습니다.
        </Typography>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="사용자 테이블">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>이름</TableCell>
                <TableCell>이메일</TableCell>
                <TableCell>역할</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>가입일</TableCell>
                <TableCell>수정일</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 1 }}>로딩 중...</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow 
                        key={user.id} 
                        hover 
                        onClick={() => handleUserClick(user)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getRoleDisplayName(user.role)} 
                            size="small"
                            sx={{
                              bgcolor: user.role === 'ADMIN' ? COLORS.accentPrimary : COLORS.backgroundSurface,
                              color: COLORS.textPrimary,
                              border: `1px solid ${COLORS.borderSecondary}`
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.status} 
                            size="small" 
                            variant="outlined"
                            sx={{
                              color: user.status === '활성' ? '#10b981' : '#ef4444',
                              borderColor: user.status === '활성' ? '#10b981' : '#ef4444',
                              bgcolor: 'transparent'
                            }}
                          />
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>{formatDateTime(user.updatedAt)}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: 편집 기능 구현
                            }}
                            sx={{
                              color: COLORS.textSecondary,
                              '&:hover': {
                                color: COLORS.accentPrimary,
                                bgcolor: COLORS.backgroundHover
                              }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(user.id);
                            }}
                            sx={{
                              color: COLORS.textSecondary,
                              '&:hover': {
                                color: '#ef4444',
                                bgcolor: COLORS.backgroundHover
                              }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                  ))}
                  {!loading && filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        {searchTerm ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
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
        onClose={!deleting ? handleDeleteCancel : undefined}
      >
        <DialogTitle>사용자 삭제</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {userToDelete && users.find(u => u.id === userToDelete) && (
              <>
                <strong>{users.find(u => u.id === userToDelete)?.name}</strong> 사용자를 정말로 삭제하시겠습니까?
                <br />
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  이 작업은 되돌릴 수 없습니다.
                </Typography>
              </>
            )}
            {(!userToDelete || !users.find(u => u.id === userToDelete)) && (
              '정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel} 
            disabled={deleting}
            sx={{
              color: COLORS.textSecondary,
              '&:hover': {
                color: COLORS.textPrimary,
                bgcolor: COLORS.backgroundHover
              }
            }}
          >
            취소
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : null}
            sx={{
              bgcolor: '#ef4444',
              color: COLORS.textPrimary,
              '&:hover': {
                bgcolor: '#dc2626'
              }
            }}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>

      </Box>
    </ThemeProvider>
  );
};

export default AdminUsers; 