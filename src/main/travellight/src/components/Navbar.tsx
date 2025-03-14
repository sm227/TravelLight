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
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LuggageIcon from '@mui/icons-material/Luggage';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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

  const menuItems = [
    { text: '홈', href: '#home' },
    { text: '서비스', href: '#services' },
    { text: '이용방법', href: '#how-it-works' },
    { text: '가격', href: '#pricing' },
    { text: '문의하기', href: '#contact' },
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
        {isAuthenticated ? (
          <>
            <ListItem sx={{ textAlign: 'center', color: 'primary.main' }}>
              <ListItemText primary={`안녕하세요, ${user?.name}님`} />
            </ListItem>
            <ListItem 
              button 
              onClick={handleLogout}
              sx={{ textAlign: 'center', color: 'error.main' }}
            >
              <ListItemText primary="로그아웃" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem 
              component={RouterLink} 
              to="/login" 
              sx={{ textAlign: 'center', textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}
            >
              <ListItemText primary="로그인" />
            </ListItem>
            <ListItem 
              component={RouterLink} 
              to="/register" 
              sx={{ textAlign: 'center', textDecoration: 'none', color: 'secondary.main', fontWeight: 'bold' }}
            >
              <ListItemText primary="회원가입" />
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
      <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>내 프로필</MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>설정</MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>로그아웃</MenuItem>
    </Menu>
  );

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
            </Box>
          )}

          <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>
            {isAuthenticated ? (
              <>
                <Typography
                  variant="body1"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mr: 2,
                    color: 'text.primary'
                  }}
                >
                  안녕하세요, {user?.name}님
                </Typography>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {user?.name.charAt(0)}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <>
                <Button 
                  component={RouterLink}
                  to="/login"
                  variant="outlined" 
                  color="primary"
                  sx={{ 
                    borderRadius: '24px',
                    px: 2,
                    mr: 1
                  }}
                >
                  로그인
                </Button>
                <Button 
                  component={RouterLink}
                  to="/register"
                  variant="contained" 
                  color="primary"
                  sx={{ 
                    borderRadius: '24px',
                    px: 2
                  }}
                >
                  회원가입
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
      {renderMenu}
    </AppBar>
  );
};

export default Navbar; 