import React, { useState } from 'react';
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
import MenuIcon from '@mui/icons-material/Menu';
import LuggageIcon from '@mui/icons-material/Luggage';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import TranslateIcon from '@mui/icons-material/Translate';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useTranslation } from 'react-i18next';

const Navbar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [partnerMenuAnchorEl, setPartnerMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [langMenuAnchorEl, setLangMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, isPartner, isWaiting, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  const menuItems = [
    { text: t('home'), href: '/#home' },
    { text: t('services'), href: '/#services' },
    { text: t('howItWorks'), href: '/#how-it-works' },
    { text: t('pricing'), href: '/#pricing' },
    { text: t('partner'), onClick: navigateToPartner },
  ];

  const partnerSubMenuItems = [
    { text: t('storageService'), onClick: navigateToStoragePartnership },
    { text: t('eventStorage'), onClick: navigateToEventStorage },
    { text: '1:1 문의', onClick: navigateToInquiry },
  ];

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
    >
      <MenuItem onClick={() => { handleMenuClose(); navigate('/mypage'); }}>{t('myPage')}</MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>{t('profile')}</MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>{t('settings')}</MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>{t('logout')}</MenuItem>
    </Menu>
  );

  const isLangMenuOpen = Boolean(langMenuAnchorEl);

  const handleOverlayOpen = () => setOverlayOpen(true);
  const handleOverlayClose = () => setOverlayOpen(false);

  return (
    <>
      <AppBar position="fixed" color="default" elevation={0} sx={{ backgroundColor: 'white' }}>
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
                color: 'primary.main',
                textDecoration: 'none',
                flexGrow: 1
              }}
            >
              <LuggageIcon sx={{ mr: 1 }} />
              TravelLight
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* 번역 아이콘 버튼 */}
              <IconButton
                aria-label={t('language')}
                aria-controls={isLangMenuOpen ? 'language-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={isLangMenuOpen ? 'true' : undefined}
                onClick={handleLangMenuOpen}
                color="primary"
                size="small"
                sx={{ mx: 1 }}
              >
                <TranslateIcon />
              </IconButton>
              
              {/* 사용자 아이콘 버튼 또는 사용자 이름 */}
              {isAuthenticated ? (
                <Button
                  onClick={handleProfileMenuOpen}
                  color="primary"
                  sx={{ 
                    ml: 1, 
                    textTransform: 'none',
                    fontWeight: 'medium',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  endIcon={<ArrowDropDownIcon />}
                >
                  {user?.name}님
                </Button>
              ) : (
                <IconButton
                  aria-label="user menu"
                  onClick={handleProfileMenuOpen}
                  color="primary"
                  size="small"
                  sx={{ mx: 1 }}
                >
                  <AccountCircleIcon />
                </IconButton>
              )}
              
              {/* 햄버거 버튼 */}
              <IconButton
                color="inherit"
                aria-label="open overlay menu"
                edge="end"
                onClick={handleOverlayOpen}
                sx={{ display: 'flex', ml: 1 }}
              >
                <MenuIcon />
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
        >
          <MenuItem onClick={() => changeLanguage('ko')}>{t('korean')}</MenuItem>
          <MenuItem onClick={() => changeLanguage('en')}>{t('english')}</MenuItem>
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
        >
          <MenuItem onClick={() => { handleMenuClose(); navigate('/login'); }}>{t('login')}</MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/register'); }}>{t('register')}</MenuItem>
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
            background: 'rgba(255,255,255,0.92)',
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
          }}
        >
          {/* 나가기 버튼 */}
          <IconButton
            onClick={handleOverlayClose}
            sx={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 48,
              height: 48,
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
                  width: 'fit-content'
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