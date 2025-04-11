import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserResponse } from './api';

// UserResponse 인터페이스 확장
interface ExtendedUserResponse extends UserResponse {
  token?: string;
  isAdmin?: boolean;
}

export interface AuthContextType {
  user: ExtendedUserResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (userData: ExtendedUserResponse) => void;
  logout: () => void;
  adminLogin: (credentials: {email: string, password: string}) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUserResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 불러오기
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setIsAdmin(!!parsedUser.isAdmin);
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
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('user');
  };

  const adminLogin = async (credentials: {email: string, password: string}) => {
    if (credentials.email === 'admin' && credentials.password === '1234') {
      const adminData: ExtendedUserResponse = {
        id: 999, // 관리자 ID는 숫자 타입으로 변경
        name: '관리자',
        email: 'admin',
        token: 'admin-token',
        isAdmin: true
      };
      setUser(adminData);
      setIsAuthenticated(true);
      setIsAdmin(true);
      localStorage.setItem('user', JSON.stringify(adminData));
    } else {
      throw new Error('관리자 로그인에 실패했습니다.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout, adminLogin }}>
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