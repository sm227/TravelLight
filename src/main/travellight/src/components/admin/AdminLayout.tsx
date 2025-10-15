import React, { useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  alpha,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  MonitorHeart as MonitorHeartIcon,
  CloudQueue as CloudQueueIcon,
  Event as EventIcon,
  Handshake as HandshakeIcon,
  Store as StoreIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon,
  RateReview as RateReviewIcon,
  Logout as LogoutIcon,
  QuestionAnswer as QuestionAnswerIcon,
  LiveHelp as LiveHelpIcon,
  LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';

// 전문적인 ERP 색상 정의
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
  backgroundHover: 'rgba(255, 255, 255, 0.05)',
  backgroundSelected: 'rgba(59, 130, 246, 0.1)',
  backgroundSelectedHover: 'rgba(59, 130, 246, 0.15)'
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // 로그아웃 핸들러
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // 섹션별로 구조화된 메뉴 항목
  const menuSections = [
    {
      title: '대시보드',
      items: [
        { text: '서비스 현황', icon: <DashboardIcon />, path: '/admin' },
        { text: '실시간 분석', icon: <AssessmentIcon />, path: '/admin/analytics' },
      ]
    },
    {
      title: '운영 관리',
      items: [
        { text: '보관함 모니터링', icon: <InventoryIcon />, path: '/admin/lockers' },
        { text: '시스템 상태', icon: <MonitorHeartIcon />, path: '/admin/services' },
        { text: '이벤트 짐보관', icon: <EventIcon />, path: '/admin/event-storage' },
        { text: '클라우드 현황', icon: <CloudQueueIcon />, path: '/admin/cloud-status' },
      ]
    },
    {
      title: '파트너십',
      items: [
        { text: '제휴점 관리', icon: <HandshakeIcon />, path: '/admin/partnerships' },
        { text: '매장 현황', icon: <StoreIcon />, path: '/admin/stores' },
      ]
    },
    {
      title: '고객 서비스',
      items: [
        { text: 'FAQ 관리', icon: <QuestionAnswerIcon />, path: '/admin/faqs' },
        { text: '문의 관리', icon: <LiveHelpIcon />, path: '/admin/inquiries' },
        { text: '리뷰 관리', icon: <RateReviewIcon />, path: '/admin/reviews' },
        { text: '쿠폰 관리', icon: <LocalOfferIcon />, path: '/admin/coupons' },
      ]
    },
    {
      title: '시스템',
      items: [
        { text: '사용자 관리', icon: <PeopleIcon />, path: '/admin/users' },
        { text: 'HR 관리', icon: <WorkIcon />, path: '/admin/hr' },
        { text: '로그 분석', icon: <AnalyticsIcon />, path: '/admin/logs' },
        { text: '시스템 설정', icon: <SettingsIcon />, path: '/admin/settings' },
      ]
    }
  ];

  const renderSectionHeader = (title: string) => {
    if (collapsed) return null;
    
    return (
      <Typography
        variant="overline"
        sx={{
          color: COLORS.textMuted,
          fontSize: '0.625rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          px: 2,
          py: 1,
          display: 'block',
          textTransform: 'uppercase'
        }}
      >
        {title}
      </Typography>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex',
      height: '100vh',
      bgcolor: COLORS.backgroundDark,
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      {/* 사이드바 */}
      <Box 
        sx={{ 
          width: collapsed ? '60px' : '260px',
          flexShrink: 0,
          transition: 'width 0.3s ease',
          backgroundColor: COLORS.backgroundLight,
          borderRight: `1px solid ${COLORS.borderPrimary}`,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'relative',
          zIndex: 1000
        }}
      >
        {/* 헤더 */}
        <Box 
          sx={{ 
            px: collapsed ? 1.5 : 2, 
            py: 2,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: collapsed ? 'center' : 'space-between',
            minHeight: '64px',
            borderBottom: `1px solid ${COLORS.borderPrimary}`,
            flexShrink: 0
          }}
        >
          {!collapsed && (
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: COLORS.accentPrimary, 
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                  mb: 0.25
                }}
              >
                Travelight
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: COLORS.textMuted,
                  fontSize: '0.625rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  lineHeight: 1
                }}
              >
                Enterprise Resource Planning
              </Typography>
            </Box>
          )}
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            size="small"
            sx={{
              color: COLORS.textSecondary,
              flexShrink: 0,
              '&:hover': {
                color: COLORS.textPrimary,
                backgroundColor: COLORS.backgroundHover
              }
            }}
          >
            {collapsed ? <MenuIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Box>
        
        {/* 상단 퀵 액션 */}
        <Box sx={{ 
          px: collapsed ? 0.5 : 1.5, 
          py: collapsed ? 1 : 1.5,
          display: 'flex', 
          flexDirection: collapsed ? 'column' : 'row',
          justifyContent: collapsed ? 'center' : 'space-around', 
          alignItems: 'center',
          gap: collapsed ? 0.5 : 1,
          borderBottom: `1px solid ${COLORS.borderPrimary}`,
          flexShrink: 0
        }}>
          <Tooltip title="알림 센터" placement="right">
            <IconButton 
              size="small" 
              sx={{ 
                color: COLORS.textSecondary,
                width: collapsed ? 28 : 'auto',
                height: collapsed ? 28 : 'auto',
                '&:hover': { 
                  color: COLORS.accentPrimary,
                  backgroundColor: COLORS.backgroundHover
                }
              }}
            >
              <NotificationsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="시스템 로그" placement="right">
            <IconButton 
              size="small" 
              sx={{ 
                color: COLORS.textSecondary,
                width: collapsed ? 28 : 'auto',
                height: collapsed ? 28 : 'auto',
                '&:hover': { 
                  color: COLORS.accentPrimary,
                  backgroundColor: COLORS.backgroundHover
                }
              }}
            >
              <TimelineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="활동 히스토리" placement="right">
            <IconButton 
              size="small" 
              sx={{ 
                color: COLORS.textSecondary,
                width: collapsed ? 28 : 'auto',
                height: collapsed ? 28 : 'auto',
                display: collapsed ? 'flex' : 'flex',
                '&:hover': { 
                  color: COLORS.accentPrimary,
                  backgroundColor: COLORS.backgroundHover
                }
              }}
            >
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* 네비게이션 메뉴 */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          py: 1,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: COLORS.borderPrimary,
            borderRadius: '2px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: COLORS.borderSecondary,
          }
        }}>
          {menuSections.map((section, sectionIndex) => (
            <Box key={section.title}>
              {renderSectionHeader(section.title)}
              
              <List component="nav" sx={{ px: collapsed ? 0.5 : 1, py: 0 }}>
                {section.items.map((item) => (
                  <Tooltip
                    key={item.text}
                    title={collapsed ? item.text : ''}
                    placement="right"
                    disableHoverListener={!collapsed}
                  >
                    <ListItemButton
                      onClick={() => navigate(item.path)}
                      selected={location.pathname === item.path}
                      sx={{
                        minHeight: 36,
                        px: collapsed ? 1 : 1.5,
                        py: 0.75,
                        borderRadius: 1,
                        mb: 0.25,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        color: location.pathname === item.path ? COLORS.accentPrimary : COLORS.textSecondary,
                        backgroundColor: location.pathname === item.path ? COLORS.backgroundSelected : 'transparent',
                        '&:hover': {
                          backgroundColor: COLORS.backgroundHover,
                          color: COLORS.textPrimary
                        },
                        '&.Mui-selected': {
                          backgroundColor: COLORS.backgroundSelected,
                          '&:hover': {
                            backgroundColor: COLORS.backgroundSelectedHover,
                          }
                        }
                      }}
                    >
                      <ListItemIcon 
                        sx={{ 
                          color: 'inherit', 
                          minWidth: collapsed ? 0 : 28,
                          mr: collapsed ? 0 : 1,
                          justifyContent: 'center'
                        }}
                      >
                        {React.cloneElement(item.icon, { sx: { fontSize: '1rem' } })}
                      </ListItemIcon>
                      {!collapsed && (
                        <ListItemText 
                          primary={item.text}
                          primaryTypographyProps={{
                            fontSize: '0.8125rem',
                            fontWeight: location.pathname === item.path ? 600 : 500,
                            lineHeight: 1.2
                          }}
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>
                ))}
              </List>
              
              {/* 섹션 구분선 (마지막 섹션 제외) */}
              {sectionIndex < menuSections.length - 1 && (
                <Box sx={{ px: collapsed ? 1 : 2, py: 1 }}>
                  <Divider sx={{ borderColor: COLORS.borderPrimary }} />
                </Box>
              )}
            </Box>
          ))}
        </Box>
        
        {/* 하단 상태 표시 */}
        {!collapsed && (
          <Box sx={{ 
            p: 2, 
            borderTop: `1px solid ${COLORS.borderPrimary}`,
            flexShrink: 0
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              p: 1.5,
              bgcolor: COLORS.backgroundCard,
              borderRadius: 1,
              mb: 2
            }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: COLORS.accentPrimary,
                flexShrink: 0
              }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ 
                  color: COLORS.textPrimary,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  display: 'block',
                  lineHeight: 1.2
                }}>
                  시스템 정상
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: COLORS.textMuted,
                  fontSize: '0.625rem',
                  lineHeight: 1.2
                }}>
                  모든 서비스 활성화
                </Typography>
              </Box>
            </Box>

            {/* 관리자 정보 및 로그아웃 */}
            {user && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 1
              }}>

                <ListItemButton
                  onClick={handleLogout}
                  sx={{
                    minHeight: 36,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1,
                    justifyContent: 'flex-start',
                    color: '#ef4444',
                    backgroundColor: 'transparent',
                    border: `1px solid #ef4444`,
                    '&:hover': {
                      backgroundColor: alpha('#ef4444', 0.1),
                      color: '#ef4444'
                    },
                    transition: 'all 0.15s ease'
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 'unset',
                      color: 'inherit',
                      mr: 1.5,
                      '& .MuiSvgIcon-root': {
                        fontSize: '1rem'
                      }
                    }}
                  >
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="로그아웃" 
                    primaryTypographyProps={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'inherit'
                    }}
                  />
                </ListItemButton>
              </Box>
            )}
          </Box>
        )}
      </Box>
      
      {/* 메인 콘텐츠 */}
      <Box 
        component="main" 
        sx={{ 
          flex: 1,
          backgroundColor: COLORS.backgroundDark,
          height: '100vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout; 