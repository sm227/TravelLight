import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Home from './pages/Home';
import Map from "./pages/Map";
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Navbar from './components/Navbar';
import { AuthProvider } from './services/AuthContext';
import './App.css';

// 테마 설정
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#63a4ff',
      dark: '#004ba0',
    },
    secondary: {
      main: '#f50057',
      light: '#ff5983',
      dark: '#bb002f',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Noto Sans KR',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          {/*<Navbar />*/}
          <Box sx={{ pt: 8 }}> {/* 네비게이션 바 높이만큼 상단 패딩 추가 */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<Map />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;