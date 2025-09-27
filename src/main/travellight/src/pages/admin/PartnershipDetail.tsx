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
  FormControlLabel
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
    }
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    try {
      // 상태 변경 API 호출 (기존 API 사용)
      if (editData.status && editData.status !== partnership?.status) {
        await axios.put(`/api/partnership/${partnershipId}/status`, { status: editData.status });
        toast.success('상태가 업데이트되었습니다.');
        loadPartnership();
      }
      setEditMode(false);
    } catch (error) {
      console.error('저장 중 오류:', error);
      setAlertMessage({type: 'error', message: '저장에 실패했습니다.'});
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
    'monday': '월요일',
    'tuesday': '화요일',
    'wednesday': '수요일',
    'thursday': '목요일',
    'friday': '금요일',
    'saturday': '토요일',
    'sunday': '일요일'
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
              {partnership.businessName}
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
              제휴점 상세정보
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={
              partnership.status === 'PENDING' ? '대기중' : 
              partnership.status === 'APPROVED' ? '승인됨' : '거절됨'
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
                      <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                        {partnership.businessName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        대표자명
                      </Typography>
                      <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                        {partnership.ownerName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        업종
                      </Typography>
                      <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                        {partnership.businessType}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        공간 규모
                      </Typography>
                      <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                        {partnership.spaceSize}
                      </Typography>
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
                      <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                        {partnership.email}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        전화번호
                      </Typography>
                      <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                        {partnership.phone}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        주소
                      </Typography>
                      <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                        {partnership.address}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        좌표
                      </Typography>
                      <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                        위도: {partnership.latitude}, 경도: {partnership.longitude}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: COLORS.backgroundSurface, border: `1px solid ${COLORS.borderSecondary}` }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ color: COLORS.accentPrimary }} />
                    운영 시간
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                        24시간 운영: {partnership.is24Hours ? '예' : '아니오'}
                      </Typography>
                    </Box>
                    {!partnership.is24Hours && (
                      <Box>
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                          운영 시간
                        </Typography>
                        {Object.entries(partnership.businessHours).map(([day, hours]) => (
                          <Box key={day} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                            <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
                              {dayLabels[day]}
                            </Typography>
                            <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>
                              {hours || '휴무'}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
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
                    {partnership.additionalInfo && (
                      <Box>
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                          추가 정보
                        </Typography>
                        <Typography variant="body1" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                          {partnership.additionalInfo}
                        </Typography>
                      </Box>
                    )}
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
                상태 관리
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                  현재 상태
                </Typography>
                <Chip 
                  label={
                    partnership.status === 'PENDING' ? '대기중' : 
                    partnership.status === 'APPROVED' ? '승인됨' : '거절됨'
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
                  승인
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
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PartnershipDetail;
