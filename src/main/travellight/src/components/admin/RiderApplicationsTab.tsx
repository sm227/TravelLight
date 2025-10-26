import React, { useState, useEffect } from 'react';
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
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import {
  Search,
  Refresh,
  CheckCircle,
  Cancel,
  Visibility,
  DirectionsCar
} from '@mui/icons-material';
import { adminRiderService, RiderApplicationResponse } from '../../services/api';

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
};

const RiderApplicationsTab: React.FC = () => {
  const [applications, setApplications] = useState<RiderApplicationResponse[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<RiderApplicationResponse[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedApplication, setSelectedApplication] = useState<RiderApplicationResponse | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [searchTerm, statusFilter, applications]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await adminRiderService.getAllApplications();
      if (response.success) {
        setApplications(response.data);
      }
    } catch (error) {
      console.error('라이더 신청 목록 로드 실패:', error);
      setAlertMessage({type: 'error', message: '라이더 신청 목록을 불러오는데 실패했습니다.'});
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // 상태 필터
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // 검색어 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.userName.toLowerCase().includes(term) ||
        app.userEmail.toLowerCase().includes(term) ||
        app.phoneNumber.includes(term) ||
        app.vehicleNumber.toLowerCase().includes(term)
      );
    }

    setFilteredApplications(filtered);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value as 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED');
    setPage(0);
  };

  const handleApprove = async (applicationId: number) => {
    if (!window.confirm('이 라이더 신청을 승인하시겠습니까?')) return;

    setLoading(true);
    try {
      const response = await adminRiderService.approveApplication(applicationId);
      if (response.success) {
        setAlertMessage({type: 'success', message: '라이더 신청이 승인되었습니다.'});
        fetchApplications();
        setOpenDetailDialog(false);
      }
    } catch (error: any) {
      console.error('라이더 신청 승인 실패:', error);
      setAlertMessage({
        type: 'error',
        message: error.response?.data?.message || '라이더 신청 승인에 실패했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = (application: RiderApplicationResponse) => {
    setSelectedApplication(application);
    setRejectionReason('');
    setOpenRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedApplication) return;
    if (!rejectionReason.trim()) {
      setAlertMessage({type: 'error', message: '거절 사유를 입력해주세요.'});
      return;
    }

    setLoading(true);
    try {
      const response = await adminRiderService.rejectApplication(selectedApplication.id, rejectionReason);
      if (response.success) {
        setAlertMessage({type: 'success', message: '라이더 신청이 거절되었습니다.'});
        fetchApplications();
        setOpenRejectDialog(false);
        setOpenDetailDialog(false);
      }
    } catch (error: any) {
      console.error('라이더 신청 거절 실패:', error);
      setAlertMessage({
        type: 'error',
        message: error.response?.data?.message || '라이더 신청 거절에 실패했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      PENDING: { label: '대기중', color: COLORS.warning },
      APPROVED: { label: '승인됨', color: COLORS.success },
      REJECTED: { label: '거절됨', color: COLORS.danger }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: COLORS.textMuted };

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          bgcolor: `${config.color}20`,
          color: config.color,
          fontWeight: 500,
          fontSize: '0.75rem'
        }}
      />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      {alertMessage && (
        <Alert
          severity={alertMessage.type}
          onClose={() => setAlertMessage(null)}
          sx={{ mb: 2 }}
        >
          {alertMessage.message}
        </Alert>
      )}

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          placeholder="이름, 이메일, 전화번호, 차량번호로 검색"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              color: COLORS.textPrimary,
              '& fieldset': {
                borderColor: COLORS.borderSecondary,
              },
              '&:hover fieldset': {
                borderColor: COLORS.accentPrimary,
              },
              '&.Mui-focused fieldset': {
                borderColor: COLORS.accentPrimary,
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: COLORS.textMuted,
              opacity: 1,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: COLORS.textMuted }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: COLORS.textSecondary }}>상태</InputLabel>
          <Select
            value={statusFilter}
            label="상태"
            onChange={handleStatusFilterChange}
            sx={{
              color: COLORS.textPrimary,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: COLORS.borderSecondary,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: COLORS.accentPrimary,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: COLORS.accentPrimary,
              },
            }}
          >
            <MenuItem value="ALL">전체</MenuItem>
            <MenuItem value="PENDING">대기중</MenuItem>
            <MenuItem value="APPROVED">승인됨</MenuItem>
            <MenuItem value="REJECTED">거절됨</MenuItem>
          </Select>
        </FormControl>

        <IconButton onClick={fetchApplications} color="primary" disabled={loading}>
          <Refresh />
        </IconButton>
      </Stack>

      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="라이더 신청 테이블">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>ID</TableCell>
              <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>이름</TableCell>
              <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>이메일</TableCell>
              <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>전화번호</TableCell>
              <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>차량번호</TableCell>
              <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>상태</TableCell>
              <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>신청일</TableCell>
              <TableCell align="center" sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApplications
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((application) => (
                <TableRow key={application.id} hover sx={{ '&:hover': { bgcolor: COLORS.backgroundHover } }}>
                  <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{application.id}</TableCell>
                  <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{application.userName}</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{application.userEmail}</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{application.phoneNumber}</TableCell>
                  <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <DirectionsCar fontSize="small" sx={{ color: COLORS.textMuted }} />
                      {application.vehicleNumber}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{getStatusChip(application.status)}</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{formatDate(application.createdAt)}</TableCell>
                  <TableCell align="center" sx={{ borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setSelectedApplication(application);
                        setOpenDetailDialog(true);
                      }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    {application.status === 'PENDING' && (
                      <>
                        <IconButton
                          size="small"
                          sx={{ color: COLORS.success }}
                          onClick={() => handleApprove(application.id)}
                          disabled={loading}
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: COLORS.danger }}
                          onClick={() => handleRejectClick(application)}
                          disabled={loading}
                        >
                          <Cancel fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
            ))}
            {filteredApplications.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ color: COLORS.textSecondary, borderBottom: `1px solid ${COLORS.borderPrimary}`, py: 4 }}>
                  {loading ? '로딩 중...' : '라이더 신청 내역이 없습니다.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredApplications.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="페이지당 행 수:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 전체 ${count}`}
        sx={{
          color: COLORS.textPrimary,
          borderTop: `1px solid ${COLORS.borderPrimary}`,
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            color: COLORS.textSecondary
          },
          '& .MuiSelect-icon': {
            color: COLORS.textSecondary
          }
        }}
      />

      {/* 상세 다이얼로그 */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: COLORS.backgroundCard,
            color: COLORS.textPrimary
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
          라이더 신청 상세 정보
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedApplication && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>신청 ID</Typography>
                <Typography variant="body1">{selectedApplication.id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>이름</Typography>
                <Typography variant="body1">{selectedApplication.userName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>이메일</Typography>
                <Typography variant="body1">{selectedApplication.userEmail}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>전화번호</Typography>
                <Typography variant="body1">{selectedApplication.phoneNumber}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>차량번호</Typography>
                <Typography variant="body1">{selectedApplication.vehicleNumber}</Typography>
              </Box>
              {selectedApplication.licenseNumber && (
                <Box>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted }}>면허번호</Typography>
                  <Typography variant="body1">{selectedApplication.licenseNumber}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>상태</Typography>
                <Box sx={{ mt: 0.5 }}>{getStatusChip(selectedApplication.status)}</Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>신청일</Typography>
                <Typography variant="body1">{formatDate(selectedApplication.createdAt)}</Typography>
              </Box>
              {selectedApplication.approvedAt && (
                <Box>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted }}>승인일</Typography>
                  <Typography variant="body1">{formatDate(selectedApplication.approvedAt)}</Typography>
                </Box>
              )}
              {selectedApplication.rejectedAt && (
                <Box>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted }}>거절일</Typography>
                  <Typography variant="body1">{formatDate(selectedApplication.rejectedAt)}</Typography>
                </Box>
              )}
              {selectedApplication.rejectionReason && (
                <Box>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted }}>거절 사유</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.danger }}>{selectedApplication.rejectionReason}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${COLORS.borderPrimary}`, p: 2 }}>
          {selectedApplication?.status === 'PENDING' && (
            <>
              <Button
                onClick={() => selectedApplication && handleApprove(selectedApplication.id)}
                variant="contained"
                sx={{ bgcolor: COLORS.success, '&:hover': { bgcolor: COLORS.success, opacity: 0.9 } }}
                disabled={loading}
              >
                승인
              </Button>
              <Button
                onClick={() => selectedApplication && handleRejectClick(selectedApplication)}
                variant="outlined"
                sx={{ borderColor: COLORS.danger, color: COLORS.danger }}
                disabled={loading}
              >
                거절
              </Button>
            </>
          )}
          <Button onClick={() => setOpenDetailDialog(false)} sx={{ color: COLORS.textSecondary }}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 거절 다이얼로그 */}
      <Dialog
        open={openRejectDialog}
        onClose={() => setOpenRejectDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: COLORS.backgroundCard,
            color: COLORS.textPrimary
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
          라이더 신청 거절
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 2 }}>
            {selectedApplication?.userName}님의 라이더 신청을 거절하시겠습니까?
          </Typography>
          <TextField
            label="거절 사유"
            multiline
            rows={4}
            fullWidth
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="거절 사유를 입력해주세요."
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                color: COLORS.textPrimary,
                '& fieldset': {
                  borderColor: COLORS.borderSecondary,
                },
                '&:hover fieldset': {
                  borderColor: COLORS.accentPrimary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: COLORS.accentPrimary,
                },
              },
              '& .MuiInputLabel-root': {
                color: COLORS.textSecondary,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${COLORS.borderPrimary}`, p: 2 }}>
          <Button
            onClick={handleRejectConfirm}
            variant="contained"
            sx={{ bgcolor: COLORS.danger, '&:hover': { bgcolor: COLORS.danger, opacity: 0.9 } }}
            disabled={loading || !rejectionReason.trim()}
          >
            거절
          </Button>
          <Button onClick={() => setOpenRejectDialog(false)} sx={{ color: COLORS.textSecondary }}>
            취소
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RiderApplicationsTab;
