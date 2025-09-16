import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { 
  UserResponse, 
  authService, 
  userService,
  LoginRequest,
  LoginResponse,
  setAccessToken,
  clearAccessToken,
  getAccessToken
} from "./api";

// UserResponse 인터페이스 확장
interface ExtendedUserResponse extends UserResponse {
  isAdmin?: boolean;
}

export interface AuthContextType {
  user: ExtendedUserResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  isWaiting: boolean;
  isInitialLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
  adminLogin: (credentials: LoginRequest) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUserResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isPartner, setIsPartner] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    // 쿠키에 Refresh Token이 있는지 확인하고 사용자 정보 로드
    checkAuthStatus();
    
    // 로그아웃 이벤트 리스너 등록
    const handleLogout = () => {
      handleLogoutEvent();
    };
    
    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  // 인증 상태 확인 및 사용자 정보 로드
  const checkAuthStatus = async () => {
    try {
      // Refresh Token으로 새로운 Access Token 발급 시도
      const tokenResponse = await authService.refreshToken();
      if (tokenResponse.success && tokenResponse.data.accessToken) {
        // Access Token을 메모리에 저장
        setAccessToken(tokenResponse.data.accessToken);
        
        // 사용자 정보 로드
        await loadCurrentUser();
      } else {
        setIsInitialLoading(false);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setIsInitialLoading(false);
    }
  };
  
  // 현재 사용자 정보 로드
  const loadCurrentUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        const userData: ExtendedUserResponse = {
          ...response.data,
          isAdmin: response.data.role === "ADMIN",
        };
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.isAdmin || false);
        setIsPartner(userData.role === "PARTNER");
        setIsWaiting(userData.role === "WAIT");
      }
    } catch (error) {
      console.error("Failed to load current user:", error);
      handleLogoutEvent();
    } finally {
      setIsInitialLoading(false);
    }
  };

  // 사용자 정보 자동 갱신 로직
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // 5분마다 사용자 정보 갱신 (토큰 만료 전에 갱신)
      const intervalId = setInterval(() => {
        refreshUserData();
      }, 5 * 60 * 1000); // 5분 = 300000ms

      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, user?.id]);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        // Access Token을 메모리에 저장
        setAccessToken(response.data.accessToken);
        
        // 사용자 정보 설정
        const userData: ExtendedUserResponse = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          isAdmin: response.data.role === "ADMIN",
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.isAdmin || false);
        setIsPartner(userData.role === "PARTNER");
        setIsWaiting(userData.role === "WAIT");
      } else {
        throw new Error(response.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  const register = async (data: { name: string; email: string; password: string; role?: string }) => {
    try {
      const response = await authService.register(data);
      if (response.success && response.data) {
        // Access Token을 메모리에 저장
        setAccessToken(response.data.accessToken);
        
        // 사용자 정보 설정
        const userData: ExtendedUserResponse = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          isAdmin: response.data.role === "ADMIN",
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.isAdmin || false);
        setIsPartner(userData.role === "PARTNER");
        setIsWaiting(userData.role === "WAIT");
      } else {
        throw new Error(response.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // 서버에 로그아웃 요청 (쿠키의 Refresh Token 삭제)
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      handleLogoutEvent();
    }
  };
  
  const handleLogoutEvent = () => {
    // Access Token 메모리에서 삭제
    clearAccessToken();
    
    // 상태 초기화
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsPartner(false);
    setIsWaiting(false);
    setIsInitialLoading(false);
  };

  const adminLogin = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data && response.data.role === "ADMIN") {
        // Access Token을 메모리에 저장
        setAccessToken(response.data.accessToken);
        
        const adminData: ExtendedUserResponse = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          isAdmin: true,
        };
        
        setUser(adminData);
        setIsAuthenticated(true);
        setIsAdmin(true);
        setIsPartner(false);
        setIsWaiting(false);
      } else {
        throw new Error("관리자 권한이 없습니다.");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      throw new Error("관리자 로그인에 실패했습니다.");
    }
  };

  // 사용자 정보 새로고침 기능
  const refreshUserData = async () => {
    if (!isAuthenticated || !getAccessToken()) return;

    try {
      // 현재 사용자 정보 다시 로드
      await loadCurrentUser();
    } catch (error) {
      console.error("사용자 정보 업데이트 실패:", error);
      // 401 에러인 경우 인터셉터에서 자동으로 처리됨
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isPartner,
        isWaiting,
        isInitialLoading,
        login,
        register,
        logout,
        adminLogin,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};