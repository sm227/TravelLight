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

// 제휴 매장 타입 정의
export interface Partnership {
  id: number;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  businessType: string;
  spaceSize: string;
  additionalInfo: string;
  agreeTerms: boolean;
  is24Hours: boolean;
  businessHours: Record<string, BusinessHourDto>;
  status: string;
}

export interface BusinessHourDto {
  enabled: boolean;
  open: string;
  close: string;
}

// 배달 요청 타입 정의
export interface DeliveryRequest {
  reservationId: number;
  deliveryType: string;
  partnerId?: number;  // 제휴 매장으로 배달 시
  customAddress?: string;  // 특정 주소로 배달 시
  estimatedPrice: number;
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
  
  adminLogin: async (data: LoginRequest): Promise<ApiResponse<UserResponse>> => {
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

// 제휴점 관련 서비스
export const partnershipService = {
  getAllPartnerships: async (): Promise<ApiResponse<Partnership[]>> => {
    const response = await api.get<ApiResponse<Partnership[]>>('/partnership');
    return response.data;
  },
  
  getPartnershipById: async (id: number): Promise<ApiResponse<Partnership>> => {
    const response = await api.get<ApiResponse<Partnership>>(`/partnership/${id}`);
    return response.data;
  },
  
  // 배달 가격 견적 계산
  calculateDeliveryEstimate: async (
    originLatitude: number,
    originLongitude: number,
    destinationLatitude: number,
    destinationLongitude: number,
    luggageCount: number
  ): Promise<number> => {
    // 실제로는 API를 호출하겠지만, 여기서는 간단한 계산 로직 구현
    // 거리 계산 (Haversine 공식)
    const R = 6371; // 지구 반경(km)
    const dLat = (destinationLatitude - originLatitude) * Math.PI / 180;
    const dLon = (destinationLongitude - originLongitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(originLatitude * Math.PI / 180) * Math.cos(destinationLatitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // 기본 배달료 5,000원 + 거리당 요금(1km당 1,000원) + 짐 개수당 추가 요금(개당 2,000원)
    const basePrice = 5000;
    const distancePrice = Math.round(distance) * 1000;
    const luggagePrice = luggageCount * 2000;
    
    return basePrice + distancePrice + luggagePrice;
  },
  
  // 배달 요청 보내기
  requestDelivery: async (data: DeliveryRequest): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post<ApiResponse<any>>('/delivery/request', data);
      return response.data;
    } catch (error) {
      console.error('배달 요청 중 오류 발생:', error);
      throw error;
    }
  }
};

export default api; 