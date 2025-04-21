import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserResponse, userService } from './api';

// UserResponse 인터페이스 확장
interface ExtendedUserResponse extends UserResponse {
  token?: string;
  isAdmin?: boolean;
}

export interface AuthContextType {
  user: ExtendedUserResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  isWaiting: boolean;
  login: (userData: ExtendedUserResponse) => void;
  logout: () => void;
  adminLogin: (credentials: {email: string, password: string}) => Promise<void>;
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

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 불러오기
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setIsAdmin(!!parsedUser.isAdmin);
        setIsPartner(parsedUser.role === 'PARTNER');
        setIsWaiting(parsedUser.role === 'WAIT');
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData: ExtendedUserResponse) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(!!userData.isAdmin);
    setIsPartner(userData.role === 'PARTNER');
    setIsWaiting(userData.role === 'WAIT');
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsPartner(false);
    setIsWaiting(false);
    localStorage.removeItem('user');
  };

  const adminLogin = async (credentials: {email: string, password: string}) => {
    try {
      const response = await userService.adminLogin(credentials);
      if (response.data && response.data.role === 'ADMIN') {
        const adminData: ExtendedUserResponse = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          token: 'admin-token', // 추후 실제 토큰으로 교체
          isAdmin: true
        };
        setUser(adminData);
        setIsAuthenticated(true);
        setIsAdmin(true);
        setIsPartner(adminData.role === 'PARTNER');
        setIsWaiting(adminData.role === 'WAIT');
        localStorage.setItem('user', JSON.stringify(adminData));
      } else {
        throw new Error('관리자 권한이 없습니다.');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      throw new Error('관리자 로그인에 실패했습니다.');
    }
  };

  // 사용자 정보 새로고침 기능
  const refreshUserData = async () => {
    if (!user || !user.id) return;
    
    try {
      const response = await userService.getUserInfo(user.id);
      if (response.data) {
        const updatedUser = {
          ...user,
          ...response.data,
          isAdmin: response.data.role === 'ADMIN'
        };
        
        setUser(updatedUser);
        setIsAdmin(updatedUser.isAdmin || false);
        setIsPartner(updatedUser.role === 'PARTNER');
        setIsWaiting(updatedUser.role === 'WAIT');
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('사용자 정보 업데이트 실패:', error);
      // 오류가 발생해도 기존 세션은 유지
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isPartner, isWaiting, login, logout, adminLogin, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 