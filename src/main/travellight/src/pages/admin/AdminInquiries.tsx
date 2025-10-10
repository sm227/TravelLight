import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  ThemeProvider,
  createTheme,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Reply,
  Refresh,
  Visibility,
  CheckCircle
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import api from '../../services/api';

// 문의 인터페이스
interface Inquiry {
  id: number;
  inquiryType: string;
  inquiryTypeName: string;
  subject: string;
  content: string;
  email: string;
  phone?: string;
  status: string;
  statusName: string;
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  adminUser?: {
    id: number;
    name: string;
    email: string;
  };
}

// ERP 색상 정의
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

// ERP 테마 생성
const erpTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: COLORS.backgroundDark,
      paper: COLORS.backgroundCard,
    },
    primary: {
      main: COLORS.accentPrimary,
    },
    text: {
      primary: COLORS.textPrimary,
      secondary: COLORS.textSecondary,
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${COLORS.borderPrimary}`,
          color: COLORS.textSecondary,
        },
        head: {
          color: COLORS.textMuted,
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: COLORS.backgroundCard,
          border: `1px solid ${COLORS.borderPrimary}`,
        },
      },
    },
  },
});

const AdminInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0); // 0: 전체, 1: 답변대기, 2: 답변완료
  
  // 다이얼로그 상태
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState('');

  // 문의 목록 로드
  const loadInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/inquiries/admin/all';
      
      if (tabValue === 1) {
        url = '/inquiries/admin/status/PENDING';
      } else if (tabValue === 2) {
        url = '/inquiries/admin/status/ANSWERED';
      }
      
      const response = await api.get(url, {
        params: { size: 100 }
      });
      
      if (response.data.success) {
        const data = response.data.data;
        setInquiries(data.content || data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '문의 목록을 불러오는데 실패했습니다.');
      console.error('문의 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [tabValue]);

  // 답변 추가
  const handleAddReply = async () => {
    if (!selectedInquiry || !replyText.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(
        `/inquiries/${selectedInquiry.id}/admin-reply`,
        { adminReply: replyText }
      );
      
      if (response.data.success) {
        setSuccess('답변이 성공적으로 추가되었습니다.');
        setOpenDialog(false);
        setReplyText('');
        setSelectedInquiry(null);
        loadInquiries();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '답변 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 답변 다이얼로그 열기
  const openReplyDialog = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setReplyText(inquiry.adminReply || '');
    setOpenDialog(true);
  };

  // 상태별 색상
  const getStatusColor = (status: string) => {
    return status === 'ANSWERED' ? COLORS.success : COLORS.warning;
  };

  // 카테고리 색상
  const getCategoryColor = (type: string) => {
    const colors: Record<string, string> = {
      RESERVATION: COLORS.accentPrimary,
      DELIVERY: COLORS.success,
      STORAGE: COLORS.warning,
      ACCOUNT: COLORS.info,
      REFUND: COLORS.danger,
      OTHER: COLORS.textMuted
    };
    return colors[type] || COLORS.textMuted;
  };

  return (
    <ThemeProvider theme={erpTheme}>
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: COLORS.backgroundDark,
        p: 3 
      }}>
        {/* 헤더 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: COLORS.textPrimary, mb: 1, fontWeight: 600 }}>
            문의 관리
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
            고객 문의를 확인하고 답변을 작성합니다
          </Typography>
        </Box>

        {/* 알림 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* 탭 */}
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: COLORS.borderPrimary }}>
          <Tabs 
            value={tabValue} 
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: COLORS.textMuted,
                '&.Mui-selected': {
                  color: COLORS.accentPrimary
                }
              }
            }}
          >
            <Tab label="전체" />
            <Tab label="답변 대기" />
            <Tab label="답변 완료" />
          </Tabs>
        </Box>

        {/* 액션 버튼 */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadInquiries}
            sx={{
              borderColor: COLORS.borderSecondary,
              color: COLORS.textSecondary,
              '&:hover': {
                borderColor: COLORS.accentPrimary,
                bgcolor: COLORS.backgroundHover
              }
            }}
          >
            새로고침
          </Button>
        </Stack>

        {/* 문의 테이블 */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="10%">유형</TableCell>
                  <TableCell width="25%">제목</TableCell>
                  <TableCell width="20%">내용</TableCell>
                  <TableCell width="15%">문의자</TableCell>
                  <TableCell width="10%">상태</TableCell>
                  <TableCell width="12%">작성일</TableCell>
                  <TableCell width="8%" align="center">액션</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : inquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8, color: COLORS.textMuted }}>
                      문의가 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  inquiries.map((inquiry) => (
                    <TableRow
                      key={inquiry.id}
                      sx={{
                        '&:hover': { bgcolor: COLORS.backgroundHover }
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={inquiry.inquiryTypeName}
                          size="small"
                          sx={{
                            bgcolor: `${getCategoryColor(inquiry.inquiryType)}20`,
                            color: getCategoryColor(inquiry.inquiryType),
                            border: `1px solid ${getCategoryColor(inquiry.inquiryType)}40`,
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                          {inquiry.subject}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: COLORS.textSecondary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {inquiry.content}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>
                          {inquiry.user?.name || '-'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                          {inquiry.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={inquiry.statusName}
                          size="small"
                          icon={inquiry.status === 'ANSWERED' ? <CheckCircle fontSize="small" /> : undefined}
                          sx={{
                            bgcolor: `${getStatusColor(inquiry.status)}20`,
                            color: getStatusColor(inquiry.status),
                            border: `1px solid ${getStatusColor(inquiry.status)}40`,
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                          {format(new Date(inquiry.createdAt), 'yyyy.MM.dd', { locale: ko })}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title={inquiry.adminReply ? '답변 수정' : '답변 작성'}>
                            <IconButton
                              size="small"
                              onClick={() => openReplyDialog(inquiry)}
                              sx={{ color: inquiry.adminReply ? COLORS.success : COLORS.accentPrimary }}
                            >
                              <Reply fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* 답변 다이얼로그 */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
            }
          }}
        >
          <DialogTitle sx={{ color: COLORS.textPrimary }}>
            문의 답변 {selectedInquiry?.adminReply ? '수정' : '작성'}
          </DialogTitle>
          <DialogContent>
            {selectedInquiry && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.textMuted, mb: 1 }}>
                  문의 내용
                </Typography>
                <Box sx={{ p: 2, bgcolor: COLORS.backgroundSurface, borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 1 }}>
                    {selectedInquiry.subject}
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                    {selectedInquiry.content}
                  </Typography>
                </Box>
              </Box>
            )}
            
            <TextField
              fullWidth
              label="답변 내용"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              multiline
              rows={6}
              required
              sx={{
                '& .MuiInputBase-input': { color: COLORS.textPrimary },
                '& .MuiInputLabel-root': { color: COLORS.textSecondary },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setOpenDialog(false)}
              sx={{ color: COLORS.textSecondary }}
            >
              취소
            </Button>
            <Button
              onClick={handleAddReply}
              variant="contained"
              disabled={loading || !replyText.trim()}
              sx={{
                bgcolor: COLORS.accentPrimary,
                '&:hover': { bgcolor: COLORS.accentSecondary }
              }}
            >
              {loading ? <CircularProgress size={24} /> : '답변 등록'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default AdminInquiries;

