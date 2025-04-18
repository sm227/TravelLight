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
  Collapse,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Public as PublicIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  BarChart as BarChartIcon,
  Event as EventIcon,
  Storefront as StorefrontIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { text: '시스템 현황', icon: <SpeedIcon />, path: '/admin' },
    { text: '보관함 모니터링', icon: <StorageIcon />, path: '/admin/lockers' },
    { text: '서비스 상태', icon: <MemoryIcon />, path: '/admin/services' },
    { text: '실시간 통계', icon: <BarChartIcon />, path: '/admin/stats' },
    { text: '로그 분석', icon: <TimelineIcon />, path: '/admin/logs' },
    { text: '이벤트 짐보관', icon: <EventIcon />, path: '/admin/event-storage' },
    { text: '제휴점 관리', icon: <StorefrontIcon />, path: '/admin/partnerships' },
    { text: '설정', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  return (
    <Box className="admin-layout">
      <Box 
        className="sidebar"
        sx={{ 
          width: collapsed ? '60px' : '240px',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          backgroundColor: 'var(--background-darker)',
          borderRight: '1px solid var(--border-color)'
        }}
      >
        {/* 헤더 */}
        <Box 
          sx={{ 
            p: collapsed ? 1 : 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: collapsed ? 'center' : 'space-between',
            height: '64px',
          }}
        >
          {!collapsed && (
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'var(--accent-color)', 
                fontWeight: 600,
                fontSize: '1.1rem',
                letterSpacing: '0.5px'
              }}
            >
              TravelLight ERP
            </Typography>
          )}
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            size="small"
            sx={{
              color: 'var(--text-secondary)',
              '&:hover': {
                color: 'var(--text-primary)',
                backgroundColor: alpha('#fff', 0.05)
              }
            }}
          >
            {collapsed ? <MenuIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Box>
        
        <Divider sx={{ borderColor: alpha('#fff', 0.1) }} />
        
        {/* 상단 아이콘 메뉴 */}
        <Box sx={{ p: collapsed ? 0.5 : 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Tooltip title="알림" placement="right">
            <IconButton 
              size="small" 
              sx={{ 
                color: 'var(--text-secondary)',
                '&:hover': { color: 'var(--accent-color)' }
              }}
            >
              <NotificationsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="히스토리" placement="right">
            <IconButton 
              size="small" 
              sx={{ 
                color: 'var(--text-secondary)',
                '&:hover': { color: 'var(--accent-color)' }
              }}
            >
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {!collapsed && (
            <Tooltip title="대시보드 관리" placement="right">
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'var(--text-secondary)',
                  '&:hover': { color: 'var(--accent-color)' }
                }}
              >
                <PublicIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Divider sx={{ borderColor: alpha('#fff', 0.1), my: 1 }} />
        
        {/* 네비게이션 메뉴 */}
        <List component="nav" sx={{ p: collapsed ? 0.5 : 1 }}>
          {menuItems.map((item) => (
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
                  minHeight: 48,
                  px: collapsed ? 1 : 2,
                  borderRadius: '4px',
                  mb: 0.5,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: location.pathname === item.path ? 'var(--accent-color)' : 'var(--text-secondary)',
                  backgroundColor: location.pathname === item.path ? 'var(--background-selected)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'var(--background-hover)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'var(--background-selected)',
                    '&:hover': {
                      backgroundColor: 'var(--background-selected-hover)',
                    }
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: 'inherit', 
                    minWidth: collapsed ? 0 : 40,
                    mr: collapsed ? 0 : 2,
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: location.pathname === item.path ? 600 : 400
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Box>
      
      <Box 
        component="main" 
        className="main-content"
        sx={{ 
          flexGrow: 1, 
          marginLeft: collapsed ? '60px' : '240px',
          transition: 'margin-left 0.3s ease',
          backgroundColor: 'var(--background-dark)',
          height: '100vh',
          overflow: 'auto'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout; 