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
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
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
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HelpIcon from '@mui/icons-material/Help';
import StorageIcon from '@mui/icons-material/Storage';
import EventIcon from '@mui/icons-material/Event';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
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
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = useState(false);
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
    setHamburgerMenuOpen(false);
  };

  const navigateToEventStorage = () => {
    handlePartnerMenuClose();
    navigate('/EventStorage');
    setHamburgerMenuOpen(false);
  };

  const navigateToInquiry = () => {
    handlePartnerMenuClose();
    navigate('/Inquiry');
    setHamburgerMenuOpen(false);
  }

  const navigateToFAQ = () => {
    handlePartnerMenuClose();
    navigate('/FAQ');
    setHamburgerMenuOpen(false);
  };

  const navigateToPartner = () => {
    handlePartnerMenuClose();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/partner' } });
      setHamburgerMenuOpen(false);
      return;
    }
    
    if (isPartner) {
      navigate('/partner-dashboard');
    } else if (isWaiting) {
      navigate('/partner-dashboard');
    } else {
      navigate('/partner');
    }
    setHamburgerMenuOpen(false);
  };

  const handleHamburgerToggle = () => {
    setHamburgerMenuOpen(!hamburgerMenuOpen);
  };

  const handleMenuItemClick = (href?: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
    } else if (href) {
      if (href.startsWith('/#')) {
        window.location.href = href;
      } else {
        navigate(href);
      }
    }
    setHamburgerMenuOpen(false);
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
              
              {/* 햄버거 메뉴 버튼 */}
              <IconButton
                aria-label="menu"
                onClick={handleHamburgerToggle}
                size="small"
                sx={{
                  mx: 1,
                  color: isPartnerPage ? 'white' : 'primary.main',
                  transition: 'color 0.3s ease',
                  '&:hover': {
                    backgroundColor: isPartnerPage ? 'rgba(255, 255, 255, 0.1)' : 'rgba(46, 125, 241, 0.1)'
                  }
                }}
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

      {/* 햄버거 드롭다운 메뉴 */}
      <Collapse in={hamburgerMenuOpen}>
        <Box
          sx={{
            position: 'fixed',
            top: '64px', // AppBar 높이
            left: 0,
            right: 0,
            backgroundColor: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            zIndex: 1300,
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <Container maxWidth="lg">
                         <List sx={{ py: 2 }}>
               {/* 메인 메뉴 아이템들 */}
               <ListItem disablePadding sx={{ mb: 1 }}>
                 <ListItemButton 
                   onClick={() => handleMenuItemClick('/#home')}
                   sx={{ 
                     borderRadius: '8px',
                     '&:hover': { backgroundColor: '#f5f5f5' }
                   }}
                 >
                   <ListItemIcon><HomeIcon color="primary" /></ListItemIcon>
                   <ListItemText primary={t('home')} />
                 </ListItemButton>
               </ListItem>
               
               <ListItem disablePadding sx={{ mb: 1 }}>
                 <ListItemButton 
                   onClick={() => handleMenuItemClick('/#services')}
                   sx={{ 
                     borderRadius: '8px',
                     '&:hover': { backgroundColor: '#f5f5f5' }
                   }}
                 >
                   <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                   <ListItemText primary={t('services')} />
                 </ListItemButton>
               </ListItem>
               
               <ListItem disablePadding sx={{ mb: 1 }}>
                 <ListItemButton 
                   onClick={() => handleMenuItemClick(undefined, navigateToFAQ)}
                   sx={{ 
                     borderRadius: '8px',
                     '&:hover': { backgroundColor: '#f5f5f5' }
                   }}
                 >
                   <ListItemIcon><HelpIcon color="primary" /></ListItemIcon>
                   <ListItemText primary={t('howItWorks')} />
                 </ListItemButton>
               </ListItem>
               
               <ListItem disablePadding sx={{ mb: 1 }}>
                 <ListItemButton 
                   onClick={() => handleMenuItemClick('/#pricing')}
                   sx={{ 
                     borderRadius: '8px',
                     '&:hover': { backgroundColor: '#f5f5f5' }
                   }}
                 >
                   <ListItemIcon><AttachMoneyIcon color="primary" /></ListItemIcon>
                   <ListItemText primary={t('pricing')} />
                 </ListItemButton>
               </ListItem>
               
               <ListItem disablePadding sx={{ mb: 2 }}>
                 <ListItemButton 
                   onClick={() => handleMenuItemClick(undefined, navigateToPartner)}
                   sx={{ 
                     borderRadius: '8px',
                     '&:hover': { backgroundColor: '#f5f5f5' }
                   }}
                 >
                   <ListItemIcon><BusinessIcon color="primary" /></ListItemIcon>
                   <ListItemText primary={t('partner')} />
                 </ListItemButton>
               </ListItem>

               <Divider sx={{ my: 1 }} />
               
               {/* 파트너 서브메뉴 */}
               <Typography 
                 variant="body2" 
                 color="text.secondary" 
                 sx={{ px: 2, py: 1, fontWeight: 600 }}
               >
                 파트너 서비스
               </Typography>
               
               <ListItem disablePadding sx={{ mb: 1 }}>
                 <ListItemButton 
                   onClick={() => handleMenuItemClick(undefined, navigateToStoragePartnership)}
                   sx={{ 
                     borderRadius: '8px',
                     pl: 4,
                     '&:hover': { backgroundColor: '#f5f5f5' }
                   }}
                 >
                   <ListItemIcon><StorageIcon color="secondary" /></ListItemIcon>
                   <ListItemText primary={t('storageService')} />
                 </ListItemButton>
               </ListItem>
               
               <ListItem disablePadding sx={{ mb: 1 }}>
                 <ListItemButton 
                   onClick={() => handleMenuItemClick(undefined, navigateToEventStorage)}
                   sx={{ 
                     borderRadius: '8px',
                     pl: 4,
                     '&:hover': { backgroundColor: '#f5f5f5' }
                   }}
                 >
                   <ListItemIcon><EventIcon color="secondary" /></ListItemIcon>
                   <ListItemText primary={t('eventStorage')} />
                 </ListItemButton>
               </ListItem>
               
               <ListItem disablePadding sx={{ mb: 1 }}>
                 <ListItemButton 
                   onClick={() => handleMenuItemClick(undefined, navigateToInquiry)}
                   sx={{ 
                     borderRadius: '8px',
                     pl: 4,
                     '&:hover': { backgroundColor: '#f5f5f5' }
                   }}
                 >
                   <ListItemIcon><ContactSupportIcon color="secondary" /></ListItemIcon>
                   <ListItemText primary="1:1 문의" />
                 </ListItemButton>
               </ListItem>
             </List>
          </Container>
        </Box>
      </Collapse>

      <Box sx={{ height: '64px' }} /> {/* AppBar 높이만큼의 여백 추가 */}
    </>
  );
};

export default Navbar;