import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import {
  DirectionsCar,
  Assignment
} from '@mui/icons-material';
import RiderApplicationsTab from '../../components/admin/RiderApplicationsTab';
import ApprovedRidersTab from '../../components/admin/ApprovedRidersTab';
import { adminRiderService, RiderStats } from '../../services/api';

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
      id={`rider-tabpanel-${index}`}
      aria-labelledby={`rider-tab-${index}`}
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

// ERP 색상 정의 (AdminDashboard와 동일)
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

const AdminRiders = () => {
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<RiderStats>({
    totalRiders: 0,
    onlineRiders: 0,
    offlineRiders: 0,
    inactiveRiders: 0
  });
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminRiderService.getRiderStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('라이더 통계 로드 실패:', error);

      // 404 에러 (API 미구현)인 경우 샘플 데이터로 대체
      if (error.response?.status === 404) {
        console.log('백엔드 API가 아직 구현되지 않았습니다. 샘플 데이터를 사용합니다.');
        setStats({
          totalRiders: 0,
          onlineRiders: 0,
          offlineRiders: 0,
          inactiveRiders: 0
        });
      } else {
        // 다른 에러는 사용자에게 알림
        setAlertMessage({
          type: 'error',
          message: '라이더 통계를 불러오는데 실패했습니다.'
        });
        setTimeout(() => setAlertMessage(null), 3000);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 탭 변경 시 통계 새로고침
  useEffect(() => {
    if (tabValue === 1) {
      fetchStats();
    }
  }, [tabValue]);

  return (
    <Box sx={{
      bgcolor: COLORS.backgroundDark,
      width: '100%',
      minHeight: '100vh',
      p: 2.5
    }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{
        color: COLORS.textPrimary,
        mb: 3
      }}>
        라이더 관리
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

      {/* 라이더 통계 */}
      {tabValue === 1 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 1
            }} elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <DirectionsCar sx={{ fontSize: 20, color: COLORS.textSecondary }} />
                  <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                    전체 라이더
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="600" sx={{ color: COLORS.textPrimary }}>
                  {stats.totalRiders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 1
            }} elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: COLORS.success
                  }} />
                  <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                    온라인
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="600" sx={{ color: COLORS.success }}>
                  {stats.onlineRiders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 1
            }} elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: COLORS.textMuted
                  }} />
                  <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                    오프라인
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="600" sx={{ color: COLORS.textPrimary }}>
                  {stats.offlineRiders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 1
            }} elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: COLORS.danger
                  }} />
                  <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                    비활성
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="600" sx={{ color: COLORS.textPrimary }}>
                  {stats.inactiveRiders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{
        borderRadius: 1,
        bgcolor: COLORS.backgroundCard,
        border: `1px solid ${COLORS.borderPrimary}`
      }} elevation={0}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: COLORS.borderPrimary,
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
          <Tab label="라이더 신청 관리" icon={<Assignment />} iconPosition="start" />
          <Tab label="라이더 목록" icon={<DirectionsCar />} iconPosition="start" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <RiderApplicationsTab />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ApprovedRidersTab />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AdminRiders;
