import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Stack,
  Divider,
  Card,
  CardContent,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  alpha
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Save,
  Cancel,
  CheckCircle,
  LocationOn,
  Business,
  Phone,
  Email,
  AccessTime,
  Info,
  Image,
  Description,
  AccountBalance,
  LocalOffer
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { partnershipService } from '../../services/api';

// 동일한 색상 테마
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
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  backgroundHover: 'rgba(255, 255, 255, 0.05)',
  backgroundSelected: 'rgba(59, 130, 246, 0.1)',
};

interface Partnership {
  id: number;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  businessType: string;
  spaceSize: string;
  additionalInfo: string;
  agreeTerms: boolean;
  is24Hours: boolean;
  businessHours: Record<string, string>;
  submissionId: string;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  smallBagsAvailable?: number;
  mediumBagsAvailable?: number;
  largeBagsAvailable?: number;
  storePictures?: string[];
  amenities?: string[];
  insuranceAvailable?: boolean;
  businessRegistrationUrl?: string;
  bankBookUrl?: string;
  accountNumber?: string;
  bankName?: string;
  accountHolder?: string;
  rejectionReason?: string;
}

interface BusinessHourEdit {
  enabled: boolean;
  open: string;
  close: string;
}

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
      id={`partnership-tabpanel-${index}`}
      aria-labelledby={`partnership-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const PartnershipDetail = () => {
  const { partnershipId } = useParams<{ partnershipId: string }>();
  const navigate = useNavigate();
  
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Partnership>>({});
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [editBusinessHours, setEditBusinessHours] = useState<Record<string, BusinessHourEdit>>({});
  
  // 거부 다이얼로그 상태
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // 편의시설 및 이미지 편집 상태
  const [newAmenity, setNewAmenity] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // 운영시간 파싱 함수
  const parseBusinessHours = (businessHours: Record<string, string>): Record<string, BusinessHourEdit> => {
    const parsed: Record<string, BusinessHourEdit> = {};
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    
    days.forEach(day => {
      const hours = businessHours[day];
      if (hours && hours !== '24시간') {
        const [open, close] = hours.split('-');
        parsed[day] = {
          enabled: true,
          open: open || '09:00',
          close: close || '18:00'
        };
      } else {
        parsed[day] = {
          enabled: false,
          open: '09:00',
          close: '18:00'
        };
      }
    });
    
    return parsed;
  };

  // 제휴점 정보 로드
  const loadPartnership = async () => {
    if (!partnershipId) return;
    
    try {
      setLoading(true);
      // 전체 제휴점 목록에서 해당 ID 찾기 (개별 조회 API가 없어서)
      const response = await partnershipService.getAllPartnerships();
      if (response.success) {
        const foundPartnership = response.data.find((p: Partnership) => p.id === parseInt(partnershipId));
        if (foundPartnership) {
          setPartnership(foundPartnership);
          setEditData(foundPartnership);
          setEditBusinessHours(parseBusinessHours(foundPartnership.businessHours || {}));
        } else {
          setAlertMessage({type: 'error', message: '제휴점을 찾을 수 없습니다.'});
        }
      } else {
        setAlertMessage({type: 'error', message: '제휴점을 찾을 수 없습니다.'});
      }
    } catch (error) {
      console.error('제휴점 정보 로드 중 오류:', error);
      setAlertMessage({type: 'error', message: '제휴점 정보를 불러오는데 실패했습니다.'});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartnership();
  }, [partnershipId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // 취소
      setEditData(partnership || {});
      setEditBusinessHours(parseBusinessHours(partnership?.businessHours || {}));
    }
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    try {
      // 운영시간 데이터를 백엔드 형식으로 변환 (DTO의 BusinessHourDto 형식)
      const businessHoursPayload: Record<string, { enabled: boolean; open: string; close: string }> = {};
      Object.entries(editBusinessHours).forEach(([day, hours]) => {
        businessHoursPayload[day] = {
          enabled: hours.enabled,
          open: hours.open,
          close: hours.close
        };
      });

      const payload = {
        ...editData,
        businessHours: businessHoursPayload
      };

      const response = await axios.put(`/api/partnership/${partnershipId}`, payload);
      toast.success('제휴점 정보가 성공적으로 수정되었습니다.');
      setEditMode(false);
      await loadPartnership();
    } catch (error: any) {
      console.error('저장 중 오류:', error);
      const errorMessage = error.response?.data?.message || '저장에 실패했습니다.';
      toast.error(errorMessage);
      setAlertMessage({type: 'error', message: errorMessage});
    }
  };

  const handleStatusChange = async (newStatus: 'APPROVED' | 'REJECTED', reason?: string) => {
    try {
      setSubmitting(true);
      const payload: { status: string; rejectionReason?: string } = { status: newStatus };
      
      // 거부 시 거부 사유 추가
      if (newStatus === 'REJECTED' && reason) {
        payload.rejectionReason = reason;
      }
      
      const response = await axios.put(`/api/partnership/${partnershipId}/status`, payload);
      toast.success(response.data.message);
      
      if (newStatus === 'APPROVED') {
        toast.info('해당 사용자는 이제 파트너 기능을 사용할 수 있습니다.', {
          autoClose: 5000,
          position: 'top-center'
        });
      } else if (newStatus === 'REJECTED') {
        toast.info('거부 사유가 파트너 이메일로 전송되었습니다.', {
          autoClose: 5000,
          position: 'top-center'
        });
      }
      
      loadPartnership();
      
      // 다이얼로그 닫기 및 초기화
      setRejectDialogOpen(false);
      setRejectionReason('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '상태 업데이트에 실패했습니다.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  // 거부 버튼 클릭 핸들러
  const handleRejectClick = () => {
    setRejectDialogOpen(true);
  };
  
  // 거부 다이얼로그 확인
  const handleRejectConfirm = () => {
    if (!rejectionReason.trim()) {
      toast.error('거부 사유를 입력해주세요.');
      return;
    }
    
    handleStatusChange('REJECTED', rejectionReason.trim());
  };
  
  // 거부 다이얼로그 취소
  const handleRejectCancel = () => {
    setRejectDialogOpen(false);
    setRejectionReason('');
  };

  const handleInputChange = (field: keyof Partnership, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBusinessHourChange = (day: string, field: keyof BusinessHourEdit, value: any) => {
    setEditBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  // 편의시설 추가
  const handleAddAmenity = () => {
    if (!newAmenity.trim()) {
      toast.error('편의시설 이름을 입력해주세요.');
      return;
    }

    const currentAmenities = editData.amenities || partnership?.amenities || [];
    if (currentAmenities.includes(newAmenity.trim())) {
      toast.error('이미 등록된 편의시설입니다.');
      return;
    }

    setEditData(prev => ({
      ...prev,
      amenities: [...currentAmenities, newAmenity.trim()]
    }));
    setNewAmenity('');
  };

  // 편의시설 제거
  const handleRemoveAmenity = (amenityToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      amenities: (prev.amenities || partnership?.amenities || []).filter(a => a !== amenityToRemove)
    }));
  };

  // 이미지 업로드 (Base64 변환)
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const newImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 파일 크기 체크 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}: 파일 크기가 5MB를 초과합니다.`);
          continue;
        }

        // 이미지 파일인지 확인
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name}: 이미지 파일만 업로드 가능합니다.`);
          continue;
        }

        // Base64로 변환
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newImages.push(base64);
      }

      if (newImages.length > 0) {
        const currentPictures = editData.storePictures || partnership?.storePictures || [];
        setEditData(prev => ({
          ...prev,
          storePictures: [...currentPictures, ...newImages]
        }));
        toast.success(`${newImages.length}개의 이미지가 추가되었습니다.`);
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      toast.error('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploadingImage(false);
      // 파일 input 초기화
      event.target.value = '';
    }
  };

  // 이미지 제거
  const handleRemoveImage = (index: number) => {
    setEditData(prev => ({
      ...prev,
      storePictures: (prev.storePictures || partnership?.storePictures || []).filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        bgcolor: COLORS.backgroundDark
      }}>
        <CircularProgress sx={{ color: COLORS.accentPrimary }} />
      </Box>
    );
  }

  if (!partnership) {
    return (
      <Box sx={{ bgcolor: COLORS.backgroundDark, minHeight: '100vh', p: 3 }}>
        <Alert severity="error">제휴점을 찾을 수 없습니다.</Alert>
      </Box>
    );
  }

  const dayLabels: Record<string, string> = {
    'MONDAY': '월요일',
    'TUESDAY': '화요일',
    'WEDNESDAY': '수요일',
    'THURSDAY': '목요일',
    'FRIDAY': '금요일',
    'SATURDAY': '토요일',
    'SUNDAY': '일요일'
  };

  return (
    <Box sx={{ bgcolor: COLORS.backgroundDark, minHeight: '100vh', p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        pb: 2,
        borderBottom: `1px solid ${COLORS.borderPrimary}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/admin/partnerships')}
            sx={{ 
              color: COLORS.textSecondary,
              '&:hover': { 
                color: COLORS.accentPrimary,
                bgcolor: COLORS.backgroundHover 
              }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ 
              color: COLORS.textPrimary, 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Business sx={{ color: COLORS.accentPrimary }} />
              {editMode ? (
                <TextField
                  value={editData.businessName || ''}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  variant="standard"
                  size="small"
                  sx={{
                    '& .MuiInputBase-input': {
                      color: COLORS.textPrimary,
                      fontSize: '1.5rem',
                      fontWeight: 600
                    }
                  }}
                />
              ) : partnership.businessName}
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
              제휴점 상세정보
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip 
            label={
              partnership.status === 'PENDING' ? '검토중' : 
              partnership.status === 'APPROVED' ? '운영중' : '거절'
            }
            sx={{
              bgcolor: 
                partnership.status === 'PENDING' ? COLORS.warning : 
                partnership.status === 'APPROVED' ? COLORS.success : 
                COLORS.danger,
              color: 'white',
              fontWeight: 600
            }}
          />
          {editMode ? (
            <>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{
                  bgcolor: COLORS.success,
                  '&:hover': { bgcolor: COLORS.success, opacity: 0.8 }
                }}
              >
                저장
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleEditToggle}
                sx={{
                  color: COLORS.textSecondary,
                  borderColor: COLORS.borderSecondary,
                  '&:hover': { 
                    borderColor: COLORS.textSecondary,
                    bgcolor: COLORS.backgroundHover
                  }
                }}
              >
                취소
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={handleEditToggle}
              sx={{
                bgcolor: COLORS.accentPrimary,
                '&:hover': { bgcolor: COLORS.accentPrimary, opacity: 0.8 }
              }}
            >
              수정
            </Button>
          )}
        </Box>
      </Box>

      {alertMessage && (
        <Alert 
          severity={alertMessage.type} 
          onClose={() => setAlertMessage(null)}
          sx={{ mb: 2 }}
        >
          {alertMessage.message}
        </Alert>
      )}

      {/* 탭 */}
      <Paper 
        elevation={0} 
        sx={{ 
          bgcolor: COLORS.backgroundCard, 
          border: `1px solid ${COLORS.borderPrimary}`,
          borderRadius: 0
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: `1px solid ${COLORS.borderSecondary}`,
            '& .MuiTab-root': {
              color: COLORS.textSecondary,
              '&.Mui-selected': {
                color: COLORS.accentPrimary
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: COLORS.accentPrimary
            }
          }}
        >
          <Tab label="기본 정보" />
          <Tab label="운영 정보" />
          <Tab label="보관 용량" />
          <Tab label="매장 정보" />
          <Tab label="서류 & 계좌" />
          <Tab label="관리" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: COLORS.backgroundSurface, border: `1px solid ${COLORS.borderSecondary}` }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business sx={{ color: COLORS.accentPrimary }} />
                    사업체 정보
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        상호명
                      </Typography>
                      {editMode ? (
                        <TextField
                          fullWidth
                          value={editData.businessName || ''}
                          onChange={(e) => handleInputChange('businessName', e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiInputBase-input': { color: COLORS.textPrimary },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                          {partnership.businessName}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        대표자명
                      </Typography>
                      {editMode ? (
                        <TextField
                          fullWidth
                          value={editData.ownerName || ''}
                          onChange={(e) => handleInputChange('ownerName', e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiInputBase-input': { color: COLORS.textPrimary },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                          {partnership.ownerName}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        업종
                      </Typography>
                      {editMode ? (
                        <TextField
                          fullWidth
                          value={editData.businessType || ''}
                          onChange={(e) => handleInputChange('businessType', e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiInputBase-input': { color: COLORS.textPrimary },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                          {partnership.businessType}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        공간 규모
                      </Typography>
                      {editMode ? (
                        <TextField
                          fullWidth
                          value={editData.spaceSize || ''}
                          onChange={(e) => handleInputChange('spaceSize', e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiInputBase-input': { color: COLORS.textPrimary },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                          {partnership.spaceSize}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: COLORS.backgroundSurface, border: `1px solid ${COLORS.borderSecondary}` }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ color: COLORS.accentPrimary }} />
                    연락처 정보
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        이메일
                      </Typography>
                      {editMode ? (
                        <TextField
                          fullWidth
                          value={editData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiInputBase-input': { color: COLORS.textPrimary },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                          {partnership.email}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        전화번호
                      </Typography>
                      {editMode ? (
                        <TextField
                          fullWidth
                          value={editData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiInputBase-input': { color: COLORS.textPrimary },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                          {partnership.phone}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        주소
                      </Typography>
                      {editMode ? (
                        <TextField
                          fullWidth
                          value={editData.address || ''}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          size="small"
                          multiline
                          rows={2}
                          sx={{
                            '& .MuiInputBase-input': { color: COLORS.textPrimary },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                          {partnership.address}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        좌표
                      </Typography>
                      {editMode ? (
                        <Stack direction="row" spacing={1}>
                          <TextField
                            label="위도"
                            value={editData.latitude || ''}
                            onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
                            size="small"
                            type="number"
                            sx={{
                              '& .MuiInputBase-input': { color: COLORS.textPrimary },
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary },
                              '& .MuiInputLabel-root': { color: COLORS.textSecondary }
                            }}
                          />
                          <TextField
                            label="경도"
                            value={editData.longitude || ''}
                            onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
                            size="small"
                            type="number"
                            sx={{
                              '& .MuiInputBase-input': { color: COLORS.textPrimary },
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary },
                              '& .MuiInputLabel-root': { color: COLORS.textSecondary }
                            }}
                          />
                        </Stack>
                      ) : (
                        <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                          위도: {partnership.latitude}, 경도: {partnership.longitude}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: COLORS.backgroundSurface, border: `1px solid ${COLORS.borderSecondary}` }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ color: COLORS.accentPrimary }} />
                    운영 시간
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={editMode ? (editData.is24Hours || false) : partnership.is24Hours}
                            onChange={(e) => handleInputChange('is24Hours', e.target.checked)}
                            disabled={!editMode}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: COLORS.accentPrimary
                              }
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                            24시간 운영
                          </Typography>
                        }
                      />
                    </Box>
                    
                    {!((editMode ? editData.is24Hours : partnership.is24Hours) || false) && (
                      <Box>
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 2, fontWeight: 600 }}>
                          요일별 운영 시간
                        </Typography>
                        <Stack spacing={2}>
                          {Object.entries(dayLabels).map(([dayKey, dayName]) => (
                            <Box 
                              key={dayKey} 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2,
                                p: 2,
                                bgcolor: COLORS.backgroundCard,
                                borderRadius: 1,
                                border: `1px solid ${COLORS.borderSecondary}`
                              }}
                            >
                              {editMode ? (
                                <>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={editBusinessHours[dayKey]?.enabled || false}
                                        onChange={(e) => handleBusinessHourChange(dayKey, 'enabled', e.target.checked)}
                                        sx={{
                                          '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: COLORS.accentPrimary
                                          }
                                        }}
                                      />
                                    }
                                    label={
                                      <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500, minWidth: 60 }}>
                                        {dayName}
                                      </Typography>
                                    }
                                  />
                                  {editBusinessHours[dayKey]?.enabled && (
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
                                      <TextField
                                        type="time"
                                        value={editBusinessHours[dayKey]?.open || '09:00'}
                                        onChange={(e) => handleBusinessHourChange(dayKey, 'open', e.target.value)}
                                        size="small"
                                        sx={{
                                          '& .MuiInputBase-input': { color: COLORS.textPrimary },
                                          '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                                        }}
                                      />
                                      <Typography sx={{ color: COLORS.textSecondary }}>~</Typography>
                                      <TextField
                                        type="time"
                                        value={editBusinessHours[dayKey]?.close || '18:00'}
                                        onChange={(e) => handleBusinessHourChange(dayKey, 'close', e.target.value)}
                                        size="small"
                                        sx={{
                                          '& .MuiInputBase-input': { color: COLORS.textPrimary },
                                          '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                                        }}
                                      />
                                    </Box>
                                  )}
                                  {!editBusinessHours[dayKey]?.enabled && (
                                    <Typography sx={{ color: COLORS.textMuted, flex: 1 }}>
                                      휴무
                                    </Typography>
                                  )}
                                </>
                              ) : (
                                <>
                                  <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500, minWidth: 100 }}>
                                    {dayName}
                                  </Typography>
                                  <Typography variant="body1" sx={{ color: COLORS.textSecondary }}>
                                    {partnership.businessHours[dayKey] || '휴무'}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ bgcolor: COLORS.backgroundSurface, border: `1px solid ${COLORS.borderSecondary}` }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info sx={{ color: COLORS.accentPrimary }} />
                    추가 정보
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        신청 ID
                      </Typography>
                      <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                        {partnership.submissionId}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        신청일
                      </Typography>
                      <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                        {formatDateTime(partnership.createdAt)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        약관 동의
                      </Typography>
                      <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                        {partnership.agreeTerms ? '동의함' : '동의하지 않음'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        추가 정보
                      </Typography>
                      {editMode ? (
                        <TextField
                          fullWidth
                          value={editData.additionalInfo || ''}
                          onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                          size="small"
                          multiline
                          rows={3}
                          sx={{
                            '& .MuiInputBase-input': { color: COLORS.textPrimary },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                          {partnership.additionalInfo || '-'}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card sx={{ bgcolor: COLORS.backgroundSurface, border: `1px solid ${COLORS.borderSecondary}` }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 3 }}>
                보관 용량 관리
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                      소형 가방 보관 가능 개수
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        type="number"
                        value={editData.smallBagsAvailable ?? partnership.smallBagsAvailable ?? 0}
                        onChange={(e) => handleInputChange('smallBagsAvailable', parseInt(e.target.value) || 0)}
                        size="small"
                        sx={{
                          '& .MuiInputBase-input': { color: COLORS.textPrimary },
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                        }}
                      />
                    ) : (
                      <Typography variant="h5" sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>
                        {partnership.smallBagsAvailable ?? 0}개
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                      중형 가방 보관 가능 개수
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        type="number"
                        value={editData.mediumBagsAvailable ?? partnership.mediumBagsAvailable ?? 0}
                        onChange={(e) => handleInputChange('mediumBagsAvailable', parseInt(e.target.value) || 0)}
                        size="small"
                        sx={{
                          '& .MuiInputBase-input': { color: COLORS.textPrimary },
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                        }}
                      />
                    ) : (
                      <Typography variant="h5" sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>
                        {partnership.mediumBagsAvailable ?? 0}개
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                      대형 가방 보관 가능 개수
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        type="number"
                        value={editData.largeBagsAvailable ?? partnership.largeBagsAvailable ?? 0}
                        onChange={(e) => handleInputChange('largeBagsAvailable', parseInt(e.target.value) || 0)}
                        size="small"
                        sx={{
                          '& .MuiInputBase-input': { color: COLORS.textPrimary },
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                        }}
                      />
                    ) : (
                      <Typography variant="h5" sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>
                        {partnership.largeBagsAvailable ?? 0}개
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: COLORS.backgroundSurface, border: `1px solid ${COLORS.borderSecondary}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: COLORS.textPrimary, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Image sx={{ color: COLORS.accentPrimary }} />
                      매장 사진
                    </Typography>
                    {editMode && (
                      <Button
                        variant="contained"
                        component="label"
                        disabled={uploadingImage}
                        startIcon={uploadingImage ? <CircularProgress size={16} /> : <Image />}
                        sx={{
                          bgcolor: COLORS.accentPrimary,
                          '&:hover': { bgcolor: COLORS.accentPrimary, opacity: 0.8 }
                        }}
                      >
                        {uploadingImage ? '업로드 중...' : '사진 추가'}
                        <input
                          type="file"
                          hidden
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </Button>
                    )}
                  </Box>
                  {(editData.storePictures || partnership.storePictures) && (editData.storePictures || partnership.storePictures || []).length > 0 ? (
                    <Grid container spacing={2}>
                      {(editData.storePictures || partnership.storePictures || []).map((picture, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box sx={{
                            position: 'relative',
                            paddingTop: '75%',
                            bgcolor: COLORS.backgroundCard,
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: `1px solid ${COLORS.borderSecondary}`
                          }}>
                            <img
                              src={picture}
                              alt={`매장 사진 ${index + 1}`}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                            {editMode && (
                              <IconButton
                                onClick={() => handleRemoveImage(index)}
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  bgcolor: alpha(COLORS.danger, 0.9),
                                  color: 'white',
                                  '&:hover': {
                                    bgcolor: COLORS.danger
                                  }
                                }}
                                size="small"
                              >
                                <Cancel />
                              </IconButton>
                            )}
                          </Box>
                          <Typography variant="caption" sx={{ color: COLORS.textSecondary, display: 'block', mt: 1, textAlign: 'center' }}>
                            사진 {index + 1}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: COLORS.textMuted,
                      bgcolor: COLORS.backgroundCard,
                      borderRadius: 1,
                      border: `1px solid ${COLORS.borderSecondary}`
                    }}>
                      <Image sx={{ fontSize: '3rem', mb: 1, opacity: 0.3 }} />
                      <Typography variant="body2">
                        등록된 매장 사진이 없습니다
                      </Typography>
                      {editMode && (
                        <Button
                          variant="outlined"
                          component="label"
                          disabled={uploadingImage}
                          sx={{
                            mt: 2,
                            color: COLORS.accentPrimary,
                            borderColor: COLORS.accentPrimary
                          }}
                        >
                          사진 추가하기
                          <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </Button>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ bgcolor: COLORS.backgroundSurface, border: `1px solid ${COLORS.borderSecondary}` }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalOffer sx={{ color: COLORS.accentPrimary }} />
                    편의시설 및 서비스
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1.5 }}>
                        제공 편의시설
                      </Typography>
                      
                      {/* 편의시설 추가 (편집 모드) */}
                      {editMode && (
                        <Box sx={{ mb: 2 }}>
                          <Stack direction="row" spacing={1}>
                            <TextField
                              size="small"
                              placeholder="편의시설 입력 (예: WiFi, 에어컨, CCTV)"
                              value={newAmenity}
                              onChange={(e) => setNewAmenity(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddAmenity();
                                }
                              }}
                              sx={{
                                flex: 1,
                                '& .MuiInputBase-input': { color: COLORS.textPrimary },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderSecondary }
                              }}
                            />
                            <Button
                              variant="contained"
                              onClick={handleAddAmenity}
                              sx={{
                                bgcolor: COLORS.accentPrimary,
                                '&:hover': { bgcolor: COLORS.accentPrimary, opacity: 0.8 }
                              }}
                            >
                              추가
                            </Button>
                          </Stack>
                        </Box>
                      )}

                      {/* 편의시설 목록 */}
                      {(editData.amenities || partnership.amenities) && (editData.amenities || partnership.amenities || []).length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {(editData.amenities || partnership.amenities || []).map((amenity, index) => (
                            <Chip
                              key={index}
                              label={amenity}
                              size="medium"
                              onDelete={editMode ? () => handleRemoveAmenity(amenity) : undefined}
                              deleteIcon={editMode ? <Cancel /> : undefined}
                              sx={{
                                bgcolor: alpha(COLORS.accentPrimary, 0.15),
                                color: COLORS.accentPrimary,
                                fontWeight: 600,
                                border: `1px solid ${alpha(COLORS.accentPrimary, 0.3)}`,
                                '& .MuiChip-deleteIcon': {
                                  color: COLORS.danger,
                                  '&:hover': {
                                    color: COLORS.danger,
                                    opacity: 0.8
                                  }
                                }
                              }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body1" sx={{ color: COLORS.textMuted }}>
                          {editMode ? '편의시설을 추가해주세요' : '등록된 편의시설이 없습니다'}
                        </Typography>
                      )}
                    </Box>
                    <Divider sx={{ bgcolor: COLORS.borderSecondary }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                        보험 가능 여부
                      </Typography>
                      {editMode ? (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={editData.insuranceAvailable ?? partnership.insuranceAvailable ?? false}
                              onChange={(e) => handleInputChange('insuranceAvailable', e.target.checked)}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: COLORS.success
                                }
                              }}
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>
                              {editData.insuranceAvailable ?? partnership.insuranceAvailable ? '보험 가능' : '보험 불가'}
                            </Typography>
                          }
                        />
                      ) : (
                        <Chip
                          label={partnership.insuranceAvailable ? '보험 가능' : '보험 불가'}
                          sx={{
                            bgcolor: partnership.insuranceAvailable 
                              ? alpha(COLORS.success, 0.15) 
                              : alpha(COLORS.textMuted, 0.15),
                            color: partnership.insuranceAvailable ? COLORS.success : COLORS.textMuted,
                            fontWeight: 600,
                            border: `1px solid ${partnership.insuranceAvailable 
                              ? alpha(COLORS.success, 0.3) 
                              : alpha(COLORS.textMuted, 0.3)}`
                          }}
                        />
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: COLORS.backgroundSurface, border: `1px solid ${COLORS.borderSecondary}` }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description sx={{ color: COLORS.accentPrimary }} />
                    사업자등록증
                  </Typography>
                  {partnership.businessRegistrationUrl ? (
                    <Box>
                      <Box sx={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '500px',
                        mx: 'auto',
                        bgcolor: COLORS.backgroundCard,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: `1px solid ${COLORS.borderSecondary}`
                      }}>
                        <img
                          src={partnership.businessRegistrationUrl}
                          alt="사업자등록증"
                          style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block'
                          }}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        href={partnership.businessRegistrationUrl}
                        target="_blank"
                        sx={{
                          mt: 2,
                          display: 'block',
                          mx: 'auto',
                          color: COLORS.accentPrimary,
                          borderColor: COLORS.accentPrimary,
                          '&:hover': {
                            borderColor: COLORS.accentPrimary,
                            bgcolor: alpha(COLORS.accentPrimary, 0.1)
                          }
                        }}
                      >
                        새 탭에서 크게 보기
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 6,
                      color: COLORS.textMuted,
                      bgcolor: COLORS.backgroundCard,
                      borderRadius: 1,
                      border: `1px solid ${COLORS.borderSecondary}`
                    }}>
                      <Description sx={{ fontSize: '3rem', mb: 1, opacity: 0.3 }} />
                      <Typography variant="body2">
                        사업자등록증이 등록되지 않았습니다
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: COLORS.backgroundSurface, border: `1px solid ${COLORS.borderSecondary}` }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalance sx={{ color: COLORS.accentPrimary }} />
                    통장사본
                  </Typography>
                  {partnership.bankBookUrl ? (
                    <Box>
                      <Box sx={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '500px',
                        mx: 'auto',
                        bgcolor: COLORS.backgroundCard,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: `1px solid ${COLORS.borderSecondary}`
                      }}>
                        <img
                          src={partnership.bankBookUrl}
                          alt="통장사본"
                          style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block'
                          }}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        href={partnership.bankBookUrl}
                        target="_blank"
                        sx={{
                          mt: 2,
                          display: 'block',
                          mx: 'auto',
                          color: COLORS.accentPrimary,
                          borderColor: COLORS.accentPrimary,
                          '&:hover': {
                            borderColor: COLORS.accentPrimary,
                            bgcolor: alpha(COLORS.accentPrimary, 0.1)
                          }
                        }}
                      >
                        새 탭에서 크게 보기
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 6,
                      color: COLORS.textMuted,
                      bgcolor: COLORS.backgroundCard,
                      borderRadius: 1,
                      border: `1px solid ${COLORS.borderSecondary}`
                    }}>
                      <AccountBalance sx={{ fontSize: '3rem', mb: 1, opacity: 0.3 }} />
                      <Typography variant="body2">
                        통장사본이 등록되지 않았습니다
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ bgcolor: COLORS.backgroundSurface, border: `1px solid ${COLORS.borderSecondary}` }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalance sx={{ color: COLORS.accentPrimary }} />
                    계좌 정보
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                          은행명
                        </Typography>
                        <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                          {partnership.bankName || '-'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                          계좌번호
                        </Typography>
                        <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                          {partnership.accountNumber || '-'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                          예금주
                        </Typography>
                        <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                          {partnership.accountHolder || '-'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Card sx={{ bgcolor: COLORS.backgroundSurface, border: `1px solid ${COLORS.borderSecondary}` }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 3 }}>
                상태 관리
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                  현재 상태
                </Typography>
                <Chip 
                  label={
                    partnership.status === 'PENDING' ? '검토중' : 
                    partnership.status === 'APPROVED' ? '운영중' : '거절'
                  }
                  sx={{
                    bgcolor: 
                      partnership.status === 'PENDING' ? COLORS.warning : 
                      partnership.status === 'APPROVED' ? COLORS.success : 
                      COLORS.danger,
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 2 }}>
                상태 변경
              </Typography>
              
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<CheckCircle />}
                  onClick={() => handleStatusChange('APPROVED')}
                  disabled={partnership.status === 'APPROVED'}
                  sx={{
                    bgcolor: COLORS.success,
                    '&:hover': { bgcolor: COLORS.success, opacity: 0.8 },
                    '&:disabled': { bgcolor: COLORS.textMuted }
                  }}
                >
                  승인 (운영중으로 변경)
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Cancel />}
                  onClick={handleRejectClick}
                  disabled={partnership.status === 'REJECTED'}
                  sx={{
                    bgcolor: COLORS.danger,
                    '&:hover': { bgcolor: COLORS.danger, opacity: 0.8 },
                    '&:disabled': { bgcolor: COLORS.textMuted }
                  }}
                >
                  거절
                </Button>
              </Stack>
              
              {partnership.status === 'APPROVED' && (
                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: COLORS.backgroundCard, 
                  border: `1px solid ${COLORS.success}`,
                  borderRadius: 1
                }}>
                  <Typography variant="body2" sx={{ color: COLORS.success, fontWeight: 600 }}>
                    ✓ 현재 운영중인 제휴점입니다
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary, display: 'block', mt: 1 }}>
                    이 제휴점은 고객들에게 표시되며, 예약을 받을 수 있습니다.
                  </Typography>
                </Box>
              )}
              
              {partnership.status === 'PENDING' && (
                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: COLORS.backgroundCard, 
                  border: `1px solid ${COLORS.warning}`,
                  borderRadius: 1
                }}>
                  <Typography variant="body2" sx={{ color: COLORS.warning, fontWeight: 600 }}>
                    ⚠ 검토 대기중입니다
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary, display: 'block', mt: 1 }}>
                    승인 후 제휴점으로 운영할 수 있습니다.
                  </Typography>
                </Box>
              )}
              
              {partnership.status === 'REJECTED' && (
                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: COLORS.backgroundCard, 
                  border: `1px solid ${COLORS.danger}`,
                  borderRadius: 1
                }}>
                  <Typography variant="body2" sx={{ color: COLORS.danger, fontWeight: 600 }}>
                    ✕ 거절된 제휴 신청입니다
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary, display: 'block', mt: 1 }}>
                    이 제휴점은 고객들에게 표시되지 않습니다.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
      
      {/* 거부 사유 입력 다이얼로그 */}
      <Dialog
        open={rejectDialogOpen}
        onClose={handleRejectCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: COLORS.backgroundCard,
            border: `1px solid ${COLORS.borderSecondary}`,
            borderRadius: 0
          }
        }}
      >
        <DialogTitle sx={{ 
          color: COLORS.textPrimary,
          borderBottom: `1px solid ${COLORS.borderSecondary}`,
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Cancel sx={{ color: COLORS.danger }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              제휴 신청 거부
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 3 }}>
          <DialogContentText sx={{ color: COLORS.textSecondary, mb: 3 }}>
            거부 사유를 입력해주세요. 입력하신 내용은 신청자의 이메일로 전송됩니다.
          </DialogContentText>
          
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={6}
            label="거부 사유"
            placeholder="예: 매장 위치가 서비스 가능 지역이 아닙니다.&#10;필요한 서류가 제출되지 않았습니다.&#10;사업자 정보가 확인되지 않습니다."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
            sx={{
              '& .MuiInputBase-root': {
                bgcolor: COLORS.backgroundSurface,
                color: COLORS.textPrimary
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: COLORS.borderSecondary
              },
              '& .MuiInputLabel-root': {
                color: COLORS.textSecondary
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: COLORS.danger
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: COLORS.danger,
                borderWidth: 2
              }
            }}
            helperText={`${rejectionReason.length}/500자`}
            inputProps={{ maxLength: 500 }}
          />
          
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            bgcolor: alpha(COLORS.danger, 0.1),
            border: `1px solid ${alpha(COLORS.danger, 0.3)}`,
            borderRadius: 1
          }}>
            <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontSize: '0.875rem' }}>
              <strong style={{ color: COLORS.danger }}>⚠️ 주의:</strong> 거부 처리 시 해당 내용이 신청자에게 이메일로 전송되며, 
              제휴 신청 상태가 "거절"로 변경됩니다.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          borderTop: `1px solid ${COLORS.borderSecondary}`,
          gap: 1
        }}>
          <Button
            onClick={handleRejectCancel}
            disabled={submitting}
            sx={{
              color: COLORS.textSecondary,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: COLORS.backgroundHover
              }
            }}
          >
            취소
          </Button>
          <Button
            onClick={handleRejectConfirm}
            disabled={submitting || !rejectionReason.trim()}
            variant="contained"
            sx={{
              bgcolor: COLORS.danger,
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                bgcolor: COLORS.danger,
                opacity: 0.8
              },
              '&:disabled': {
                bgcolor: COLORS.textMuted,
                color: COLORS.backgroundCard
              }
            }}
          >
            {submitting ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1, color: '#fff' }} />
                처리 중...
              </>
            ) : (
              '거부 확인'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PartnershipDetail;
