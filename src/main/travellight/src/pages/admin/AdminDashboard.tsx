import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  LinearProgress,
  Paper,
  useTheme,
  alpha,
  Divider,
  Tabs,
  Tab,
  Chip,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  LuggageOutlined,
  LocalShippingOutlined,
  AccountBalanceWalletOutlined,
  StorefrontOutlined,
  TrendingUp,
  TrendingDown,
  CompareArrows,
  Warning,
  CheckCircle,
  AccessTime
} from '@mui/icons-material';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// 색상 정의 (CSS 변수 대신 직접 색상 정의)
const COLORS = {
  backgroundDark: '#111217',
  backgroundLight: '#181b1f',
  textPrimary: '#e9edf2',
  textSecondary: '#8e8e8e',
  borderColor: '#202226',
  accentColor: '#3788FC',
  successColor: '#52B455',
  warningColor: '#E6C220',
  dangerColor: '#E0684B',
  backgroundHover: 'rgba(255, 255, 255, 0.05)'
};

// 실시간 매출 데이터
const revenueData = [
  { time: '00:00', 보관: 150000, 배송: 100000 },
  { time: '03:00', 보관: 100000, 배송: 80000 },
  { time: '06:00', 보관: 180000, 배송: 120000 },
  { time: '09:00', 보관: 350000, 배송: 230000 },
  { time: '12:00', 보관: 450000, 배송: 250000 },
  { time: '15:00', 보관: 320000, 배송: 200000 },
  { time: '18:00', 보관: 280000, 배송: 170000 },
  { time: '21:00', 보관: 200000, 배송: 130000 },
];

// 보관함 위치별 사용률
const lockerUsageByLocation = [
  { name: '서울역', usage: 85, total: 100, 소형: 25, 중형: 40, 대형: 20 },
  { name: '인천공항 T1', usage: 75, total: 150, 소형: 40, 중형: 60, 대형: 25 },
  { name: '인천공항 T2', usage: 65, total: 120, 소형: 30, 중형: 35, 대형: 13 },
  { name: '부산역', usage: 55, total: 80, 소형: 20, 중형: 18, 대형: 6 },
  { name: '김포공항', usage: 70, total: 60, 소형: 15, 중형: 20, 대형: 7 },
  { name: '대전역', usage: 50, total: 50, 소형: 12, 중형: 10, 대형: 3 },
];

// 주간 예약 추이 데이터
const weeklyBookingData = [
  { day: '월', 보관: 120, 배송: 80 },
  { day: '화', 보관: 140, 배송: 90 },
  { day: '수', 보관: 130, 배송: 85 },
  { day: '목', 보관: 170, 배송: 110 },
  { day: '금', 보관: 190, 배송: 130 },
  { day: '토', 보관: 220, 배송: 150 },
  { day: '일', 보관: 200, 배송: 140 },
];

// 서비스 유형 데이터
const serviceTypeData = [
  { name: '당일 보관', value: 40, revenue: 1850000 },
  { name: '장기 보관', value: 25, revenue: 3200000 },
  { name: '일반 배송', value: 20, revenue: 1500000 },
  { name: '특급 배송', value: 15, revenue: 2300000 },
];

// 최근 고객 활동
const recentActivities = [
  { id: 'A12345', type: '보관', location: '서울역', size: '중형', time: '10분 전', status: '진행중', amount: 12000 },
  { id: 'B23456', type: '배송', from: '인천공항 T1', to: '서울 강남구', size: '대형', time: '25분 전', status: '접수완료', amount: 35000 },
  { id: 'A34567', type: '보관', location: '부산역', size: '소형', time: '45분 전', status: '완료', amount: 8000 },
  { id: 'B45678', type: '배송', from: '김포공항', to: '서울 마포구', size: '중형', time: '1시간 전', status: '배송중', amount: 22000 },
  { id: 'A56789', type: '보관', location: '인천공항 T2', size: '대형', time: '2시간 전', status: '완료', amount: 18000 },
];

// 알림 및 경고
const alertsData = [
  { id: 1, type: '경고', message: '인천공항 T1 대형 보관함 #15 문 센서 오작동', time: '15분 전', resolved: false },
  { id: 2, type: '알림', message: '서울역 보관함 사용률 90% 초과', time: '45분 전', resolved: false },
  { id: 3, type: '경고', message: '부산역 소형 보관함 #8 온도 이상 감지', time: '1시간 전', resolved: true },
];

const AdminDashboard = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('오늘');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 오늘의 전체 매출 계산
  const todayTotalRevenue = revenueData.reduce((sum, item) => sum + item.보관 + item.배송, 0);
  
  // 보관함 전체 현황 계산
  const totalLockers = lockerUsageByLocation.reduce((sum, item) => sum + item.total, 0);
  const usedLockers = lockerUsageByLocation.reduce((sum, item) => sum + Math.floor(item.total * item.usage / 100), 0);
  
  // 실시간 현황 카드 데이터
  const summaryCards = [
    {
      title: '오늘의 매출',
      value: todayTotalRevenue,
      format: (val: number) => `₩${val.toLocaleString()}`,
      icon: <AccountBalanceWalletOutlined />,
      color: theme.palette.primary.main,
      change: '+12.5%',
      trend: 'up'
    },
    {
      title: '전체 보관함 사용률',
      value: Math.round((usedLockers / totalLockers) * 100),
      format: (val: number) => `${val}%`,
      icon: <StorefrontOutlined />,
      color: theme.palette.success.main,
      change: '+5.2%',
      trend: 'up'
    },
    {
      title: '금일 신규 예약',
      value: 248,
      format: (val: number) => val.toString(),
      icon: <LuggageOutlined />,
      color: theme.palette.info.main,
      change: '-3.8%',
      trend: 'down'
    },
    {
      title: '진행중인 배송',
      value: 32,
      format: (val: number) => val.toString(),
      icon: <LocalShippingOutlined />,
      color: theme.palette.warning.main,
      change: '+8.7%',
      trend: 'up'
    },
  ];

  return (
    <Box sx={{ p: 2, bgcolor: COLORS.backgroundDark, width: '100%' }}>
      {/* 헤더 및 시간 범위 선택 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
          TravelLight 서비스 현황
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {['오늘', '어제', '이번주', '이번달'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "contained" : "outlined"}
              size="small"
              onClick={() => setTimeRange(range)}
              sx={{
                fontSize: '0.75rem',
                color: timeRange === range ? 'white' : COLORS.textSecondary,
                borderColor: COLORS.borderColor,
                backgroundColor: timeRange === range ? COLORS.accentColor : 'transparent',
                '&:hover': {
                  backgroundColor: timeRange === range ? COLORS.accentColor : COLORS.backgroundHover,
                }
              }}
            >
              {range}
            </Button>
          ))}
        </Box>
      </Box>

      {/* 요약 카드 섹션 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: COLORS.backgroundLight,
                borderLeft: `3px solid ${card.color}`,
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" sx={{ color: COLORS.textPrimary, fontWeight: 500, mb: 0.5 }}>
                    {card.format(card.value)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {card.trend === 'up' ? (
                      <TrendingUp sx={{ color: COLORS.successColor, fontSize: '0.9rem' }} />
                    ) : (
                      <TrendingDown sx={{ color: COLORS.dangerColor, fontSize: '0.9rem' }} />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        color: card.trend === 'up' ? COLORS.successColor : COLORS.dangerColor,
                      }}
                    >
                      {card.change} vs 어제
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: alpha(card.color, 0.1),
                    color: card.color,
                  }}
                >
                  {card.icon}
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 탭 컨테이너 - 매출 & 예약 차트 */}
      <Paper sx={{ bgcolor: COLORS.backgroundLight, borderRadius: 1, mb: 3, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: alpha('#fff', 0.03) }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': { color: COLORS.textSecondary },
              '& .Mui-selected': { color: COLORS.accentColor },
              '& .MuiTabs-indicator': { backgroundColor: COLORS.accentColor },
            }}
          >
            <Tab label="실시간 매출 현황" />
            <Tab label="주간 예약 추이" />
            <Tab label="서비스 유형 분석" />
          </Tabs>
        </Box>
        <Box sx={{ p: 2, height: 400 }}>
          {tabValue === 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} stackOffset="none">
                <defs>
                  <linearGradient id="color보관" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3788FC" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3788FC" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="color배송" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52B455" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#52B455" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha('#fff', 0.1)} />
                <XAxis
                  dataKey="time"
                  stroke={COLORS.textSecondary}
                  tick={{ fill: COLORS.textSecondary }}
                />
                <YAxis
                  tickFormatter={(value) => `₩${value/10000}만`}
                  stroke={COLORS.textSecondary}
                  tick={{ fill: COLORS.textSecondary }}
                />
                <Tooltip
                  formatter={(value: any) => [`₩${Number(value).toLocaleString()}`, ``]}
                  contentStyle={{
                    backgroundColor: COLORS.backgroundDark,
                    border: `1px solid ${alpha('#fff', 0.1)}`,
                    color: COLORS.textPrimary
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="보관"
                  stackId="1"
                  stroke="#3788FC"
                  fill="url(#color보관)"
                />
                <Area
                  type="monotone"
                  dataKey="배송"
                  stackId="1"
                  stroke="#52B455"
                  fill="url(#color배송)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {tabValue === 1 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBookingData}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha('#fff', 0.1)} />
                <XAxis
                  dataKey="day"
                  stroke={COLORS.textSecondary}
                  tick={{ fill: COLORS.textSecondary }}
                />
                <YAxis
                  stroke={COLORS.textSecondary}
                  tick={{ fill: COLORS.textSecondary }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.backgroundDark,
                    border: `1px solid ${alpha('#fff', 0.1)}`,
                    color: COLORS.textPrimary
                  }}
                />
                <Legend />
                <Bar dataKey="보관" fill="#3788FC" radius={[4, 4, 0, 0]} />
                <Bar dataKey="배송" fill="#52B455" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {tabValue === 2 && (
            <Grid container spacing={2} sx={{ height: '100%' }}>
              <Grid item xs={12} md={5}>
                <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={serviceTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {serviceTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={['#3788FC', '#52B455', '#E6C220', '#E0684B'][index % 4]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => {
                          const data = serviceTypeData.find(item => item.name === props.payload.name);
                          return [`${value}% (₩${data?.revenue.toLocaleString()})`, props.payload.name];
                        }}
                        contentStyle={{
                          backgroundColor: COLORS.backgroundDark,
                          border: `1px solid ${alpha('#fff', 0.1)}`,
                          color: COLORS.textPrimary
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={7}>
                <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none', height: '100%' }}>
                  <Table size="small" sx={{ '& .MuiTableCell-root': { borderBottom: `1px solid ${alpha('#fff', 0.1)}` } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: COLORS.textSecondary }}>서비스 유형</TableCell>
                        <TableCell sx={{ color: COLORS.textSecondary }}>비율</TableCell>
                        <TableCell sx={{ color: COLORS.textSecondary }}>매출</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {serviceTypeData.map((service, index) => (
                        <TableRow key={service.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ color: COLORS.textPrimary }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '2px',
                                  bgcolor: ['#3788FC', '#52B455', '#E6C220', '#E0684B'][index % 4]
                                }}
                              />
                              {service.name}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: COLORS.textPrimary }}>{service.value}%</TableCell>
                          <TableCell sx={{ color: COLORS.textPrimary }}>₩{service.revenue.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>

      {/* 보관함 사용률 및 최근 활동 */}
      <Grid container spacing={2}>
        {/* 보관함 현황 */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ bgcolor: COLORS.backgroundLight, borderRadius: 1, p: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ color: COLORS.textPrimary, mb: 2 }}>
              전국 보관함 사용 현황
            </Typography>
            <Divider sx={{ borderColor: alpha('#fff', 0.1), mb: 2 }} />
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {lockerUsageByLocation.map((location) => (
                <Box key={location.name} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: COLORS.textPrimary }}>
                      {location.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                        소형: {location.소형}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                        중형: {location.중형}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                        대형: {location.대형}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ color: COLORS.textPrimary }}>
                        {Math.floor(location.total * location.usage / 100)}/{location.total}
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={location.usage}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: alpha('#fff', 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        bgcolor: location.usage > 90 ? COLORS.dangerColor : 
                                location.usage > 70 ? COLORS.warningColor : COLORS.successColor,
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        
        {/* 최근 활동 */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ bgcolor: COLORS.backgroundLight, borderRadius: 1, p: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ color: COLORS.textPrimary, mb: 2 }}>
              최근 고객 활동
            </Typography>
            <Divider sx={{ borderColor: alpha('#fff', 0.1), mb: 2 }} />
            <Stack spacing={1.5} sx={{ maxHeight: 400, overflow: 'auto' }}>
              {recentActivities.map((activity) => (
                <Box
                  key={activity.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha('#fff', 0.03),
                    border: `1px solid ${alpha('#fff', 0.05)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {activity.type === '보관' ? (
                        <LuggageOutlined sx={{ color: '#3788FC', fontSize: '1.2rem' }} />
                      ) : (
                        <LocalShippingOutlined sx={{ color: '#52B455', fontSize: '1.2rem' }} />
                      )}
                      <Typography variant="subtitle2" sx={{ color: COLORS.textPrimary }}>
                        {activity.id}
                      </Typography>
                    </Box>
                    <Chip
                      label={activity.status}
                      size="small"
                      sx={{
                        bgcolor: activity.status === '완료' ? alpha('#52B455', 0.2) :
                                activity.status === '진행중' ? alpha('#E6C220', 0.2) :
                                activity.status === '배송중' ? alpha('#3788FC', 0.2) : alpha('#E0684B', 0.2),
                        color: activity.status === '완료' ? '#52B455' :
                              activity.status === '진행중' ? '#E6C220' :
                              activity.status === '배송중' ? '#3788FC' : '#E0684B',
                        fontWeight: 500,
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                      {activity.type === '보관'
                        ? `${activity.location} (${activity.size})`
                        : `${activity.from} → ${activity.to} (${activity.size})`}
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.accentColor, fontWeight: 500 }}>
                      ₩{activity.amount.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime sx={{ fontSize: '0.8rem' }} />
                    {activity.time}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
        
        {/* 시스템 알림 */}
        <Grid item xs={12}>
          <Paper sx={{ bgcolor: COLORS.backgroundLight, borderRadius: 1, p: 2 }}>
            <Typography variant="subtitle1" sx={{ color: COLORS.textPrimary, mb: 2 }}>
              시스템 알림
            </Typography>
            <Divider sx={{ borderColor: alpha('#fff', 0.1), mb: 2 }} />
            <Stack spacing={1}>
              {alertsData.map((alert) => (
                <Box
                  key={alert.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha('#fff', 0.03),
                    border: `1px solid ${alpha(alert.type === '경고' ? COLORS.dangerColor : COLORS.warningColor, 0.3)}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {alert.type === '경고' ? (
                      <Warning sx={{ color: COLORS.dangerColor }} />
                    ) : (
                      <Warning sx={{ color: COLORS.warningColor }} />
                    )}
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                        {alert.time}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={alert.resolved ? '해결됨' : '미해결'}
                    size="small"
                    sx={{
                      bgcolor: alert.resolved ? alpha(COLORS.successColor, 0.2) : alpha(COLORS.dangerColor, 0.2),
                      color: alert.resolved ? COLORS.successColor : COLORS.dangerColor,
                      fontWeight: 500,
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 