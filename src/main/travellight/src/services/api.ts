import axios from 'axios';

// 프록시 설정을 사용하므로 기본 URL은 상대 경로로 설정
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  smallBagsAvailable?: number;
  mediumBagsAvailable?: number;
  largeBagsAvailable?: number;
}

export interface BusinessHourDto {
  enabled: boolean;
  open: string;
  close: string;
}

// 보관함 현황 타입 정의
export interface StorageStatus {
  name: string;
  address: string;
  usage: number;
  total: number;
  used: number;
  소형: number;
  중형: number;
  대형: number;
  maxSmall: number;
  maxMedium: number;
  maxLarge: number;
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
  
  // 보관 용량 업데이트 추가
  updateStorageCapacity: async (
    id: number, 
    storage: {
      smallBagsAvailable: number;
      mediumBagsAvailable: number;
      largeBagsAvailable: number;
    }
  ): Promise<ApiResponse<string>> => {
    const response = await api.put<ApiResponse<string>>(`/partnership/${id}/storage`, storage);
    return response.data;
  },
  
  // 전체 보관함 현황 조회 (관리자 대시보드용)
  getAllStorageStatus: async (): Promise<ApiResponse<StorageStatus[]>> => {
    const response = await api.get<ApiResponse<StorageStatus[]>>('/partnership/storage-status');
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
  },
  
  // 보관 용량 업데이트 추가
  updateBusinessHours: async (
    id: number, 
    businessHours: Record<string, BusinessHourDto>,
    is24Hours: boolean
  ): Promise<ApiResponse<string>> => {
    // 시간 형식 변환 함수 추가
    const formatTime = (time: string): string => {
      // "오후 6시" 형식의 시간을 "18:00" 형식으로 변환
      const timeRegex = /([오전오후])\s*(\d+)시/;
      const match = time.match(timeRegex);
      
      if (!match) return time; // 형식에 맞지 않으면 원래 값 반환
      
      const [, period, hourStr] = match;
      let hour = parseInt(hourStr);
      
      // 오후인 경우 12를 더하고, 12시는 예외 처리
      if (period === '오후' && hour !== 12) {
        hour += 12;
      }
      // 오전 12시는 0으로 변환
      if (period === '오전' && hour === 12) {
        hour = 0;
      }
      
      return `${hour.toString().padStart(2, '0')}:00`;
    };

    // 데이터 형식 변환
    const formattedBusinessHours = Object.entries(businessHours).reduce((acc, [day, hours]) => {
      acc[day] = {
        enabled: hours.enabled,
        open: formatTime(hours.open),
        close: formatTime(hours.close)
      };
      return acc;
    }, {} as Record<string, { enabled: boolean; open: string; close: string }>);

    try {
      const response = await api.put<ApiResponse<string>>(`/partnership/${id}/business-hours`, {
        businessHours: formattedBusinessHours,
        is24Hours
      });
      return response.data;
    } catch (error) {
      console.error('Business hours update error:', error);
      throw error;
    }
  },
};

export default api;