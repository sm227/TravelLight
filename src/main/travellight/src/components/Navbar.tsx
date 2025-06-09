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
import CompleteHamburgerOverlayMenu from './CompleteHamburgerOverlayMenu';
import {hover} from "framer-motion";

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

  const handleMenuItemClick = (item: any, index: number) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
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
              
              {/* 🍔 완성된 햄버거 메뉴 */}
              <CompleteHamburgerOverlayMenu
                menuItems={allMenuItems}
                title=""
                slideDirection="right"
                buttonPosition="relative"
                showCloseButton={true}
                onMenuItemClick={handleMenuItemClick}
                customStyles={{
                  overlay: {
                    zIndex: 3000,
                    backgroundColor: 'rgba(0, 0, 0, 0.10)'
                  },
                  panel: {
                    padding: '60px 40px 40px 40px',
                  },
                  menuItem: {
                    itemColor: '#2c3e50',
                    itemHoverColor: '#3498db',
                    subItemSize: '18px',
                    itemSize: '26px',
                    margin: '24px 0',
                    subItemMargin: '18px 0 18px 20px',
                    underlineColor: '#3498db',
                    underlineHeight: '2px'
                  }
                }}
                ariaLabel="메뉴"
              />
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
      {/* 오버레이 메뉴: 항상 DOM에 렌더링, 스타일로만 제어 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 3000,
          display: 'flex',
          flexDirection: 'row',
          pointerEvents: overlayOpen ? 'auto' : 'none',
        }}
      >
        {/* 블러+반투명 배경 (메뉴 패널 제외 전체) */}
        <div
          onClick={overlayOpen ? handleOverlayClose : undefined}
          style={{
            flex: 1,
            height: '100vh',
            background: 'rgba(0,0,0,0.10)',
            backdropFilter: overlayOpen ? 'blur(8px)' : 'none',
            cursor: overlayOpen ? 'pointer' : 'default',
            transition: 'backdrop-filter 0.4s, background 0.4s',
            opacity: overlayOpen ? 1 : 0,
            pointerEvents: overlayOpen ? 'auto' : 'none',
          }}
        />
        {/* 오른쪽 메뉴 패널 */}
        <div
          style={{
            width: 400,
            maxWidth: '90vw',
            height: '100vh',
            background: 'rgba(255,255,255,1)',
            boxShadow: '-2px 0 16px rgba(0,0,0,0.08)',
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            padding: '48px 40px',
            transform: overlayOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.4s cubic-bezier(.77,0,.18,1), opacity 0.3s',
            opacity: overlayOpen ? 1 : 0,
            pointerEvents: overlayOpen ? 'auto' : 'none',
            flexShrink: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {/* 나가기 버튼 */}
          <IconButton
            onClick={handleOverlayClose}
            sx={{
              position: 'sticky',
              top: 24,
              right: 24,
              width: 48,
              height: 48,
              zIndex: 10,
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              '&:hover': { background: '#f5f5f5' },
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="11" fill="#f5f5f5" />
              <line x1="8" y1="8" x2="16" y2="16" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
              <line x1="16" y1="8" x2="8" y2="16" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </IconButton>
          {/* 애니메이션 효과 유지 */}
          <div style={{ marginTop: 40, width: '100%', maxWidth: 400, textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            {menuItems.map((item, idx) => (
              <div
                key={item.text}
                style={{
                  display: 'inline-block',
                  fontSize: 28,
                  fontWeight: 600,
                  margin: '28px 0',
                  opacity: overlayOpen ? 1 : 0,
                  transform: overlayOpen ? 'translateY(0)' : 'translateY(30px)',
                  transition: `opacity 0.4s ${idx * 0.05}s, transform 0.4s ${idx * 0.05}s`,
                  cursor: 'pointer',
                  position: 'relative',
                  width: 'fit-content',
                }}
                onClick={() => {
                  setOverlayOpen(false);
                  if (item.onClick) {
                    item.onClick();
                  } else if (item.href) {
                    window.location.href = item.href;
                  }
                }}
                onMouseEnter={e => {
                  const underline = e.currentTarget.querySelector('.menu-underline') as HTMLElement;
                  if (underline) underline.style.transform = 'scaleX(1)';
                }}
                onMouseLeave={e => {
                  const underline = e.currentTarget.querySelector('.menu-underline') as HTMLElement;
                  if (underline) underline.style.transform = 'scaleX(0)';
                }}
              >
                {item.text}
                <div
                  className="menu-underline"
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    height: 2,
                    background: '#222',
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.3s'
                  }}
                />
              </div>
            ))}
            <div style={{ height: 32 }} />
            {partnerSubMenuItems.map((item, idx) => (
              <div
                key={item.text}
                style={{
                  display: 'inline-block',
                  fontSize: 20,
                  fontWeight: 400,
                  margin: '16px 0',
                  opacity: overlayOpen ? 1 : 0,
                  transform: overlayOpen ? 'translateY(0)' : 'translateY(30px)',
                  transition: `opacity 0.4s ${(menuItems.length + idx) * 0.05}s, transform 0.4s ${(menuItems.length + idx) * 0.05}s`,
                  cursor: 'pointer',
                  position: 'relative',
                  width: 'fit-content'
                }}
                onClick={() => {
                  setOverlayOpen(false);
                  item.onClick();
                }}
                onMouseEnter={e => {
                  const underline = e.currentTarget.querySelector('.menu-underline') as HTMLElement;
                  if (underline) underline.style.transform = 'scaleX(1)';
                }}
                onMouseLeave={e => {
                  const underline = e.currentTarget.querySelector('.menu-underline') as HTMLElement;
                  if (underline) underline.style.transform = 'scaleX(0)';
                }}
              >
                {item.text}
                <div
                  className="menu-underline"
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    height: 2,
                    background: '#222',
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.3s'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Box sx={{ height: '64px' }} /> {/* AppBar 높이만큼의 여백 추가 */}
    </>
  );
};

export default Navbar;