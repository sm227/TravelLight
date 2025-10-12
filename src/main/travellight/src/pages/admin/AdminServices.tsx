import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Computer as ServerIcon,
  Database as DatabaseIcon,
  NetworkCheck as NetworkIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Refresh as RefreshIcon,
  CheckCircle,
  Warning,
  Error,
  AccessTime,
  AccountTree,
} from '@mui/icons-material';

// 홈서버 서비스 상태를 위한 인터페이스
interface ServerServiceStatus {
  serviceName: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTime: number;
  lastChecked: string;
  details?: string;
}

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    usage: number;
  };
  disk: {
    used: number;
    total: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    throughputIn?: number;
    throughputOut?: number;
  };
}

interface SystemHealthData {
  services: ServerServiceStatus[];
  metrics: SystemMetrics;
  lastUpdated: string;
  uptimeSeconds?: number;
  threadCount?: number;
}

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
  accentSecondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
};

const AdminServices = () => {
  const [services, setServices] = useState<ServerServiceStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(0);
  const [threadCount, setThreadCount] = useState<number>(0);
  const [cacheStats, setCacheStats] = useState({
    cacheSize: 0,
    totalRequests: 0,
    hits: 0,
    misses: 0,
    hitRate: 0
  });

  // 홈서버 상태 체크
  const checkServerHealth = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/system/health');
      const data = await response.json();

      if (data.success && data.data) {
        setServices(data.data.services || []);
        setMetrics(data.data.metrics || null);
        setUptimeSeconds(data.data.uptimeSeconds || 0);
        setThreadCount(data.data.threadCount || 0);
        setLastUpdate(new Date());
      } else {
        throw new Error(data.message || '데이터 로드 실패');
      }
    } catch (error) {
      console.error('서버 상태 확인 실패:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 캐시 통계 로드
  const loadCacheStats = async () => {
    try {
      const response = await fetch('/api/admin/query/cache/stats');
      const data = await response.json();
      if (data.success) {
        setCacheStats(data);
      }
    } catch (error) {
      console.error('캐시 통계 로드 실패:', error);
    }
  };

  // 캐시 삭제
  const handleClearCache = async () => {
    try {
      const response = await fetch('/api/admin/query/cache/clear', {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        setCacheStats({
          cacheSize: 0,
          totalRequests: 0,
          hits: 0,
          misses: 0,
          hitRate: 0
        });
        alert('캐시와 통계가 성공적으로 초기화되었습니다.');
      } else {
        alert('캐시 삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('캐시 삭제 실패:', error);
      alert('캐시 삭제 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    checkServerHealth();
    loadCacheStats();

    // 30초마다 자동 새로고침
    const interval = setInterval(() => {
      checkServerHealth();
      loadCacheStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return COLORS.success;
      case 'degraded': return COLORS.warning;
      case 'unhealthy': return COLORS.danger;
      case 'unknown': return COLORS.textMuted;
      default: return COLORS.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return '정상';
      case 'degraded': return '저하';
      case 'unhealthy': return '오류';
      case 'unknown': return '알 수 없음';
      default: return '알 수 없음';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle sx={{ fontSize: '1rem', color: COLORS.success }} />;
      case 'degraded': return <Warning sx={{ fontSize: '1rem', color: COLORS.warning }} />;
      case 'unhealthy': return <Error sx={{ fontSize: '1rem', color: COLORS.danger }} />;
      default: return <Warning sx={{ fontSize: '1rem', color: COLORS.textMuted }} />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}일 ${hours}시간 ${minutes}분`;
    } else if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${secs}초`;
    } else if (minutes > 0) {
      return `${minutes}분 ${secs}초`;
    } else {
      return `${secs}초`;
    }
  };

  const getOverallStatus = () => {
    if (services.length === 0) return 'unknown';

    const healthyCount = services.filter(s => s.status === 'healthy').length;
    const totalCount = services.length;

    if (healthyCount === totalCount) return 'healthy';
    if (healthyCount > totalCount / 2) return 'degraded';
    return 'unhealthy';
  };

  const overallStatus = getOverallStatus();

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h5" sx={{
              color: COLORS.textPrimary,
              fontWeight: 600,
              fontSize: '1.25rem',
              letterSpacing: '-0.025em'
            }}>
              시스템 모니터링
            </Typography>
            {getStatusIcon(overallStatus)}
          </Box>
          <Typography variant="body2" sx={{
            color: COLORS.textSecondary,
            fontSize: '0.75rem',
            fontWeight: 500
          }}>
            인프라 및 시스템 상태 실시간 모니터링
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{
            color: COLORS.textMuted,
            fontSize: '0.6875rem'
          }}>
            마지막 업데이트: {lastUpdate.toLocaleTimeString()}
          </Typography>
          <Tooltip title="새로고침">
            <IconButton
              onClick={checkServerHealth}
              disabled={loading}
              sx={{
                color: COLORS.textSecondary,
                '&:hover': {
                  color: COLORS.accentPrimary,
                  backgroundColor: COLORS.backgroundSurface
                }
              }}
            >
              <RefreshIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 오류 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: COLORS.accentPrimary }} />
        </Box>
      )}

      {/* 메인 콘텐츠 */}
      {!loading && (
        <Grid container spacing={2}>
          {/* 전체 상태 카드 */}
          <Grid item xs={12}>
            <Card sx={{
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 1,
              mb: 2
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 0.5 }}>
                      전체 시스템 상태
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                      {services.filter(s => s.status === 'healthy').length} / {services.length} 서비스 정상 운영중
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusText(overallStatus)}
                    size="medium"
                    icon={getStatusIcon(overallStatus)}
                    sx={{
                      bgcolor: `${getStatusColor(overallStatus)}15`,
                      color: getStatusColor(overallStatus),
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      px: 1
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 서버 업타임 및 스레드 정보 카드 */}
          <Grid item xs={12} md={6}>
            <Card sx={{
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 1,
              mb: 2,
              height: '100%'
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTime sx={{ color: COLORS.accentPrimary, mr: 1, fontSize: '1.25rem' }} />
                  <Typography variant="h6" sx={{ color: COLORS.textPrimary }}>
                    서버 업타임
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{
                  color: COLORS.success,
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  mb: 1
                }}>
                  {formatUptime(uptimeSeconds)}
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  서버가 중단 없이 실행 중입니다
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 1,
              mb: 2,
              height: '100%'
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountTree sx={{ color: COLORS.accentSecondary, mr: 1, fontSize: '1.25rem' }} />
                  <Typography variant="h6" sx={{ color: COLORS.textPrimary }}>
                    활성 스레드
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{
                  color: COLORS.accentSecondary,
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  mb: 1
                }}>
                  {threadCount}개
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  현재 JVM에서 실행 중인 스레드 수
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* AI 쿼리 캐시 관리 카드 */}
          <Grid item xs={12}>
            <Card sx={{
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 1,
              mb: 2
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <MemoryIcon sx={{ color: COLORS.accentSecondary, mr: 1, fontSize: '1.25rem' }} />
                      <Typography variant="h6" sx={{ color: COLORS.textPrimary }}>
                        AI 쿼리 캐시 관리
                      </Typography>
                    </Box>

                    {/* 캐시 통계 그리드 */}
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{
                          p: 1.5,
                          bgcolor: COLORS.backgroundLight,
                          borderRadius: 1,
                          border: `1px solid ${COLORS.borderPrimary}`
                        }}>
                          <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.625rem' }}>
                            저장된 쿼리
                          </Typography>
                          <Typography variant="h6" sx={{ color: COLORS.textPrimary, fontWeight: 700 }}>
                            {cacheStats.cacheSize}개
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <Box sx={{
                          p: 1.5,
                          bgcolor: COLORS.backgroundLight,
                          borderRadius: 1,
                          border: `1px solid ${COLORS.borderPrimary}`
                        }}>
                          <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.625rem' }}>
                            히트율
                          </Typography>
                          <Typography variant="h6" sx={{
                            color: cacheStats.hitRate >= 70 ? COLORS.success :
                                   cacheStats.hitRate >= 40 ? COLORS.warning : COLORS.danger,
                            fontWeight: 700
                          }}>
                            {cacheStats.hitRate.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <Box sx={{
                          p: 1.5,
                          bgcolor: COLORS.backgroundLight,
                          borderRadius: 1,
                          border: `1px solid ${COLORS.borderPrimary}`
                        }}>
                          <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.625rem' }}>
                            총 요청
                          </Typography>
                          <Typography variant="h6" sx={{ color: COLORS.textPrimary, fontWeight: 700 }}>
                            {cacheStats.totalRequests}회
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <Box sx={{
                          p: 1.5,
                          bgcolor: COLORS.backgroundLight,
                          borderRadius: 1,
                          border: `1px solid ${COLORS.borderPrimary}`
                        }}>
                          <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.625rem' }}>
                            히트/미스
                          </Typography>
                          <Typography variant="h6" sx={{ color: COLORS.textPrimary, fontWeight: 700 }}>
                            {cacheStats.hits}/{cacheStats.misses}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mt: 2 }}>
                      자동 TTL: 2시간 | 30초마다 자동 갱신
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={loadCacheStats}
                      startIcon={<RefreshIcon />}
                      sx={{
                        color: COLORS.accentPrimary,
                        borderColor: COLORS.accentPrimary,
                        '&:hover': {
                          backgroundColor: `${COLORS.accentPrimary}15`,
                        }
                      }}
                    >
                      새로고침
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleClearCache}
                      sx={{
                        backgroundColor: COLORS.danger,
                        '&:hover': {
                          backgroundColor: `${COLORS.danger}dd`,
                        }
                      }}
                    >
                      캐시 삭제
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 시스템 메트릭 카드들 */}
          {metrics && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{
                  p: 2,
                  bgcolor: COLORS.backgroundCard,
                  border: `1px solid ${COLORS.borderPrimary}`,
                  borderRadius: 1,
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SpeedIcon sx={{ color: COLORS.accentPrimary, mr: 1, fontSize: '1.25rem' }} />
                    <Typography variant="subtitle2" sx={{ color: COLORS.textPrimary, fontSize: '0.875rem' }}>
                      CPU 사용률
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{
                    color: COLORS.textPrimary,
                    fontWeight: 700,
                    fontSize: '1.75rem',
                    mb: 1
                  }}>
                    {metrics.cpu.usage.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: COLORS.textSecondary,
                    fontSize: '0.75rem',
                    mb: 1,
                    display: 'block'
                  }}>
                    {metrics.cpu.cores}코어
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.cpu.usage}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: COLORS.borderPrimary,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: metrics.cpu.usage > 80 ? COLORS.danger :
                                metrics.cpu.usage > 60 ? COLORS.warning : COLORS.success,
                        borderRadius: 3,
                      }
                    }}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{
                  p: 2,
                  bgcolor: COLORS.backgroundCard,
                  border: `1px solid ${COLORS.borderPrimary}`,
                  borderRadius: 1,
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MemoryIcon sx={{ color: COLORS.info, mr: 1, fontSize: '1.25rem' }} />
                    <Typography variant="subtitle2" sx={{ color: COLORS.textPrimary, fontSize: '0.875rem' }}>
                      메모리 사용량
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{
                    color: COLORS.textPrimary,
                    fontWeight: 700,
                    fontSize: '1.75rem',
                    mb: 1
                  }}>
                    {metrics.memory.usage.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: COLORS.textSecondary,
                    fontSize: '0.75rem',
                    mb: 1,
                    display: 'block'
                  }}>
                    {metrics.memory.used.toFixed(1)}GB / {metrics.memory.total.toFixed(1)}GB
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.memory.usage}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: COLORS.borderPrimary,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: metrics.memory.usage > 80 ? COLORS.danger :
                                metrics.memory.usage > 60 ? COLORS.warning : COLORS.info,
                        borderRadius: 3,
                      }
                    }}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{
                  p: 2,
                  bgcolor: COLORS.backgroundCard,
                  border: `1px solid ${COLORS.borderPrimary}`,
                  borderRadius: 1,
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <StorageIcon sx={{ color: COLORS.warning, mr: 1, fontSize: '1.25rem' }} />
                    <Typography variant="subtitle2" sx={{ color: COLORS.textPrimary, fontSize: '0.875rem' }}>
                      디스크 사용률
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{
                    color: COLORS.textPrimary,
                    fontWeight: 700,
                    fontSize: '1.75rem',
                    mb: 1
                  }}>
                    {metrics.disk.usage.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: COLORS.textSecondary,
                    fontSize: '0.75rem',
                    mb: 1,
                    display: 'block'
                  }}>
                    {metrics.disk.used.toFixed(0)}GB / {metrics.disk.total.toFixed(0)}GB
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.disk.usage}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: COLORS.borderPrimary,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: metrics.disk.usage > 80 ? COLORS.danger :
                                metrics.disk.usage > 60 ? COLORS.warning : COLORS.warning,
                        borderRadius: 3,
                      }
                    }}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{
                  p: 2,
                  bgcolor: COLORS.backgroundCard,
                  border: `1px solid ${COLORS.borderPrimary}`,
                  borderRadius: 1,
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <NetworkIcon sx={{ color: COLORS.success, mr: 1, fontSize: '1.25rem' }} />
                    <Typography variant="subtitle2" sx={{ color: COLORS.textPrimary, fontSize: '0.875rem' }}>
                      네트워크 트래픽
                    </Typography>
                  </Box>
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontSize: '0.75rem' }}>
                        입력:
                      </Typography>
                      <Typography variant="body2" sx={{ color: COLORS.textPrimary, fontSize: '0.75rem', fontWeight: 600 }}>
                        {formatBytes(metrics.network.bytesIn)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontSize: '0.75rem' }}>
                        출력:
                      </Typography>
                      <Typography variant="body2" sx={{ color: COLORS.textPrimary, fontSize: '0.75rem', fontWeight: 600 }}>
                        {formatBytes(metrics.network.bytesOut)}
                      </Typography>
                    </Box>
                    {metrics.network.throughputIn && metrics.network.throughputIn > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.6875rem' }}>
                          처리량:
                        </Typography>
                        <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.6875rem' }}>
                          {metrics.network.throughputIn.toFixed(1)} Mbps
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </>
          )}

          {/* 홈서버 서비스 상태 테이블 */}
          <Grid item xs={12}>
            <Paper sx={{
              p: 2,
              bgcolor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 1
            }}>
              <Typography variant="h6" sx={{
                color: COLORS.textPrimary,
                mb: 2,
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <ServerIcon sx={{ color: COLORS.accentPrimary, fontSize: '1.25rem' }} />
                서비스 상태 상세
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{
                        color: COLORS.textSecondary,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        py: 1.5
                      }}>
                        서비스
                      </TableCell>
                      <TableCell sx={{
                        color: COLORS.textSecondary,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        py: 1.5
                      }}>
                        상태
                      </TableCell>
                      <TableCell sx={{
                        color: COLORS.textSecondary,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        py: 1.5
                      }}>
                        응답시간
                      </TableCell>
                      <TableCell sx={{
                        color: COLORS.textSecondary,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        py: 1.5
                      }}>
                        상세 정보
                      </TableCell>
                      <TableCell sx={{
                        color: COLORS.textSecondary,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        py: 1.5
                      }}>
                        마지막 확인
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{
                          textAlign: 'center',
                          py: 3,
                          color: COLORS.textSecondary,
                          fontSize: '0.875rem'
                        }}>
                          서비스 상태 정보가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      services.map((service, index) => (
                        <TableRow key={index} hover sx={{
                          '&:hover': {
                            backgroundColor: COLORS.backgroundSurface
                          }
                        }}>
                          <TableCell sx={{
                            color: COLORS.textPrimary,
                            fontSize: '0.875rem',
                            py: 1.5,
                            fontWeight: 500
                          }}>
                            {service.serviceName}
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Chip
                              label={getStatusText(service.status)}
                              size="small"
                              icon={getStatusIcon(service.status)}
                              sx={{
                                bgcolor: `${getStatusColor(service.status)}15`,
                                color: getStatusColor(service.status),
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 24
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{
                            color: COLORS.textPrimary,
                            fontSize: '0.875rem',
                            py: 1.5
                          }}>
                            {service.responseTime > 0 ? `${service.responseTime}ms` : 'N/A'}
                          </TableCell>
                          <TableCell sx={{
                            color: COLORS.textSecondary,
                            fontSize: '0.875rem',
                            py: 1.5
                          }}>
                            {service.details || '-'}
                          </TableCell>
                          <TableCell sx={{
                            color: COLORS.textSecondary,
                            fontSize: '0.875rem',
                            py: 1.5
                          }}>
                            {service.lastChecked ?
                              new Date(service.lastChecked).toLocaleTimeString() :
                              'N/A'
                            }
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminServices;
