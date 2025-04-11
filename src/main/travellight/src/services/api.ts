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
        // 토큰이 있으면 헤더에 추가
        if (user.token) {
          config.headers['Authorization'] = `Bearer ${user.token}`;
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

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
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
};

export default api; 