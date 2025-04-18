import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemButton
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [partnerMenuAnchorEl, setPartnerMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [langMenuAnchorEl, setLangMenuAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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
    i18n.changeLanguage(lng);
    handleLangMenuClose();
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

  const menuItems = [
    { text: t('home'), href: '#home' },
    { text: t('services'), href: '#services' },
    { text: t('howItWorks'), href: '#how-it-works' },
    { text: t('pricing'), href: '#pricing' },
    // '제휴·협업 문의' is now handled separately for the dropdown
  ];

  const partnerSubMenuItems = [
    { text: 'FAQ',onClick: navigateToFAQ },
    { text: t('storageService'), onClick: navigateToStoragePartnership },
    { text: t('eventStorage'), onClick: navigateToEventStorage },
    { text: '1:1 문의', onClick: navigateToInquiry },
  ];

  const drawer = (
      <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LuggageIcon sx={{ mr: 1 }} />
          TravelLight
        </Typography>
        <List>
          {menuItems.map((item) => (
              <ListItem key={item.text} component="a" href={item.href} sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
                <ListItemText primary={item.text} />
              </ListItem>
          ))}
          <ListItemButton onClick={handlePartnerMenuOpen} sx={{ textAlign: 'center', color: 'inherit' }}>
            <ListItemText primary={t('partnership')} />
          </ListItemButton>
          <Menu
              id="partner-menu-mobile"
              anchorEl={partnerMenuAnchorEl}
              open={partnerMenuOpen}
              onClose={handlePartnerMenuClose}
              MenuListProps={{
                'aria-labelledby': 'partner-button',
              }}
          >
            {partnerSubMenuItems.map((item) => (
                <MenuItem key={item.text} onClick={item.onClick}>
                  {item.text}
                </MenuItem>
            ))}
          </Menu>
          
          {/* 언어 설정 */}
          <ListItemButton onClick={handleLangMenuOpen} sx={{ textAlign: 'center', color: 'primary.main' }}>
            <ListItemText primary={t('language')} />
          </ListItemButton>
          
          {isAuthenticated ? (
              <>
                <ListItem sx={{ textAlign: 'center', color: 'primary.main' }}>
                  <ListItemText primary={`${t('greeting')}${user?.name}님`} />
                </ListItem>
                <ListItemButton
                    component={RouterLink}
                    to="/mypage"
                    sx={{ textAlign: 'center', color: 'primary.main' }}
                >
                  <ListItemText primary={t('myPage')} />
                </ListItemButton>
                <ListItemButton
                    onClick={handleLogout}
                    sx={{ textAlign: 'center', color: 'error.main' }}
                >
                  <ListItemText primary={t('logout')} />
                </ListItemButton>
              </>
          ) : (
              <>
                <ListItem
                    component={RouterLink}
                    to="/login"
                    sx={{ textAlign: 'center', textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}
                >
                  <ListItemText primary={t('login')} />
                </ListItem>
                <ListItem
                    component={RouterLink}
                    to="/register"
                    sx={{ textAlign: 'center', textDecoration: 'none', color: 'secondary.main', fontWeight: 'bold' }}
                >
                  <ListItemText primary={t('register')} />
                </ListItem>
              </>
          )}
        </List>
      </Box>
  );

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
          open={isMenuOpen}
          onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); navigate('/mypage'); }}>{t('myPage')}</MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>{t('profile')}</MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>{t('settings')}</MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>{t('logout')}</MenuItem>
      </Menu>
  );

  const partnerButtonRef = React.useRef<HTMLButtonElement>(null);

  const isLangMenuOpen = Boolean(langMenuAnchorEl);

  return (
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
                  flexGrow: { xs: 1, md: 0 }
                }}
            >
              <LuggageIcon sx={{ mr: 1 }} />
              TravelLight
            </Typography>

            {isMobile ? (
                <>
                  <IconButton
                      color="inherit"
                      aria-label="open drawer"
                      edge="end"
                      onClick={handleDrawerToggle}
                      sx={{ display: { md: 'none' } }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Drawer
                      anchor="right"
                      open={mobileOpen}
                      onClose={handleDrawerToggle}
                      ModalProps={{
                        keepMounted: true,
                      }}
                      sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                      }}
                  >
                    {drawer}
                  </Drawer>
                </>
            ) : (
                <>
                  <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                    {menuItems.map((item) => (
                        <Button
                            key={item.text}
                            href={item.href}
                            sx={{
                              my: 2,
                              mx: 1.5,
                              color: 'text.primary',
                              display: 'block',
                              '&:hover': {
                                color: 'primary.main',
                              }
                            }}
                        >
                          {item.text}
                        </Button>
                    ))}
                    <Box sx={{ position: 'relative' }}>
                      <Button
                          ref={partnerButtonRef}
                          aria-controls={partnerMenuOpen ? 'partner-menu-desktop' : undefined}
                          aria-haspopup="true"
                          aria-expanded={partnerMenuOpen ? 'true' : undefined}
                          onClick={handlePartnerMenuOpen}
                          sx={{
                            my: 2,
                            mx: 1.5,
                            color: 'text.primary',
                            display: 'flex',
                            alignItems: 'center',
                            '&:hover': {
                              color: 'primary.main',
                            }
                          }}
                          endIcon={<ArrowDropDownIcon />}
                      >
                        {t('partnership')}
                      </Button>
                      <Menu
                          id="partner-menu-desktop"
                          anchorEl={partnerMenuAnchorEl}
                          open={partnerMenuOpen}
                          onClose={handlePartnerMenuClose}
                          MenuListProps={{
                            'aria-labelledby': 'partner-button',
                          }}
                      >
                        {partnerSubMenuItems.map((item) => (
                            <MenuItem key={item.text} onClick={item.onClick}>
                              {item.text}
                            </MenuItem>
                        ))}
                      </Menu>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {isAuthenticated ? (
                        <>
                          <Button
                              component={RouterLink}
                              to="/mypage"
                              color="primary"
                              sx={{ mx: 1 }}
                          >
                            {t('myPage')}
                          </Button>
                          
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
                          
                          <Button
                              onClick={handleProfileMenuOpen}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: '24px',
                                padding: '4px 8px 4px 4px',
                                color: 'primary.main',
                              }}
                          >
                            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                              {user?.name?.charAt(0) || <AccountCircleIcon />}
                            </Avatar>
                            {user?.name}
                          </Button>
                        </>
                    ) : (
                        <>
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
                          
                          <Button
                              component={RouterLink}
                              to="/login"
                              variant="text"
                              color="primary"
                              sx={{ textTransform: 'none', fontWeight: 'bold' }}
                          >
                            {t('login')}
                          </Button>
                          <Button
                              component={RouterLink}
                              to="/register"
                              variant="contained"
                              color="primary"
                              sx={{ ml: 2, textTransform: 'none', fontWeight: 'bold' }}
                          >
                            {t('register')}
                          </Button>
                        </>
                    )}
                  </Box>
                </>
            )}
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
      </AppBar>
  );
};

export default Navbar;