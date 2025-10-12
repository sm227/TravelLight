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
  InputLabel
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
  Info
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

  const handleStatusChange = async (newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await axios.put(`/api/partnership/${partnershipId}/status`, { status: newStatus });
      toast.success(response.data.message);
      
      if (newStatus === 'APPROVED') {
        toast.info('해당 사용자는 이제 파트너 기능을 사용할 수 있습니다.', {
          autoClose: 5000,
          position: 'top-center'
        });
      }
      
      loadPartnership();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '상태 업데이트에 실패했습니다.';
      toast.error(errorMessage);
    }
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
                  onClick={() => handleStatusChange('REJECTED')}
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
    </Box>
  );
};

export default PartnershipDetail;
