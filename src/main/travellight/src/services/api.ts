import axios from 'axios';

// 프록시 설정을 사용하므로 기본 URL은 상대 경로로 설정
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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