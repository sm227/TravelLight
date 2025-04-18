import React, { useEffect } from 'react';
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
import { useTranslation } from 'react-i18next';

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
  const { i18n } = useTranslation();

  // 언어 설정 동기화
  useEffect(() => {
    // 저장된 언어 설정 가져오기
    const savedLanguage = localStorage.getItem('preferredLanguage');
    
    // 저장된 언어와 현재 i18n 언어가 다르면 동기화
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  // 네이버 지도 스크립트 로드 함수
  useEffect(() => {
    // 저장된 언어 설정 가져오기 (i18n.language 사용)
    const currentLanguage = i18n.language;
    
    // 지도 API 스크립트 로드 함수
    const loadNaverMapScript = (language: string) => {
      // 기존 스크립트 제거
      const existingScript = document.querySelector('script[src*="maps.js"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // 새 스크립트 생성
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=r23gqqq271&language=${language}`;
      script.async = true;
      
      // 스크립트 로드 완료 시 이벤트 발생
      script.onload = () => {
        console.log(`네이버 지도 API가 ${language} 언어로 로드되었습니다.`);
        // 맵 컴포넌트가 다시 렌더링되도록 이벤트 발생
        const mapLoadedEvent = new CustomEvent('naverMapLanguageChanged', { 
          detail: { language } 
        });
        window.dispatchEvent(mapLoadedEvent);
      };
      
      // 스크립트 로드 오류 시
      script.onerror = (error) => {
        console.error('네이버 지도 API 로드 오류:', error);
      };
      
      document.head.appendChild(script);
    };
    
    // 초기 로드
    loadNaverMapScript(currentLanguage);
    
    // 언어 변경 감지 및 지도 스크립트 다시 로드
    const handleLanguageChange = () => {
      loadNaverMapScript(i18n.language);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
  
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