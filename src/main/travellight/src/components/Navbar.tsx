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
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LuggageIcon from '@mui/icons-material/Luggage';
import { Link as RouterLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
      </List>
    </Box>
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
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 