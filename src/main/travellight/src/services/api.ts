import axios from 'axios';

// 프록시 설정을 사용하므로 기본 URL은 상대 경로로 설정
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 추가
api.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 사용자 정보 가져오기
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // 토큰이 있으면 헤더에 추가 (Bearer 스키마 없이)
        if (user.token) {
          config.headers['Authorization'] = user.token;
        }
      } catch (error) {
        console.error('로컬 스토리지의 사용자 정보 파싱 오류:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가 - API 호출 디버깅을 위해
api.interceptors.response.use(
  (response) => {
    console.log('API 응답 성공:', response);
    return response;
  },
  (error) => {
    console.error('API 응답 오류:', error);
    return Promise.reject(error);
  }
);

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const userService = {
  register: async (data: RegisterRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await api.post<ApiResponse<UserResponse>>('/users/register', data);
    return response.data;
  },
  
  login: async (data: LoginRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await api.post<ApiResponse<UserResponse>>('/users/login', data);
    return response.data;
  },
  
  getUserInfo: async (userId: number): Promise<ApiResponse<UserResponse>> => {
    const response = await api.get<ApiResponse<UserResponse>>(`/users/${userId}`);
    return response.data;
  },
  
  changePassword: async (userId: number, data: PasswordChangeRequest): Promise<ApiResponse<void>> => {
    try {
      console.log('비밀번호 변경 요청 데이터:', data);
      console.log('사용자 ID:', userId);
      const response = await api.post<ApiResponse<void>>(`/users/${userId}/password`, data);
      return response.data;
    } catch (error) {
      console.error('비밀번호 변경 중 오류 발생:', error);
      throw error;
    }
  },
};

export default api; 