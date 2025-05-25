import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { UserResponse, userService } from "./api";

// UserResponse 인터페이스 확장
interface ExtendedUserResponse extends UserResponse {
  token?: string;
  isAdmin?: boolean;
}

// 로컬 스토리지에 저장할 최소한의 정보만 포함하는 인터페이스
interface StoredUserData {
  id: number;
  token: string;
}

export interface AuthContextType {
  user: ExtendedUserResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  isWaiting: boolean;
  login: (userData: ExtendedUserResponse) => void;
  logout: () => void;
  adminLogin: (credentials: {
    email: string;
    password: string;
  }) => Promise<void>;
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
    // 로컬 스토리지에서 사용자 ID와 토큰 불러오기
    const storedUserData = localStorage.getItem("authData");
    if (storedUserData) {
      try {
        const parsedData: StoredUserData = JSON.parse(storedUserData);
        // 인증 상태만 설정하고, 나머지는 서버에서 가져온 후 설정
        setIsAuthenticated(true);

        // 서버에서 전체 사용자 정보 가져오기
        loadUserFromServer(parsedData.id);
      } catch (error) {
        console.error("Failed to parse stored auth data:", error);
        localStorage.removeItem("authData");
      }
    }
  }, []);

  // 서버에서 사용자 정보를 로드하는 함수
  const loadUserFromServer = async (userId: number) => {
    try {
      const response = await userService.getUserInfo(userId);
      if (response.data) {
        const token = `user-${userId}`;
        const fullUserData: ExtendedUserResponse = {
          ...response.data,
          token: token,
          isAdmin: response.data.role === "ADMIN",
        };
        setUser(fullUserData);
        setIsAdmin(fullUserData.isAdmin || false);
        setIsPartner(fullUserData.role === "PARTNER");
        setIsWaiting(fullUserData.role === "WAIT");
        
        // API 요청을 위해 사용자 정보 저장 (토큰 포함)
        localStorage.setItem("user", JSON.stringify(fullUserData));
      }
    } catch (error) {
      console.error("Failed to load user from server:", error);
      // 서버에서 사용자 정보를 가져올 수 없으면 로그아웃
      logout();
    }
  };

  // 사용자 정보 자동 갱신 로직
  useEffect(() => {
    if (user?.id) {
      // 페이지 로드/새로고침 시 즉시 사용자 정보 갱신
      refreshUserData();

      // 1분마다 사용자 정보 갱신
      const intervalId = setInterval(() => {
        refreshUserData();
      }, 60000); // 1분 = 60000ms

      // 컴포넌트 언마운트 또는 user.id 변경 시 인터벌 정리
      return () => clearInterval(intervalId);
    }
  }, [user?.id]); // user.id가 변경될 때마다 이 useEffect를 재실행

  const login = (userData: ExtendedUserResponse) => {
    // 사용자 ID 기반 토큰 생성
    const token = `user-${userData.id}`;
    const userWithToken = { ...userData, token };
    
    setUser(userWithToken);
    setIsAuthenticated(true);
    setIsAdmin(!!userData.isAdmin);
    setIsPartner(userData.role === "PARTNER");
    setIsWaiting(userData.role === "WAIT");

    // 로컬 스토리지에는 ID와 토큰 저장
    const authData: StoredUserData = {
      id: userData.id,
      token: token,
    };
    localStorage.setItem("authData", JSON.stringify(authData));
    
    // API 요청을 위해 별도로 사용자 정보 저장 (토큰 포함)
    localStorage.setItem("user", JSON.stringify(userWithToken));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsPartner(false);
    setIsWaiting(false);
    localStorage.removeItem("authData");
    localStorage.removeItem("user"); // API 요청용 사용자 정보도 제거
  };

  const adminLogin = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      const response = await userService.adminLogin(credentials);
      if (response.data && response.data.role === "ADMIN") {
        const token = `user-${response.data.id}`;
        const adminData: ExtendedUserResponse = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          token: token,
          isAdmin: true,
        };
        setUser(adminData);
        setIsAuthenticated(true);
        setIsAdmin(true);
        setIsPartner(adminData.role === "PARTNER");
        setIsWaiting(adminData.role === "WAIT");

        // 로컬 스토리지에는 ID와 토큰 저장
        const authData: StoredUserData = {
          id: adminData.id,
          token: token,
        };
        localStorage.setItem("authData", JSON.stringify(authData));
        
        // API 요청을 위해 별도로 사용자 정보 저장 (토큰 포함)
        localStorage.setItem("user", JSON.stringify(adminData));
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
    if (!user || !user.id) return;

    try {
      const response = await userService.getUserInfo(user.id);
      if (response.data) {
        const updatedUser = {
          ...user,
          ...response.data,
          token: user.token, // 기존 토큰 유지
          isAdmin: response.data.role === "ADMIN",
        };

        setUser(updatedUser);
        setIsAdmin(updatedUser.isAdmin || false);
        setIsPartner(updatedUser.role === "PARTNER");
        setIsWaiting(updatedUser.role === "WAIT");

        // API 요청을 위해 사용자 정보 업데이트 (토큰 포함)
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("사용자 정보 업데이트 실패:", error);
      // 오류가 발생해도 기존 세션은 유지
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
        login,
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
