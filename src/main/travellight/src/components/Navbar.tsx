import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import LuggageIcon from '@mui/icons-material/Luggage';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import TranslateIcon from '@mui/icons-material/Translate';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LanguageIcon from '@mui/icons-material/Language';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useTranslation } from 'react-i18next';

interface MenuItem {
  text: string;
  href?: string;
  onClick?: () => void;
}

// 메뉴 스타일 정의
const menuStyles = {
  '& .MuiPaper-root': {
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    border: '1px solid #f3f4f6',
    minWidth: '160px',
    marginTop: '8px',
  },
  '& .MuiMenuItem-root': {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a1a1a',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    '&:hover': {
      backgroundColor: '#f9fafb',
      color: '#2563eb',
    },
    '&:first-of-type': {
      marginTop: '4px',
    },
    '&:last-of-type': {
      marginBottom: '4px',
    },
    '& .MuiSvgIcon-root': {
      fontSize: '18px',
    },
  },
  '& .MuiDivider-root': {
    margin: '6px 0',
    borderColor: '#f3f4f6',
  },
};

// 로그아웃 메뉴 아이템 스타일
const logoutMenuItemStyles = {
  color: '#dc2626 !important',
  '&:hover': {
    backgroundColor: '#fee2e2 !important',
    color: '#dc2626 !important',
  },
};

const Navbar: React.FC = () => {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const handleOverlayClose = () => setOverlayOpen(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [partnerMenuAnchorEl, setPartnerMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [langMenuAnchorEl, setLangMenuAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, isPartner, isWaiting, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // 파트너 관련 페이지인지 확인
  const isPartnerPage = location.pathname.includes('/partner') ||
                       location.pathname.includes('/StoragePartnership') ||
                       location.pathname.includes('/EventStorage') ||
                       location.pathname.includes('/Inquiry');

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handlePartnerMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPartnerMenuAnchorEl(event.currentTarget);
  };

  const handlePartnerMenuClose = () => {
    setPartnerMenuAnchorEl(null);
  };

  const partnerMenuOpen = Boolean(partnerMenuAnchorEl);

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangMenuAnchorEl(event.currentTarget);
  };

  const handleLangMenuClose = () => {
    setLangMenuAnchorEl(null);
  };

  const changeLanguage = (lng: string) => {
    localStorage.setItem('preferredLanguage', lng);
    handleLangMenuClose();
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Navigation to Partnership Pages
  const navigateToStoragePartnership = () => {
    handlePartnerMenuClose();
    navigate('/StoragePartnership');
  };

  const navigateToEventStorage = () => {
    handlePartnerMenuClose();
    navigate('/EventStorage');
  };

  const navigateToInquiry = () => {
    handlePartnerMenuClose();
    navigate('/Inquiry');
  }

  const navigateToFAQ = () => {
    handlePartnerMenuClose();
    navigate('/FAQ');
  };

  const navigateToPartner = () => {
    handlePartnerMenuClose();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/partner' } });
      return;
    }
    
    if (isPartner) {
      navigate('/partner-dashboard');
    } else if (isWaiting) {
      navigate('/partner-dashboard');
    } else {
      navigate('/partner');
    }
  };

  // 햄버거 메뉴 아이템 구성
  const hamburgerMenuItems = [
    { text: t('home'), href: '/#home', type: 'main' as const },
    { text: t('services'), href: '/#services', type: 'main' as const },
    { text: t('howItWorks'), onClick: navigateToFAQ, type: 'main' as const },
    { text: t('pricing'), href: '/#pricing', type: 'main' as const },
    { text: t('partner'), onClick: navigateToPartner, type: 'main' as const },
  ];

  const partnerSubMenuItems = [
    { text: t('storageService'), onClick: navigateToStoragePartnership, type: 'sub' as const },
    { text: t('eventStorage'), onClick: navigateToEventStorage, type: 'sub' as const },
    { text: '1:1 문의', onClick: navigateToInquiry, type: 'sub' as const },
  ];

  // 모든 메뉴 아이템 통합 (SpacerDiv를 위해 특별 아이템 추가)
  const allMenuItems = [
    ...hamburgerMenuItems,
    { text: '', type: 'spacer' as const, key: 'spacer' }, // 공간 구분자
    ...partnerSubMenuItems
  ];

  const handleMenuItemClick = (item: { text: string; href?: string; onClick?: () => void }, index: number) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
    setOverlayOpen(false); // 메뉴 아이템 클릭 시 오버레이 닫기
  };

  const isMenuOpen = Boolean(anchorEl);
  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen && isAuthenticated}
      onClose={handleMenuClose}
      sx={menuStyles}
    >
      <MenuItem onClick={() => { handleMenuClose(); navigate('/map', { state: { showReservations: true } }); }}>
        <BookmarkIcon />
        내 예약
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/mypage'); }}>
        <PersonIcon />
        {t('myPage')}
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
        <AccountCircleIcon />
        {t('profile')}
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
        <SettingsIcon />
        {t('settings')}
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout} sx={logoutMenuItemStyles}>
        <LogoutIcon />
        {t('logout')}
      </MenuItem>
    </Menu>
  );

  const isLangMenuOpen = Boolean(langMenuAnchorEl);

  const menuItems: MenuItem[] = [
    { text: t('home'), href: '/' },
    { text: t('about'), href: '/about' },
    { text: t('services'), href: '/services' },
    { text: t('contact'), href: '/contact' },
  ];

  return (
    <>
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          background: isPartnerPage
            ? '#2E7DF1'
            : 'white',
          transition: 'background 0.3s ease',
          borderRadius: 0,
          boxShadow: isPartnerPage ? 'none' : undefined,
          border: isPartnerPage ? 'none' : undefined,
          borderBottom: isPartnerPage ? 'none' : undefined
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                fontWeight: 700,
                color: isPartnerPage ? 'white' : 'primary.main',
                textDecoration: 'none',
                flexGrow: 1,
                transition: 'color 0.3s ease'
              }}
            >
              <LuggageIcon sx={{ mr: 1 }} />
              Travelight
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* 번역 아이콘 버튼 */}
              <IconButton
                aria-label={t('language')}
                aria-controls={isLangMenuOpen ? 'language-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={isLangMenuOpen ? 'true' : undefined}
                onClick={handleLangMenuOpen}
                size="small"
                sx={{
                  mx: 1,
                    fontSize: '1.5rem',
                    '&:hover': {
                        backgroundColor: 'rgba(37, 99, 235, 0.04)'  // 호버 효과
                    },
                  color: isPartnerPage ? 'white' : 'primary.main',
                  transition: 'color 0.3s ease'
                }}
              >
                <TranslateIcon />
              </IconButton>
              
              {/* 사용자 아이콘 버튼 또는 사용자 이름 */}
              {isAuthenticated ? (
                <Button
                  onClick={handleProfileMenuOpen}
                  sx={{ 
                    ml: 1, 
                    textTransform: 'none',
                    fontWeight: 'medium',
                    display: 'flex',
                    alignItems: 'center',
                    color: isPartnerPage ? 'white' : 'primary.main',
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      backgroundColor: isPartnerPage ? 'rgba(255, 255, 255, 0.1)' : 'rgba(46, 125, 241, 0.1)'
                    }
                  }}
                  endIcon={<ArrowDropDownIcon />}
                >
                  {user?.name}님
                </Button>
              ) : (
                <IconButton
                  aria-label="user menu"
                  onClick={handleProfileMenuOpen}
                  size="small"
                  sx={{
                    mx: 1,
                    color: isPartnerPage ? 'white' : 'primary.main',
                    transition: 'color 0.3s ease'
                  }}
                >
                  <AccountCircleIcon />
                </IconButton>
              )}
              
              {/* 🍔 햄버거/X 메뉴 버튼 */}
              <IconButton
                onClick={() => setOverlayOpen(!overlayOpen)}
                sx={{
                  mx: 1,
                  color: isPartnerPage ? 'white' : 'primary.main',
                  transition: 'color 0.3s ease, transform 0.2s ease',
                  '&:hover': {
                    backgroundColor: isPartnerPage ? 'rgba(255, 255, 255, 0.1)' : 'rgba(46, 125, 241, 0.1)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  {/* 첫 번째 선 */}
                  <Box
                    sx={{
                      width: '18px',
                      height: '2px',
                      backgroundColor: 'currentColor',
                      borderRadius: '1px',
                      position: 'absolute',
                      top: overlayOpen ? '50%' : '6px',
                      transform: overlayOpen ? 'translateY(-50%) rotate(45deg)' : 'translateY(0) rotate(0deg)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                  {/* 두 번째 선 */}
                  <Box
                    sx={{
                      width: '18px',
                      height: '2px',
                      backgroundColor: 'currentColor',
                      borderRadius: '1px',
                      position: 'absolute',
                      top: '11px',
                      opacity: overlayOpen ? 0 : 1,
                      transform: overlayOpen ? 'scale(0)' : 'scale(1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                  {/* 세 번째 선 */}
                  <Box
                    sx={{
                      width: '18px',
                      height: '2px',
                      backgroundColor: 'currentColor',
                      borderRadius: '1px',
                      position: 'absolute',
                      top: overlayOpen ? '50%' : '16px',
                      transform: overlayOpen ? 'translateY(-50%) rotate(-45deg)' : 'translateY(0) rotate(0deg)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </Box>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
        {renderMenu}
        
        <Menu
          id="language-menu"
          anchorEl={langMenuAnchorEl}
          open={isLangMenuOpen}
          onClose={handleLangMenuClose}
          MenuListProps={{
            'aria-labelledby': 'language-button',
          }}
          sx={menuStyles}
        >
          <MenuItem onClick={() => changeLanguage('ko')}>
            <LanguageIcon />
            {t('korean')}
          </MenuItem>
          <MenuItem onClick={() => changeLanguage('en')}>
            <LanguageIcon />
            {t('english')}
          </MenuItem>
        </Menu>
        
        {/* 로그인하지 않은 사용자를 위한 계정 메뉴 */}
        <Menu
          id="user-account-menu"
          anchorEl={anchorEl}
          open={isMenuOpen && !isAuthenticated}
          onClose={handleMenuClose}
          MenuListProps={{
            'aria-labelledby': 'user-account-button',
          }}
          sx={menuStyles}
        >
          <MenuItem onClick={() => { handleMenuClose(); navigate('/login'); }}>
            <LoginIcon />
            {t('login')}
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/register'); }}>
            <PersonAddIcon />
            {t('register')}
          </MenuItem>
        </Menu>
      </AppBar>
      
      {/* 토스뱅크 스타일 드롭다운 메뉴 */}
      <Box
        sx={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          zIndex: 2999,
          backgroundColor: '#ffffff',
          boxShadow: overlayOpen ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
          height: overlayOpen ? 'auto' : '0',
          opacity: overlayOpen ? 1 : 0,
          transform: overlayOpen ? 'scaleY(1)' : 'scaleY(0)',
          transformOrigin: 'top',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
          overflow: 'hidden',
          borderBottom: overlayOpen ? '1px solid #f0f0f0' : 'none',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ py: 3, px: { xs: 2, sm: 4 } }}>
            {/* 메인 메뉴 아이템들 - 2열 그리드 배치 */}
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: { xs: 0, sm: 3 },
              mb: 3
            }}>
              {hamburgerMenuItems.map((item, idx) => (
                <Box
                  key={item.text}
                  onClick={() => handleMenuItemClick(item, idx)}
                  sx={{
                    py: { xs: 2, sm: 1.5 },
                    px: { xs: 0, sm: 2 },
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#333333',
                    borderRadius: { xs: 0, sm: '8px' },
                    borderBottom: { xs: '1px solid #f5f5f5', sm: 'none' },
                    '&:hover': {
                      color: '#0066ff',
                      backgroundColor: '#fafafa',
                      paddingLeft: { xs: '8px', sm: '16px' },
                    },
                    '&:last-child': {
                      borderBottom: { xs: 'none', sm: 'none' },
                    },
                    opacity: overlayOpen ? 1 : 0,
                    transform: overlayOpen ? 'translateY(0)' : 'translateY(-10px)',
                    transition: `opacity 0.3s ${idx * 0.05}s ease, transform 0.3s ${idx * 0.05}s ease, color 0.2s ease, background-color 0.2s ease, padding-left 0.2s ease`,
                  }}
                >
                  {item.text}
                </Box>
              ))}
            </Box>

            {/* 파트너 서비스 섹션 */}
            <Box>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#999999',
                  mb: 1.5,
                  pb: 1,
                  borderBottom: '1px solid #f0f0f0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                파트너 서비스
              </Typography>
              <Box sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 0, sm: 2 },
                flexWrap: 'wrap'
              }}>
                {partnerSubMenuItems.map((item, idx) => (
                  <Box
                    key={item.text}
                    onClick={() => handleMenuItemClick(item, idx)}
                    sx={{
                      py: { xs: 1.5, sm: 1 },
                      px: { xs: 0, sm: 2 },
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#666666',
                      borderRadius: { xs: 0, sm: '6px' },
                      minWidth: { sm: '140px' },
                      '&:hover': {
                        color: '#0066ff',
                        backgroundColor: '#fafafa',
                        paddingLeft: { xs: '8px', sm: '12px' },
                      },
                      opacity: overlayOpen ? 1 : 0,
                      transform: overlayOpen ? 'translateY(0)' : 'translateY(-10px)',
                      transition: `opacity 0.3s ${(hamburgerMenuItems.length + idx) * 0.05}s ease, transform 0.3s ${(hamburgerMenuItems.length + idx) * 0.05}s ease, color 0.2s ease, background-color 0.2s ease, padding-left 0.2s ease`,
                    }}
                  >
                    {item.text}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 오버레이 배경 (클릭 시 메뉴 닫기) - 네비바 아래부터 시작 */}
      {overlayOpen && (
        <Box
          onClick={handleOverlayClose}
          sx={{
            position: 'fixed',
            top: '64px', // 네비바 아래부터 시작
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2998,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(4px)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        />
      )}
      <Box sx={{ height: '64px' }} /> {/* AppBar 높이만큼의 여백 추가 */}
    </>
  );
};

export default Navbar;