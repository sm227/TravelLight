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
  CircularProgress,
  Stack,
  ThemeProvider,
  createTheme,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Refresh,
  DragHandle
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

// FAQ 인터페이스
interface FAQ {
  id: number;
  category: string;
  categoryName: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: number;
    name: string;
    email: string;
  };
  updatedBy?: {
    id: number;
    name: string;
    email: string;
  };
}

// FAQ 요청 인터페이스
interface FAQRequest {
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

// 카테고리 정보 인터페이스
interface CategoryInfo {
  code: string;
  name: string;
  count: number;
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

const AdminFAQs: React.FC = () => {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 다이얼로그 상태
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  
  // 폼 상태
  const [formData, setFormData] = useState<FAQRequest>({
    category: 'RESERVATION',
    question: '',
    answer: '',
    sortOrder: 0,
    isActive: true,
  });

  // FAQ 목록 로드
  const loadFaqs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/faqs/admin/all', {
        params: { size: 100 }
      });
      
      if (response.data.success) {
        setFaqs(response.data.data.content || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'FAQ 목록을 불러오는데 실패했습니다.');
      console.error('FAQ 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 목록 로드
  const loadCategories = async () => {
    try {
      const response = await api.get('/faqs/categories');
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (err) {
      console.error('카테고리 로드 실패:', err);
    }
  };

  useEffect(() => {
    loadFaqs();
    loadCategories();
  }, []);

  // FAQ 생성
  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/faqs/admin', formData);
      
      if (response.data.success) {
        setSuccess(t('faqCreatedSuccess'));
        setOpenDialog(false);
        resetForm();
        loadFaqs();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'FAQ 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // FAQ 수정
  const handleUpdate = async () => {
    if (!selectedFaq) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/faqs/admin/${selectedFaq.id}`, formData);
      
      if (response.data.success) {
        setSuccess(t('faqUpdatedSuccess'));
        setOpenDialog(false);
        resetForm();
        loadFaqs();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'FAQ 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // FAQ 삭제
  const handleDelete = async (faqId: number) => {
    if (!window.confirm(t('confirmDeleteFaq'))) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/faqs/admin/${faqId}`);

      if (response.data.success) {
        setSuccess(t('faqDeletedSuccess'));
        loadFaqs();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'FAQ 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // FAQ 활성화/비활성화
  const handleToggleActive = async (faqId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/faqs/${faqId}/toggle-active`, {});
      
      if (response.data.success) {
        setSuccess(response.data.message);
        loadFaqs();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '상태 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 다이얼로그 열기 - 생성
  const openCreateDialog = () => {
    setDialogMode('create');
    resetForm();
    setOpenDialog(true);
  };

  // 다이얼로그 열기 - 수정
  const openEditDialog = (faq: FAQ) => {
    setDialogMode('edit');
    setSelectedFaq(faq);
    setFormData({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sortOrder,
      isActive: faq.isActive,
    });
    setOpenDialog(true);
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      category: 'RESERVATION',
      question: '',
      answer: '',
      sortOrder: 0,
      isActive: true,
    });
    setSelectedFaq(null);
  };

  // 카테고리 색상 가져오기
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      RESERVATION: COLORS.accentPrimary,
      DELIVERY: COLORS.success,
      STORAGE: COLORS.warning,
      ACCOUNT: COLORS.info,
      REFUND: COLORS.danger,
    };
    return colors[category] || COLORS.textMuted;
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
            {t('faqManagement')}
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
            {t('manageFaqs')}
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

        {/* 액션 버튼 */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openCreateDialog}
            sx={{
              bgcolor: COLORS.accentPrimary,
              '&:hover': { bgcolor: COLORS.accentSecondary }
            }}
          >
            {t('addFaq')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadFaqs}
            sx={{
              borderColor: COLORS.borderSecondary,
              color: COLORS.textSecondary,
              '&:hover': {
                borderColor: COLORS.accentPrimary,
                bgcolor: COLORS.backgroundHover
              }
            }}
          >
            {t('refresh')}
          </Button>
        </Stack>

        {/* FAQ 테이블 */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="5%">{t('order')}</TableCell>
                  <TableCell width="10%">{t('category')}</TableCell>
                  <TableCell width="30%">{t('question')}</TableCell>
                  <TableCell width="35%">{t('answer')}</TableCell>
                  <TableCell width="8%">{t('views')}</TableCell>
                  <TableCell width="8%">{t('status')}</TableCell>
                  <TableCell width="4%" align="center">{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : faqs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8, color: COLORS.textMuted }}>
                      {t('noFaqs')}
                    </TableCell>
                  </TableRow>
                ) : (
                  faqs.map((faq) => (
                    <TableRow
                      key={faq.id}
                      sx={{
                        '&:hover': { bgcolor: COLORS.backgroundHover },
                        opacity: faq.isActive ? 1 : 0.5
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <DragHandle sx={{ color: COLORS.textMuted, cursor: 'grab' }} />
                          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                            {faq.sortOrder}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={faq.categoryName}
                          size="small"
                          sx={{
                            bgcolor: `${getCategoryColor(faq.category)}20`,
                            color: getCategoryColor(faq.category),
                            border: `1px solid ${getCategoryColor(faq.category)}40`,
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>
                          {faq.question}
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
                          {faq.answer}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Visibility sx={{ fontSize: 16, color: COLORS.textMuted }} />
                          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                            {faq.viewCount}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={faq.isActive ? t('active') : t('inactive')}
                          size="small"
                          sx={{
                            bgcolor: faq.isActive ? `${COLORS.success}20` : `${COLORS.textMuted}20`,
                            color: faq.isActive ? COLORS.success : COLORS.textMuted,
                            border: `1px solid ${faq.isActive ? COLORS.success : COLORS.textMuted}40`,
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title={t('edit')}>
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(faq)}
                              sx={{ color: COLORS.accentPrimary }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={faq.isActive ? t('deactivate') : t('activate')}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleActive(faq.id)}
                              sx={{ color: COLORS.warning }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('delete')}>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(faq.id)}
                              sx={{ color: COLORS.danger }}
                            >
                              <Delete fontSize="small" />
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

        {/* FAQ 추가/수정 다이얼로그 */}
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
            {dialogMode === 'create' ? t('addFaq') : t('editFaq')}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: COLORS.textSecondary }}>{t('category')}</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label={t('category')}
                  sx={{
                    color: COLORS.textPrimary,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.borderSecondary
                    }
                  }}
                >
                  <MenuItem value="RESERVATION">{t('reservationPayment')}</MenuItem>
                  <MenuItem value="DELIVERY">{t('deliveryService')}</MenuItem>
                  <MenuItem value="STORAGE">{t('luggageStorage')}</MenuItem>
                  <MenuItem value="ACCOUNT">{t('accountManagement')}</MenuItem>
                  <MenuItem value="REFUND">{t('refundCancellation')}</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label={t('question')}
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                inputProps={{ maxLength: 500 }}
                sx={{
                  '& .MuiInputBase-input': { color: COLORS.textPrimary },
                  '& .MuiInputLabel-root': { color: COLORS.textSecondary },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                }}
              />

              <TextField
                fullWidth
                label={t('answer')}
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                required
                multiline
                rows={6}
                inputProps={{ maxLength: 2000 }}
                sx={{
                  '& .MuiInputBase-input': { color: COLORS.textPrimary },
                  '& .MuiInputLabel-root': { color: COLORS.textSecondary },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                }}
              />

              <TextField
                fullWidth
                type="number"
                label={t('sortOrder')}
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                InputProps={{ inputProps: { min: 0 } }}
                sx={{
                  '& .MuiInputBase-input': { color: COLORS.textPrimary },
                  '& .MuiInputLabel-root': { color: COLORS.textSecondary },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: COLORS.success,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: COLORS.success,
                      },
                    }}
                  />
                }
                label={t('active')}
                sx={{ color: COLORS.textSecondary }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setOpenDialog(false)}
              sx={{ color: COLORS.textSecondary }}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={dialogMode === 'create' ? handleCreate : handleUpdate}
              variant="contained"
              disabled={loading || !formData.question || !formData.answer}
              sx={{
                bgcolor: COLORS.accentPrimary,
                '&:hover': { bgcolor: COLORS.accentSecondary }
              }}
            >
              {loading ? <CircularProgress size={24} /> : dialogMode === 'create' ? t('add') : t('update')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default AdminFAQs;

