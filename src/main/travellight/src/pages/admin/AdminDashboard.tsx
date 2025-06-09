import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  LinearProgress,
  Paper,
  useTheme,
  alpha,
  Divider,
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
  AccessTime,
  EventNote
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
  Cell
} from 'recharts';
import { getRecentReservations } from '../../services/reservationService';
import { ReservationDto } from '../../types/reservation';
import { partnershipService } from '../../services/api';

// 전문적이고 세련된 ERP 색상 정의
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

interface PartnershipData {
  id: number;
  businessName: string;
  address: string;
  status: string;
  smallBagsAvailable: number;
  mediumBagsAvailable: number;
  largeBagsAvailable: number;
  submissionDate: string;
}

interface EventStorageData {
  id: number;
  eventName: string;
  organizerName: string;
  eventDate: string;
  status: string;
  submissionId: string;
}

interface StorageUsageData {
  partnershipId: number;
  businessName: string;
  address: string;
  maxCapacity: {
    smallBags: number;
    mediumBags: number;
    largeBags: number;
  };
  currentUsage: {
    smallBags: number;
    mediumBags: number;
    largeBags: number;
  };
  availableCapacity: {
    smallBags: number;
    mediumBags: number;
    largeBags: number;
  };
}

const AdminDashboard = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('오늘');
  const [recentReservations, setRecentReservations] = useState<ReservationDto[]>([]);
  const [partnerships, setPartnerships] = useState<PartnershipData[]>([]);
  const [eventStorages, setEventStorages] = useState<EventStorageData[]>([]);
  const [storageUsages, setStorageUsages] = useState<StorageUsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [usageLoading, setUsageLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // 실제 예약 데이터 로드
  useEffect(() => {
    const loadRecentReservations = async () => {
      try {
        setLoading(true);
        const reservations = await getRecentReservations(20);
        setRecentReservations(reservations);
      } catch (error) {
        console.error('최근 예약 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentReservations();
  }, []);

  // 제휴점 데이터 로드
  useEffect(() => {
    const loadPartnerships = async () => {
      try {
        const response = await fetch('/api/partnership');
        const data = await response.json();
        if (data.success && data.data) {
          setPartnerships(data.data);
        }
      } catch (error) {
        console.error('제휴점 데이터 로드 실패:', error);
      }
    };

    loadPartnerships();
  }, []);

  // 이벤트 보관 데이터 로드
  useEffect(() => {
    const loadEventStorages = async () => {
      try {
        const response = await fetch('/api/admin/EventStorage');
        const data = await response.json();
        if (data.success && data.data) {
          setEventStorages(data.data);
        }
      } catch (error) {
        console.error('이벤트 보관 데이터 로드 실패:', error);
      }
    };

    loadEventStorages();
  }, []);

  // 보관함 사용량 데이터 로드
  useEffect(() => {
    const loadStorageUsages = async () => {
      try {
        setUsageLoading(true);
        const usagePromises = partnerships
          .filter(p => p.status === 'APPROVED')
          .map(async (partnership) => {
            try {
              const response = await fetch(`/api/partnership/${partnership.id}/current-usage`);
              const data = await response.json();
              if (data.success && data.data) {
                return {
                  partnershipId: partnership.id,
                  businessName: partnership.businessName,
                  address: partnership.address,
                  ...data.data
                };
              }
              return null;
            } catch (error) {
              console.error(`매장 ${partnership.businessName} 사용량 로드 실패:`, error);
              return null;
            }
          });

        const results = await Promise.all(usagePromises);
        const validResults = results.filter(result => result !== null) as StorageUsageData[];
        setStorageUsages(validResults);
      } catch (error) {
        console.error('보관함 사용량 데이터 로드 실패:', error);
      } finally {
        setUsageLoading(false);
      }
    };

    if (partnerships.length > 0) {
      loadStorageUsages();
    }
  }, [partnerships]);

  // 자동 스크롤 기능
  useEffect(() => {
    if (!isHovering && storageUsages.length > 3) {
      const interval = setInterval(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const itemHeight = 100; // 각 매장 항목의 대략적인 높이
          const maxScroll = container.scrollHeight - container.clientHeight;
          const currentScroll = container.scrollTop;
          
          if (currentScroll >= maxScroll - 10) {
            // 맨 아래에 도달하면 맨 위로 부드럽게 이동
            container.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            // 다음 항목으로 부드럽게 스크롤
            container.scrollTo({ 
              top: currentScroll + itemHeight, 
              behavior: 'smooth' 
            });
          }
        }
      }, 3000); // 3초마다 실행

      return () => clearInterval(interval);
    }
  }, [isHovering, storageUsages.length]);

  // 실제 데이터 기반 통계 계산
  const totalReservations = recentReservations.length;
  const completedReservations = recentReservations.filter(r => r.status === 'COMPLETED').length;
  const reservedReservations = recentReservations.filter(r => r.status === 'RESERVED').length;
  const totalRevenue = recentReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const totalPartnerships = partnerships.length;
  const approvedPartnerships = partnerships.filter(p => p.status === 'APPROVED').length;
  const totalEventRequests = eventStorages.length;
  const totalBagCapacity = partnerships.reduce((sum, p) => 
    sum + (p.smallBagsAvailable || 0) + (p.mediumBagsAvailable || 0) + (p.largeBagsAvailable || 0), 0);
  
  // 보관함 사용량 통계 계산
  const totalMaxCapacity = storageUsages.reduce((sum, usage) => 
    sum + usage.maxCapacity.smallBags + usage.maxCapacity.mediumBags + usage.maxCapacity.largeBags, 0);
  const totalCurrentUsage = storageUsages.reduce((sum, usage) => 
    sum + usage.currentUsage.smallBags + usage.currentUsage.mediumBags + usage.currentUsage.largeBags, 0);
  const overallUsageRate = totalMaxCapacity > 0 ? Math.round((totalCurrentUsage / totalMaxCapacity) * 100) : 0;

  // 실제 데이터 기반 메트릭 카드
  const summaryCards = [
    {
      title: '총 예약 건수',
      value: totalReservations,
      format: (val: number) => val.toString(),
      icon: <LuggageOutlined />,
      color: COLORS.accentPrimary,
      subtitle: `완료: ${completedReservations}건`
    },
    {
      title: '누적 매출',
      value: totalRevenue,
      format: (val: number) => `₩${val.toLocaleString()}`,
      icon: <AccountBalanceWalletOutlined />,
      color: COLORS.success,
      subtitle: `평균: ₩${totalReservations > 0 ? Math.round(totalRevenue / totalReservations).toLocaleString() : 0}`
    },
    {
      title: '제휴점 현황',
      value: approvedPartnerships,
      format: (val: number) => `${val}개`,
      icon: <StorefrontOutlined />,
      color: COLORS.info,
      subtitle: `신청중: ${totalPartnerships - approvedPartnerships}개`
    },
    {
      title: '예약 대기중',
      value: reservedReservations,
      format: (val: number) => val.toString(),
      icon: <AccessTime />,
      color: COLORS.warning,
      subtitle: '실시간 모니터링'
    },
    {
      title: '이벤트 보관 신청',
      value: totalEventRequests,
      format: (val: number) => `${val}건`,
      icon: <EventNote />,
      color: COLORS.accentSecondary,
      subtitle: '전체 신청 건수'
    },
    {
      title: '총 보관함 용량',
      value: totalBagCapacity,
      format: (val: number) => `${val}개`,
      icon: <LuggageOutlined />,
      color: COLORS.success,
      subtitle: '전체 제휴점 합계'
    },
    {
      title: '전체 보관함 이용률',
      value: overallUsageRate,
      format: (val: number) => `${val}%`,
      icon: <StorefrontOutlined />,
      color: overallUsageRate > 80 ? COLORS.danger : overallUsageRate > 60 ? COLORS.warning : COLORS.success,
      subtitle: `${totalCurrentUsage}/${totalMaxCapacity} 사용중`
    }
  ];

  // 일별 매출 데이터 계산 (최근 7일)
  const dailyRevenueData = React.useMemo(() => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dailyRevenue = recentReservations
        .filter(r => r.storageDate === dateStr)
        .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
      
      last7Days.push({
        date: dateStr,
        name: `${date.getMonth() + 1}/${date.getDate()}`,
        revenue: dailyRevenue,
        reservations: recentReservations.filter(r => r.storageDate === dateStr).length
      });
    }
    
    return last7Days;
  }, [recentReservations]);

  // 가방 크기별 예약 분포 데이터
  const bagSizeDistributionData = React.useMemo(() => {
    const totalSmall = recentReservations.reduce((sum, r) => sum + (r.smallBags || 0), 0);
    const totalMedium = recentReservations.reduce((sum, r) => sum + (r.mediumBags || 0), 0);
    const totalLarge = recentReservations.reduce((sum, r) => sum + (r.largeBags || 0), 0);
    
    return [
      { name: '소형 가방', count: totalSmall, color: COLORS.success },
      { name: '중형 가방', count: totalMedium, color: COLORS.accentPrimary },
      { name: '대형 가방', count: totalLarge, color: COLORS.warning }
    ].filter(item => item.count > 0);
  }, [recentReservations]);



  return (
    <Box sx={{ 
      bgcolor: COLORS.backgroundDark, 
      width: '100%',
      minHeight: '100vh',
      p: 2.5
    }}>
      {/* 헤더 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        pb: 2,
        borderBottom: `1px solid ${COLORS.borderPrimary}`
      }}>
        <Box>
          <Typography variant="h5" sx={{ 
            color: COLORS.textPrimary, 
            fontWeight: 600,
            fontSize: '1.25rem',
            mb: 0.25,
            letterSpacing: '-0.025em'
          }}>
            TravelLight ERP
          </Typography>
          <Typography variant="body2" sx={{ 
            color: COLORS.textSecondary,
            fontSize: '0.75rem',
            fontWeight: 500
          }}>
            운영 관리 시스템
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {['실시간', '오늘', '이번주', '이번달'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "contained" : "text"}
              size="small"
              onClick={() => setTimeRange(range)}
              sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                px: 2,
                py: 0.75,
                minWidth: 'auto',
                color: timeRange === range ? 'white' : COLORS.textSecondary,
                backgroundColor: timeRange === range ? COLORS.accentPrimary : 'transparent',
                border: `1px solid ${timeRange === range ? COLORS.accentPrimary : COLORS.borderPrimary}`,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: timeRange === range ? COLORS.accentPrimary : COLORS.backgroundHover,
                },
                transition: 'all 0.15s ease'
              }}
            >
              {range}
            </Button>
          ))}
        </Box>
      </Box>

      {/* 메트릭 카드들 */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} lg={2} xl={1.71} key={card.title}>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: COLORS.backgroundCard,
                border: `1px solid ${COLORS.borderPrimary}`,
                height: '100%',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: COLORS.backgroundSurface,
                  transform: 'translateY(-1px)',
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ 
                    color: COLORS.textMuted, 
                    fontSize: '0.625rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em',
                    display: 'block',
                    mb: 0.5
                  }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: COLORS.textPrimary, 
                    fontWeight: 700, 
                    fontSize: '1.125rem',
                    lineHeight: 1.2,
                    mb: 0.5
                  }}>
                    {card.format(card.value)}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: COLORS.textSecondary,
                    fontSize: '0.6875rem',
                    display: 'block'
                  }}>
                    {card.subtitle}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1,
                    bgcolor: alpha(card.color, 0.1),
                    color: card.color,
                  }}
                >
                  {React.cloneElement(card.icon, { sx: { fontSize: '1rem' } })}
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 통계 차트 섹션 */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* 실시간 매출 추이 */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              bgcolor: COLORS.backgroundCard, 
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 1,
              p: 2,
              height: 250
            }}
          >
            <Typography variant="subtitle2" sx={{ 
              color: COLORS.textPrimary, 
              fontSize: '0.875rem',
              fontWeight: 600,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <TrendingUp sx={{ fontSize: '1rem', color: COLORS.accentPrimary }} />
              최근 7일 매출 추이
            </Typography>
            <Box sx={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyRevenueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.accentPrimary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.accentPrimary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderPrimary} />
                  <XAxis
                    dataKey="name"
                    stroke={COLORS.textMuted}
                    tick={{ fill: COLORS.textMuted, fontSize: 10 }}
                    axisLine={{ stroke: COLORS.borderPrimary }}
                  />
                  <YAxis
                    stroke={COLORS.textMuted}
                    tick={{ fill: COLORS.textMuted, fontSize: 10 }}
                    axisLine={{ stroke: COLORS.borderPrimary }}
                    tickFormatter={(value) => `₩${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`₩${value.toLocaleString()}`, '매출']}
                    labelFormatter={(label) => `${label} 일자`}
                    contentStyle={{
                      backgroundColor: COLORS.backgroundSurface,
                      border: `1px solid ${COLORS.borderSecondary}`,
                      borderRadius: 4,
                      color: COLORS.textPrimary,
                      fontSize: 11
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS.accentPrimary}
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    dot={{ fill: COLORS.accentPrimary, strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 4, stroke: COLORS.accentPrimary, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* 가방 크기별 분포 차트 */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              bgcolor: COLORS.backgroundCard, 
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 1,
              p: 2,
              height: 250
            }}
          >
            <Typography variant="subtitle2" sx={{ 
              color: COLORS.textPrimary, 
              fontSize: '0.875rem',
              fontWeight: 600,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <LuggageOutlined sx={{ fontSize: '1rem', color: COLORS.accentPrimary }} />
              가방 크기별 예약 분포
            </Typography>
            <Box sx={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bagSizeDistributionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderPrimary} />
                  <XAxis
                    dataKey="name"
                    stroke={COLORS.textMuted}
                    tick={{ fill: COLORS.textMuted, fontSize: 10 }}
                    axisLine={{ stroke: COLORS.borderPrimary }}
                  />
                  <YAxis
                    stroke={COLORS.textMuted}
                    tick={{ fill: COLORS.textMuted, fontSize: 10 }}
                    axisLine={{ stroke: COLORS.borderPrimary }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}개`, '']}
                    contentStyle={{
                      backgroundColor: COLORS.backgroundSurface,
                      border: `1px solid ${COLORS.borderSecondary}`,
                      borderRadius: 4,
                      color: COLORS.textPrimary,
                      fontSize: 11
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[2, 2, 0, 0]}
                  >
                    {bagSizeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 상세 정보 섹션 */}
      <Grid container spacing={2}>
        {/* 최근 예약 현황 */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              bgcolor: COLORS.backgroundCard, 
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 1,
              p: 2, 
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" sx={{ 
              color: COLORS.textPrimary, 
              fontSize: '0.875rem',
              fontWeight: 600,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <CompareArrows sx={{ fontSize: '1rem', color: COLORS.accentPrimary }} />
              최근 예약 현황 ({recentReservations.length}건)
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.6875rem', fontWeight: 600, py: 1, bgcolor: COLORS.backgroundLight }}>예약번호</TableCell>
                    <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.6875rem', fontWeight: 600, py: 1, bgcolor: COLORS.backgroundLight }}>장소</TableCell>
                    <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.6875rem', fontWeight: 600, py: 1, bgcolor: COLORS.backgroundLight }}>금액</TableCell>
                    <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.6875rem', fontWeight: 600, py: 1, bgcolor: COLORS.backgroundLight }}>상태</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center', py: 2, color: COLORS.textSecondary }}>
                        로딩중...
                      </TableCell>
                    </TableRow>
                  ) : recentReservations.slice(0, 10).map((reservation) => (
                    <TableRow key={reservation.id} hover>
                      <TableCell sx={{ color: COLORS.textPrimary, fontSize: '0.75rem', py: 1 }}>
                        {reservation.reservationNumber}
                      </TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, fontSize: '0.75rem', py: 1 }}>
                        {reservation.placeName}
                      </TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, fontSize: '0.75rem', py: 1, fontWeight: 600 }}>
                        ₩{reservation.totalPrice?.toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Chip
                          label={reservation.status === 'COMPLETED' ? '완료' : 
                                reservation.status === 'RESERVED' ? '예약중' : '취소됨'}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.625rem',
                            bgcolor: reservation.status === 'COMPLETED' ? alpha(COLORS.success, 0.15) :
                                    reservation.status === 'RESERVED' ? alpha(COLORS.accentPrimary, 0.15) :
                                    alpha(COLORS.danger, 0.15),
                            color: reservation.status === 'COMPLETED' ? COLORS.success :
                                  reservation.status === 'RESERVED' ? COLORS.accentPrimary : COLORS.danger,
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* 매장별 보관함 이용률 */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              bgcolor: COLORS.backgroundCard, 
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 1,
              p: 2, 
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ 
                color: COLORS.textPrimary, 
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <StorefrontOutlined sx={{ fontSize: '1rem', color: COLORS.accentPrimary }} />
                매장별 보관함 이용률 ({storageUsages.length}개)
              </Typography>
              {storageUsages.length > 3 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: isHovering ? COLORS.warning : COLORS.success,
                      animation: isHovering ? 'none' : 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 0.4 },
                        '50%': { opacity: 1 },
                        '100%': { opacity: 0.4 }
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ 
                    color: COLORS.textMuted, 
                    fontSize: '0.625rem' 
                  }}>
                    {isHovering ? '일시정지' : '자동순환'}
                  </Typography>
                </Box>
              )}
            </Box>
            {usageLoading ? (
              <Typography sx={{ color: COLORS.textSecondary, textAlign: 'center', py: 2, fontSize: '0.75rem' }}>
                사용량 데이터 로딩중...
              </Typography>
            ) : storageUsages.length === 0 ? (
              <Typography sx={{ color: COLORS.textSecondary, textAlign: 'center', py: 2, fontSize: '0.75rem' }}>
                승인된 매장이 없습니다.
              </Typography>
            ) : (
              <Box 
                ref={scrollContainerRef}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                sx={{ 
                  maxHeight: 300, 
                  overflow: 'auto',
                  scrollBehavior: 'smooth',
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: COLORS.borderPrimary,
                    borderRadius: '2px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: COLORS.accentPrimary,
                    borderRadius: '2px'
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: COLORS.accentSecondary
                  }
                }}
              >
                {storageUsages.map((usage) => {
                  const totalMax = usage.maxCapacity.smallBags + usage.maxCapacity.mediumBags + usage.maxCapacity.largeBags;
                  const totalUsed = usage.currentUsage.smallBags + usage.currentUsage.mediumBags + usage.currentUsage.largeBags;
                  const usageRate = totalMax > 0 ? Math.round((totalUsed / totalMax) * 100) : 0;
                  
                  return (
                    <Box key={usage.partnershipId} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                        <Typography variant="body2" sx={{ 
                          color: COLORS.textPrimary,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          flex: 1,
                          mr: 1
                        }}>
                          {usage.businessName}
                        </Typography>
                        <Chip
                          label={`${usageRate}%`}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.625rem',
                            bgcolor: usageRate > 80 ? alpha(COLORS.danger, 0.15) :
                                    usageRate > 60 ? alpha(COLORS.warning, 0.15) :
                                    alpha(COLORS.success, 0.15),
                            color: usageRate > 80 ? COLORS.danger :
                                  usageRate > 60 ? COLORS.warning : COLORS.success,
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      
                      <Typography variant="caption" sx={{ 
                        color: COLORS.textMuted,
                        fontSize: '0.625rem',
                        display: 'block',
                        mb: 1
                      }}>
                        {usage.address.length > 30 ? `${usage.address.substring(0, 30)}...` : usage.address}
                      </Typography>

                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: '0.625rem' }}>
                            사용량: {totalUsed}/{totalMax}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.5625rem' }}>
                              소형: {usage.currentUsage.smallBags}/{usage.maxCapacity.smallBags}
                            </Typography>
                            <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.5625rem' }}>
                              중형: {usage.currentUsage.mediumBags}/{usage.maxCapacity.mediumBags}
                            </Typography>
                            <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.5625rem' }}>
                              대형: {usage.currentUsage.largeBags}/{usage.maxCapacity.largeBags}
                            </Typography>
                          </Box>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={usageRate}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: COLORS.borderPrimary,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              bgcolor: usageRate > 80 ? COLORS.danger : 
                                      usageRate > 60 ? COLORS.warning : COLORS.success,
                            }
                          }}
                        />
                      </Box>
                      
                                             {usage.partnershipId !== storageUsages[storageUsages.length - 1]?.partnershipId && (
                         <Divider sx={{ borderColor: COLORS.borderPrimary, mt: 1 }} />
                       )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>



        {/* 이벤트 보관 신청 현황 */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              bgcolor: COLORS.backgroundCard, 
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 1,
              p: 2
            }}
          >
            <Typography variant="subtitle2" sx={{ 
              color: COLORS.textPrimary, 
              fontSize: '0.875rem',
              fontWeight: 600,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <EventNote sx={{ fontSize: '1rem', color: COLORS.accentPrimary }} />
              이벤트 보관 신청 현황 ({eventStorages.length}건)
            </Typography>
            {eventStorages.length === 0 ? (
              <Typography sx={{ color: COLORS.textSecondary, textAlign: 'center', py: 2, fontSize: '0.75rem' }}>
                이벤트 보관 신청이 없습니다.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.6875rem', fontWeight: 600, py: 1 }}>신청번호</TableCell>
                      <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.6875rem', fontWeight: 600, py: 1 }}>이벤트명</TableCell>
                      <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.6875rem', fontWeight: 600, py: 1 }}>주최자</TableCell>
                      <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.6875rem', fontWeight: 600, py: 1 }}>이벤트 날짜</TableCell>
                      <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.6875rem', fontWeight: 600, py: 1 }}>상태</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {eventStorages.map((event) => (
                      <TableRow key={event.id} hover>
                        <TableCell sx={{ color: COLORS.textPrimary, fontSize: '0.75rem', py: 1 }}>
                          {event.submissionId}
                        </TableCell>
                        <TableCell sx={{ color: COLORS.textPrimary, fontSize: '0.75rem', py: 1 }}>
                          {event.eventName}
                        </TableCell>
                        <TableCell sx={{ color: COLORS.textPrimary, fontSize: '0.75rem', py: 1 }}>
                          {event.organizerName}
                        </TableCell>
                        <TableCell sx={{ color: COLORS.textPrimary, fontSize: '0.75rem', py: 1 }}>
                          {event.eventDate}
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Chip
                            label={event.status || '대기중'}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.625rem',
                              bgcolor: alpha(COLORS.warning, 0.15),
                              color: COLORS.warning,
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 