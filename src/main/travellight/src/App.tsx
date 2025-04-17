import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Home from './pages/Home';
import Map from "./pages/Map";
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Carry from './pages/Carry';
import Navbar from './components/Navbar';
import { AuthProvider } from './services/AuthContext';
import './App.css';
import StoragePartnership from './pages/StoragePartnership';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminEventStorage from './pages/admin/AdminEventStorage';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import MyPage from './pages/MyPage';
import EventStorage from "./pages/EventStorage.tsx";
import './i18n'; // i18n 설정 파일 임포트
import FAQ from './pages/FAQ';
import Inquiry from './pages/Inquiry';
import AdminPartnerships from './pages/admin/AdminPartnerships';

// 테마 설정
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7DF1',
      light: '#5D9FFF',
      dark: '#0051BF',
    },
    secondary: {
      main: '#FF5A5A',
      light: '#FF8C8C',
      dark: '#C41D2E',
    },
    background: {
      default: '#FAFBFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A2138',
      secondary: '#566588',
    },
  },
  typography: {
    fontFamily: [
      'Pretendard',
      'Noto Sans KR',
      'Roboto',
      'Inter',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '10px 20px',
          boxShadow: 'none',
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(46, 125, 241, 0.2)',
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 16px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* 일반 사용자 라우트 */}
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<Map />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/StoragePartnership" element={<StoragePartnership />} />
            <Route path="/FAQ" element={<FAQ />} />"
            <Route path="/Inquiry" element={<Inquiry />} />
            <Route path="/carry" element={<Carry />}/>
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/Eventstorage" element={<EventStorage />} />

            {/* 관리자 라우트 */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="event-storage" element={<AdminEventStorage />} />
              <Route path="partnerships" element={<AdminPartnerships />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;