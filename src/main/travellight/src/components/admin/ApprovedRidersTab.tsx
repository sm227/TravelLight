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
  SelectChangeEvent,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  Search,
  Refresh,
  Visibility,
  DirectionsCar,
  Block,
  CheckCircle,
  AccessTime,
  PowerSettingsNew
} from '@mui/icons-material';
import { adminRiderService, RiderResponse } from '../../services/api';

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

const ApprovedRidersTab: React.FC = () => {
  const [riders, setRiders] = useState<RiderResponse[]>([]);
  const [filteredRiders, setFilteredRiders] = useState<RiderResponse[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE' | 'BUSY' | 'BREAK'>('ALL');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [selectedRider, setSelectedRider] = useState<RiderResponse | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRiders();
  }, []);

  useEffect(() => {
    filterRiders();
  }, [searchTerm, statusFilter, activeFilter, riders]);

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const response = await adminRiderService.getApprovedRiders();
      if (response.success) {
        setRiders(response.data);
      }
    } catch (error: any) {
      console.error('라이더 목록 로드 실패:', error);

      // 404 에러 (API 미구현)인 경우 조용히 처리
      if (error.response?.status === 404) {
        console.log('백엔드 API가 아직 구현되지 않았습니다. 빈 목록을 표시합니다.');
        setRiders([]);
      } else {
        // 다른 에러는 사용자에게 알림
        setAlertMessage({type: 'error', message: '라이더 목록을 불러오는데 실패했습니다.'});
        setTimeout(() => setAlertMessage(null), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const filterRiders = () => {
    let filtered = riders;

    // 활성 상태 필터
    if (activeFilter === 'ACTIVE') {
      filtered = filtered.filter(rider => rider.isActive);
    } else if (activeFilter === 'INACTIVE') {
      filtered = filtered.filter(rider => !rider.isActive);
    }

    // 근무 상태 필터
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(rider => rider.status === statusFilter);
    }

    // 검색어 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(rider =>
        rider.userName.toLowerCase().includes(term) ||
        rider.userEmail.toLowerCase().includes(term) ||
        rider.phoneNumber.includes(term) ||
        rider.vehicleNumber.toLowerCase().includes(term)
      );
    }

    setFilteredRiders(filtered);
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
    setStatusFilter(event.target.value as 'ALL' | 'ONLINE' | 'OFFLINE' | 'BUSY' | 'BREAK');
    setPage(0);
  };

  const handleActiveFilterChange = (event: SelectChangeEvent<string>) => {
    setActiveFilter(event.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE');
    setPage(0);
  };

  const handleToggleStatus = async (driverId: number, currentStatus: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'BREAK') => {
    const newStatus = currentStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';

    setLoading(true);
    try {
      const response = await adminRiderService.updateDriverStatus(driverId, newStatus);
      if (response.success) {
        setAlertMessage({
          type: 'success',
          message: `근무 상태가 ${newStatus === 'ONLINE' ? '온라인' : '오프라인'}으로 변경되었습니다.`
        });
        fetchRiders();
        if (selectedRider?.id === driverId) {
          setSelectedRider(response.data);
        }
      }
    } catch (error: any) {
      console.error('근무 상태 변경 실패:', error);
      setAlertMessage({
        type: 'error',
        message: error.response?.data?.message || '근무 상태 변경에 실패했습니다.'
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  const handleDeactivateClick = (rider: RiderResponse) => {
    setSelectedRider(rider);
    setOpenDeactivateDialog(true);
  };

  const handleDeactivateConfirm = async () => {
    if (!selectedRider) return;

    setLoading(true);
    try {
      const response = selectedRider.isActive
        ? await adminRiderService.deactivateDriver(selectedRider.id)
        : await adminRiderService.activateDriver(selectedRider.id);

      if (response.success) {
        setAlertMessage({
          type: 'success',
          message: `라이더가 ${selectedRider.isActive ? '비활성화' : '활성화'}되었습니다.`
        });
        fetchRiders();
        setOpenDeactivateDialog(false);
        setOpenDetailDialog(false);
      }
    } catch (error: any) {
      console.error('라이더 상태 변경 실패:', error);
      setAlertMessage({
        type: 'error',
        message: error.response?.data?.message || '라이더 상태 변경에 실패했습니다.'
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  const getStatusChip = (status: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'BREAK') => {
    const configs = {
      'ONLINE': { label: '온라인', color: COLORS.success, icon: <CheckCircle fontSize="small" /> },
      'OFFLINE': { label: '오프라인', color: COLORS.textMuted, icon: <AccessTime fontSize="small" /> },
      'BUSY': { label: '배달중', color: COLORS.warning, icon: <DirectionsCar fontSize="small" /> },
      'BREAK': { label: '휴식중', color: COLORS.info, icon: <AccessTime fontSize="small" /> }
    };

    const config = configs[status];

    return (
      <Chip
        label={config.label}
        icon={config.icon}
        size="small"
        sx={{
          bgcolor: `${config.color}20`,
          color: config.color,
          fontWeight: 500,
          fontSize: '0.75rem',
          '& .MuiChip-icon': {
            color: config.color
          }
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

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel sx={{ color: COLORS.textSecondary }}>활성 상태</InputLabel>
          <Select
            value={activeFilter}
            label="활성 상태"
            onChange={handleActiveFilterChange}
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
            <MenuItem value="ACTIVE">활성</MenuItem>
            <MenuItem value="INACTIVE">비활성</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel sx={{ color: COLORS.textSecondary }}>근무 상태</InputLabel>
          <Select
            value={statusFilter}
            label="근무 상태"
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
            <MenuItem value="ONLINE">온라인</MenuItem>
            <MenuItem value="OFFLINE">오프라인</MenuItem>
            <MenuItem value="BUSY">배달중</MenuItem>
            <MenuItem value="BREAK">휴식중</MenuItem>
          </Select>
        </FormControl>

        <IconButton onClick={fetchRiders} color="primary" disabled={loading}>
          <Refresh />
        </IconButton>
      </Stack>

      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="승인된 라이더 테이블">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>ID</TableCell>
              <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>이름</TableCell>
              <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>이메일</TableCell>
              <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>전화번호</TableCell>
              <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>차량번호</TableCell>
              <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>근무 상태</TableCell>
              <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>출퇴근 전환</TableCell>
              <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>승인일</TableCell>
              <TableCell align="center" sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRiders
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((rider) => (
                <TableRow
                  key={rider.id}
                  hover
                  sx={{
                    '&:hover': { bgcolor: COLORS.backgroundHover },
                    opacity: rider.isActive ? 1 : 0.5
                  }}
                >
                  <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{rider.id}</TableCell>
                  <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
                    {rider.userName}
                    {!rider.isActive && (
                      <Chip
                        label="비활성"
                        size="small"
                        sx={{ ml: 1, bgcolor: `${COLORS.danger}20`, color: COLORS.danger, fontSize: '0.7rem' }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{rider.userEmail}</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{rider.phoneNumber}</TableCell>
                  <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <DirectionsCar fontSize="small" sx={{ color: COLORS.textMuted }} />
                      {rider.vehicleNumber}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
                    {getStatusChip(rider.status)}
                  </TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
                    <Tooltip title={rider.status === 'ONLINE' ? '오프라인 전환' : '온라인 전환'}>
                      <Switch
                        checked={rider.status === 'ONLINE'}
                        onChange={() => handleToggleStatus(rider.id, rider.status)}
                        disabled={!rider.isActive || loading}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: COLORS.success,
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: COLORS.success,
                          },
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
                    {formatDate(rider.createdAt)}
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setSelectedRider(rider);
                        setOpenDetailDialog(true);
                      }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ color: rider.isActive ? COLORS.danger : COLORS.success }}
                      onClick={() => handleDeactivateClick(rider)}
                      disabled={loading}
                    >
                      {rider.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                    </IconButton>
                  </TableCell>
                </TableRow>
            ))}
            {filteredRiders.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ color: COLORS.textSecondary, borderBottom: `1px solid ${COLORS.borderPrimary}`, py: 4 }}>
                  {loading ? '로딩 중...' : '라이더가 없습니다.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredRiders.length}
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
          라이더 상세 정보
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRider && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>라이더 ID</Typography>
                <Typography variant="body1">{selectedRider.id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>이름</Typography>
                <Typography variant="body1">{selectedRider.userName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>이메일</Typography>
                <Typography variant="body1">{selectedRider.userEmail}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>전화번호</Typography>
                <Typography variant="body1">{selectedRider.phoneNumber}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>차량번호</Typography>
                <Typography variant="body1">{selectedRider.vehicleNumber}</Typography>
              </Box>
              {selectedRider.licenseNumber && (
                <Box>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted }}>면허번호</Typography>
                  <Typography variant="body1">{selectedRider.licenseNumber}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>근무 상태</Typography>
                <Box sx={{ mt: 0.5 }}>{getStatusChip(selectedRider.status)}</Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>활성 상태</Typography>
                <Typography variant="body1" sx={{ color: selectedRider.isActive ? COLORS.success : COLORS.danger }}>
                  {selectedRider.isActive ? '활성' : '비활성'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>등록일</Typography>
                <Typography variant="body1">{formatDate(selectedRider.createdAt)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>수정일</Typography>
                <Typography variant="body1">{formatDate(selectedRider.updatedAt)}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${COLORS.borderPrimary}`, p: 2 }}>
          {selectedRider?.isActive && (
            <Button
              onClick={() => selectedRider && handleToggleStatus(selectedRider.id, selectedRider.status)}
              variant="contained"
              startIcon={<PowerSettingsNew />}
              sx={{
                bgcolor: selectedRider.status === 'ONLINE' ? COLORS.warning : COLORS.success,
                '&:hover': { opacity: 0.9 }
              }}
              disabled={loading}
            >
              {selectedRider.status === 'ONLINE' ? '오프라인 전환' : '온라인 전환'}
            </Button>
          )}
          <Button
            onClick={() => selectedRider && handleDeactivateClick(selectedRider)}
            variant="outlined"
            sx={{ borderColor: selectedRider?.isActive ? COLORS.danger : COLORS.success, color: selectedRider?.isActive ? COLORS.danger : COLORS.success }}
            disabled={loading}
          >
            {selectedRider?.isActive ? '비활성화' : '활성화'}
          </Button>
          <Button onClick={() => setOpenDetailDialog(false)} sx={{ color: COLORS.textSecondary }}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 비활성화/활성화 확인 다이얼로그 */}
      <Dialog
        open={openDeactivateDialog}
        onClose={() => setOpenDeactivateDialog(false)}
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
          라이더 {selectedRider?.isActive ? '비활성화' : '활성화'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            {selectedRider?.userName}님을 {selectedRider?.isActive ? '비활성화' : '활성화'}하시겠습니까?
          </Typography>
          {selectedRider?.isActive && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              비활성화된 라이더는 더 이상 배달을 배정받을 수 없습니다.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${COLORS.borderPrimary}`, p: 2 }}>
          <Button
            onClick={handleDeactivateConfirm}
            variant="contained"
            sx={{
              bgcolor: selectedRider?.isActive ? COLORS.danger : COLORS.success,
              '&:hover': { opacity: 0.9 }
            }}
            disabled={loading}
          >
            {selectedRider?.isActive ? '비활성화' : '활성화'}
          </Button>
          <Button onClick={() => setOpenDeactivateDialog(false)} sx={{ color: COLORS.textSecondary }}>
            취소
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApprovedRidersTab;
