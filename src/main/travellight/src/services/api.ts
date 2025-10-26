import axios from 'axios';

// 프록시 설정을 사용하므로 기본 URL은 상대 경로로 설정
const API_BASE_URL = '/api';

// Access Token을 메모리에 저장
let accessToken: string | null = null;

// Access Token 관리 함수들
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = (): string | null => {
  return accessToken;
};

export const clearAccessToken = () => {
  accessToken = null;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 포함하여 요청
});

// 요청 인터셉터 - Access Token을 Authorization 헤더에 추가
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 만료 시 자동 갱신
api.interceptors.response.use(
  (response) => {
    console.log('API 응답 성공:', response);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 토큰 갱신 요청
        const refreshResponse = await axios.post('/auth/refresh', {}, {
          withCredentials: true,
          baseURL: API_BASE_URL
        });
        
        if (refreshResponse.data.success) {
          const newAccessToken = refreshResponse.data.data.accessToken;
          setAccessToken(newAccessToken);
          
          // 원래 요청에 새 토큰으로 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        clearAccessToken();
        // AuthContext의 logout 함수를 호출하기 위해 이벤트 발생
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      }
    }
    
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

export interface LoginResponse extends UserResponse {
  accessToken: string;
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
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

export interface AdminUserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface ClaimResponse {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  assignee: string;
  content: string;
  status: string;
  createdByAdminName: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface ClaimRequest {
  userId: number;
  assignee: string;
  content: string;
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
  storePictures?: string[];
  amenities?: string[];
  insuranceAvailable?: boolean;
  businessRegistrationUrl?: string;
  bankBookUrl?: string;
  accountNumber?: string;
  bankName?: string;
  accountHolder?: string;
  rejectionReason?: string;
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

// 배달 응답 타입 정의
export interface DeliveryResponse {
  id: number;
  userId: number;
  reservationId: number;
  pickupAddress: string;
  deliveryAddress: string;
  itemDescription: string;
  weight: number;
  requestedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  trackingNumber?: string;
  estimatedDeliveryTime?: string;
}

export const authService = {
  register: async (data: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', data);
    return response.data;
  },
  
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return response.data;
  },
  
  logout: async (): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('/auth/logout');
    return response.data;
  },
  
  getCurrentUser: async (): Promise<ApiResponse<UserResponse>> => {
    const response = await api.get<ApiResponse<UserResponse>>('/auth/me');
    return response.data;
  },
  
  refreshToken: async (): Promise<ApiResponse<TokenResponse>> => {
    const response = await api.post<ApiResponse<TokenResponse>>('/auth/refresh');
    return response.data;
  },

  ssoLogin: async (data: { providerType: string; authorizationCode: string; redirectUri: string }): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/sso/login', data);
    return response.data;
  },
};

export const userService = {
  
  getUserInfo: async (userId: number): Promise<ApiResponse<UserResponse>> => {
    const response = await api.get<ApiResponse<UserResponse>>(`/users/${userId}`);
    return response.data;
  },
  
  // 호환성을 위한 레거시 메소드들 (authService 사용 권장)
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return authService.login(data);
  },
  
  adminLogin: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return authService.login(data);
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

// 관리자용 사용자 관리 서비스
export const adminUserService = {
  getAllUsers: async (): Promise<ApiResponse<AdminUserResponse[]>> => {
    const response = await api.get<ApiResponse<AdminUserResponse[]>>('/users/admin/all');
    return response.data;
  },
  
  deleteUser: async (userId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/users/admin/${userId}`);
    return response.data;
  },
};

// 클레임 관리 서비스
export const claimService = {
  createClaim: async (data: ClaimRequest): Promise<ApiResponse<ClaimResponse>> => {
    const response = await api.post<ApiResponse<ClaimResponse>>('/claims', data);
    return response.data;
  },
  
  getClaimsByUserId: async (userId: number): Promise<ApiResponse<ClaimResponse[]>> => {
    const response = await api.get<ApiResponse<ClaimResponse[]>>(`/claims/user/${userId}`);
    return response.data;
  },
  
  getAllClaims: async (): Promise<ApiResponse<ClaimResponse[]>> => {
    const response = await api.get<ApiResponse<ClaimResponse[]>>('/claims');
    return response.data;
  },
  
  getClaimById: async (claimId: number): Promise<ApiResponse<ClaimResponse>> => {
    const response = await api.get<ApiResponse<ClaimResponse>>(`/claims/${claimId}`);
    return response.data;
  },
  
  updateClaim: async (claimId: number, data: Partial<ClaimRequest>): Promise<ApiResponse<ClaimResponse>> => {
    const response = await api.put<ApiResponse<ClaimResponse>>(`/claims/${claimId}`, data);
    return response.data;
  },
  
  deleteClaim: async (claimId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/claims/${claimId}`);
    return response.data;
  },
  
  resolveClaim: async (claimId: number, resolution: string): Promise<ApiResponse<ClaimResponse>> => {
    const response = await api.post<ApiResponse<ClaimResponse>>(`/claims/${claimId}/resolve`, resolution);
    return response.data;
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
  requestDelivery: async (data: DeliveryRequest): Promise<ApiResponse<DeliveryResponse>> => {
    try {
      const response = await api.post<ApiResponse<DeliveryResponse>>('/delivery/request', data);
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

// 리뷰 관련 타입 정의
export interface ReviewRequest {
  reservationId: number;
  rating: number;
  title?: string;
  content?: string;
  photoFilenames?: string[];
}

export interface ReviewUpdateRequest {
  rating: number;
  title?: string;
  content?: string;
  keepPhotoIds?: number[];
  newPhotoFilenames?: string[];
}

export interface ReviewResponse {
  id: number;
  reservationId: number;
  reservationNumber: string;
  placeName: string;
  placeAddress: string;
  rating: number;
  title?: string;
  content?: string;
  status: string;
  reportCount: number;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
  };
  photos: ReviewPhotoResponse[];
  adminReply?: string;
  adminUser?: {
    id: number;
    name: string;
  };
  adminReplyAt?: string;
  isHelpfulByCurrentUser?: boolean;
  isReportedByCurrentUser?: boolean;
  canEdit?: boolean;
}

export interface ReviewPhotoResponse {
  id: number;
  filename: string;
  originalFilename: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  sortOrder: number;
  uploadedAt: string;
}

export interface ReviewSummary {
  placeName: string;
  placeAddress: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    rating5Count: number;
    rating4Count: number;
    rating3Count: number;
    rating2Count: number;
    rating1Count: number;
  };
}

export interface ReviewReportRequest {
  reason: 'SPAM' | 'INAPPROPRIATE_CONTENT' | 'FAKE_REVIEW' | 'PERSONAL_INFO' | 'HATE_SPEECH' | 'COPYRIGHT' | 'OTHER';
  description?: string;
}

export interface PlaceReviewSummary {
  placeName: string;
  placeAddress: string;
  averageRating: number;
  reviewCount: number;
  recommendationScore: number;
}

// 리뷰 관련 서비스
export const reviewService = {
  // 리뷰 작성 (예약 API 사용)
  createReview: async (data: ReviewRequest, userId: number): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.post<ApiResponse<ReviewResponse>>(`/reservations/reviews?userId=${userId}`, data);
    return response.data;
  },

  // 리뷰 수정 (예약 API 사용)
  updateReview: async (reservationId: number, data: ReviewUpdateRequest, userId: number): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.put<ApiResponse<ReviewResponse>>(`/reservations/${reservationId}/review?userId=${userId}`, data);
    return response.data;
  },

  // 리뷰 삭제
  deleteReview: async (reviewId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/reviews/${reviewId}`);
    return response.data;
  },

  // 리뷰 상세 조회
  getReview: async (reviewId: number): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.get<ApiResponse<ReviewResponse>>(`/reviews/${reviewId}`);
    return response.data;
  },

  // 제휴점 리뷰 목록 조회
  getPlaceReviews: async (
    placeName: string, 
    placeAddress: string, 
    sortBy: string = 'latest',
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<{content: ReviewResponse[], totalElements: number, totalPages: number}>> => {
    const response = await api.get<ApiResponse<{content: ReviewResponse[], totalElements: number, totalPages: number}>>(`/reviews/place`, {
      params: { placeName, placeAddress, sortBy, page, size }
    });
    return response.data;
  },

  // 내 리뷰 목록 조회
  getMyReviews: async (page: number = 0, size: number = 10): Promise<ApiResponse<{content: ReviewResponse[], totalElements: number, totalPages: number}>> => {
    const response = await api.get<ApiResponse<{content: ReviewResponse[], totalElements: number, totalPages: number}>>('/reviews/my', {
      params: { page, size }
    });
    return response.data;
  },

  // 제휴점 리뷰 요약
  getPlaceReviewSummary: async (placeName: string, placeAddress: string): Promise<ApiResponse<ReviewSummary>> => {
    const response = await api.get<ApiResponse<ReviewSummary>>('/reviews/place/summary', {
      params: { placeName, placeAddress }
    });
    return response.data;
  },

  // 리뷰 도움이 됨 토글
  toggleHelpful: async (reviewId: number): Promise<ApiResponse<boolean>> => {
    const response = await api.post<ApiResponse<boolean>>(`/reviews/${reviewId}/helpful`);
    return response.data;
  },

  // 리뷰 신고
  reportReview: async (reviewId: number, data: ReviewReportRequest): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/reviews/${reviewId}/report`, data);
    return response.data;
  },

  // 리뷰 사진 업로드
  uploadReviewPhotos: async (files: File[]): Promise<ApiResponse<string[]>> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await api.post<ApiResponse<string[]>>('/reviews/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  },

  // 리뷰 사진 삭제
  deleteReviewPhoto: async (photoId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/reviews/photos/${photoId}`);
    return response.data;
  },

  // 리뷰 작성 가능 여부 확인 (예약 API 사용)
  canWriteReview: async (reservationId: number, userId: number): Promise<ApiResponse<boolean>> => {
    const response = await api.get<ApiResponse<boolean>>(`/reservations/${reservationId}/can-write-review?userId=${userId}`);
    return response.data;
  },

  // 예약의 리뷰 작성 상태 확인
  getReviewStatus: async (reservationId: number): Promise<ApiResponse<{hasReview: boolean}>> => {
    const response = await api.get<ApiResponse<{hasReview: boolean}>>(`/reservations/${reservationId}/review-status`);
    return response.data;
  },

  // 예약의 리뷰 조회
  getReviewByReservation: async (reservationId: number): Promise<ApiResponse<ReviewResponse | null>> => {
    const response = await api.get<ApiResponse<ReviewResponse | null>>(`/reservations/${reservationId}/review`);
    return response.data;
  },

  // 테스트용: 예약의 리뷰 삭제
  deleteReviewByReservation: async (reservationId: number): Promise<ApiResponse<string>> => {
    const response = await api.delete<ApiResponse<string>>(`/reservations/${reservationId}/review`);
    return response.data;
  },

  // 상위 평점 제휴점 조회
  getTopRatedPlaces: async (limit: number = 10): Promise<ApiResponse<PlaceReviewSummary[]>> => {
    const response = await api.get<ApiResponse<PlaceReviewSummary[]>>('/reviews/top-rated-places', {
      params: { limit }
    });
    return response.data;
  },

  // === 관리자용 리뷰 관리 API ===
  
  // 관리자 답변 추가
  addAdminReply: async (reviewId: number, adminReply: string): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.post<ApiResponse<ReviewResponse>>(`/reviews/${reviewId}/admin-reply`, {
      adminReply
    });
    return response.data;
  },

  // 리뷰 상태 변경
  updateReviewStatus: async (reviewId: number, status: string): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.put<ApiResponse<ReviewResponse>>(`/reviews/${reviewId}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  // 최근 리뷰 조회 (관리자용)
  getRecentReviews: async (page: number = 0, size: number = 20): Promise<ApiResponse<{content: ReviewResponse[], totalElements: number, totalPages: number}>> => {
    const response = await api.get<ApiResponse<{content: ReviewResponse[], totalElements: number, totalPages: number}>>('/reviews/admin/recent', {
      params: { page, size }
    });
    return response.data;
  },

  // 신고 많은 리뷰 조회 (관리자용)
  getHighReportReviews: async (threshold: number = 3): Promise<ApiResponse<ReviewResponse[]>> => {
    const response = await api.get<ApiResponse<ReviewResponse[]>>('/reviews/admin/high-reports', {
      params: { threshold }
    });
    return response.data;
  },

  // 특정 사용자의 리뷰 조회 (관리자용)
  getUserReviews: async (userId: number, page: number = 0, size: number = 100): Promise<ApiResponse<{content: ReviewResponse[], totalElements: number, totalPages: number}>> => {
    const response = await api.get<ApiResponse<{content: ReviewResponse[], totalElements: number, totalPages: number}>>(`/reviews/admin/user/${userId}`, {
      params: { page, size }
    });
    return response.data;
  }
};

// FAQ 관련 타입 정의
export interface FAQResponse {
  id: number;
  category: string;
  categoryName: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: number;
    name: string;
    email: string;
  };
  updatedBy?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface FAQCategoryInfo {
  code: string;
  name: string;
  count: number;
}

// FAQ 관련 서비스
export const faqService = {
  // FAQ 목록 조회 (활성화된 FAQ만)
  getAllFaqs: async (): Promise<ApiResponse<FAQResponse[]>> => {
    const response = await api.get<ApiResponse<FAQResponse[]>>('/faqs');
    return response.data;
  },

  // 카테고리별 FAQ 목록 조회
  getFaqsByCategory: async (category: string): Promise<ApiResponse<FAQResponse[]>> => {
    const response = await api.get<ApiResponse<FAQResponse[]>>(`/faqs/category/${category}`);
    return response.data;
  },

  // FAQ 상세 조회
  getFaq: async (faqId: number): Promise<ApiResponse<FAQResponse>> => {
    const response = await api.get<ApiResponse<FAQResponse>>(`/faqs/${faqId}`);
    return response.data;
  },

  // FAQ 검색
  searchFaqs: async (keyword?: string, category?: string): Promise<ApiResponse<FAQResponse[]>> => {
    const response = await api.get<ApiResponse<FAQResponse[]>>('/faqs/search', {
      params: { keyword, category }
    });
    return response.data;
  },

  // 카테고리 목록 조회
  getAllCategories: async (): Promise<ApiResponse<FAQCategoryInfo[]>> => {
    const response = await api.get<ApiResponse<FAQCategoryInfo[]>>('/faqs/categories');
    return response.data;
  },

  // 인기 FAQ 조회
  getPopularFaqs: async (limit: number = 5): Promise<ApiResponse<FAQResponse[]>> => {
    const response = await api.get<ApiResponse<FAQResponse[]>>('/faqs/popular', {
      params: { limit }
    });
    return response.data;
  }
};

// 문의 관련 타입 정의
export interface InquiryResponse {
  id: number;
  inquiryType: string;
  inquiryTypeName: string;
  subject: string;
  content: string;
  email: string;
  phone?: string;
  status: string;
  statusName: string;
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  adminUser?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface InquiryRequest {
  inquiryType: string;
  subject: string;
  content: string;
  email: string;
  phone?: string;
}

// 문의 관련 서비스
export const inquiryService = {
  // 문의 생성
  createInquiry: async (data: InquiryRequest): Promise<ApiResponse<InquiryResponse>> => {
    const response = await api.post<ApiResponse<InquiryResponse>>('/inquiries', data);
    return response.data;
  },

  // 내 문의 목록 조회
  getMyInquiries: async (): Promise<ApiResponse<InquiryResponse[]>> => {
    const response = await api.get<ApiResponse<InquiryResponse[]>>('/inquiries/my');
    return response.data;
  },

  // 문의 상세 조회
  getInquiry: async (inquiryId: number): Promise<ApiResponse<InquiryResponse>> => {
    const response = await api.get<ApiResponse<InquiryResponse>>(`/inquiries/${inquiryId}`);
    return response.data;
  },

  // 내 답변 대기 중인 문의 개수
  getMyPendingCount: async (): Promise<ApiResponse<number>> => {
    const response = await api.get<ApiResponse<number>>('/inquiries/my/pending-count');
    return response.data;
  }
};

// ==================== Activity Log API ====================

export interface ActivityLogDto {
  timestamp: string;
  action: string;
  actionCategory: string;
  userId: number;
  userEmail: string;
  userName: string;
  clientIp: string;
  httpMethod: string;
  requestUri: string;
  level: string;
  message: string;
  details: string;
  httpStatus: string;
  errorType: string;
}

export interface ActivityLogSearchParams {
  userId?: number;
  actionCategory?: string;
  action?: string;
  level?: string;
  days?: number;
  page?: number;
  size?: number;
}

export const activityLogService = {
  // 활동 로그 조회
  getActivityLogs: async (params: ActivityLogSearchParams): Promise<ApiResponse<ActivityLogDto[]>> => {
    const response = await api.get<ApiResponse<ActivityLogDto[]>>('/admin/activity-logs', {
      params
    });
    return response.data;
  },

  // 특정 사용자의 최근 활동 조회
  getRecentUserActivity: async (userId: number): Promise<ApiResponse<ActivityLogDto[]>> => {
    const response = await api.get<ApiResponse<ActivityLogDto[]>>(`/admin/activity-logs/user/${userId}/recent`);
    return response.data;
  },

  // 특정 사용자의 에러 로그 조회
  getUserErrors: async (userId: number, days: number = 30): Promise<ApiResponse<ActivityLogDto[]>> => {
    const response = await api.get<ApiResponse<ActivityLogDto[]>>(`/admin/activity-logs/user/${userId}/errors`, {
      params: { days }
    });
    return response.data;
  }
};

// ==================== Payment API ====================

export interface PaymentDto {
  id: number;
  reservationId: number;
  paymentId: string;
  transactionId?: string;
  merchantId?: string;
  storeId?: string;
  paymentMethod: string;
  paymentProvider?: string;
  easyPayProvider?: string;
  cardCompany?: string;
  cardType?: string;
  cardNumber?: string;
  cardName?: string;
  installmentMonth?: number;
  isInterestFree?: boolean;
  approvalNumber?: string;
  paymentAmount?: number;
  paymentStatus: string;
  paymentTime?: string;
  cancelledAt?: string;
  cancelReason?: string;
  refundAmount?: number;
  channelType?: string;
  channelId?: string;
  channelKey?: string;
  channelName?: string;
  pgMerchantId?: string;
  pgTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export const paymentService = {
  // 결제 ID로 결제 정보 조회
  getPaymentByPaymentId: async (paymentId: string): Promise<ApiResponse<PaymentDto>> => {
    const response = await api.get<ApiResponse<PaymentDto>>(`/payment/${paymentId}`);
    return response.data;
  },

  // 예약 번호로 결제 정보 조회
  getPaymentByReservationNumber: async (reservationNumber: string): Promise<ApiResponse<PaymentDto>> => {
    const response = await api.get<ApiResponse<PaymentDto>>(`/payment/reservation/${reservationNumber}`);
    return response.data;
  },

  // 예약 ID로 모든 결제 내역 조회
  getPaymentsByReservationId: async (reservationId: number): Promise<ApiResponse<PaymentDto[]>> => {
    const response = await api.get<ApiResponse<PaymentDto[]>>(`/payment/reservation/${reservationId}/all`);
    return response.data;
  },

  // 사용자 ID로 모든 결제 내역 조회
  getPaymentsByUserId: async (userId: number): Promise<ApiResponse<PaymentDto[]>> => {
    const response = await api.get<ApiResponse<PaymentDto[]>>(`/payment/user/${userId}`);
    return response.data;
  },

  // 결제 취소
  cancelPayment: async (paymentId: string, cancelReason: string): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>('/payment/cancel', {
      paymentId,
      cancelReason
    });
    return response.data;
  },

  // 결제 환불
  refundPayment: async (paymentId: string, refundAmount: number, refundReason: string): Promise<ApiResponse<PaymentDto>> => {
    const response = await api.post<ApiResponse<PaymentDto>>(`/payment/${paymentId}/refund`, {
      refundAmount,
      refundReason
    });
    return response.data;
  }
};

// ==================== Rider API ====================

export interface RiderRegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  vehicleNumber: string;
  licenseNumber?: string;
}

export interface RiderLoginRequest {
  email: string;
  password: string;
}

export interface RiderLoginResponse {
  userId: number;
  name: string;
  email: string;
  role: string;
  driverId: number;
  vehicleNumber: string;
  phoneNumber: string;
  driverStatus: string;
  accessToken: string;
  refreshToken: string;
}

export interface RiderApplicationResponse {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  phoneNumber: string;
  vehicleNumber: string;
  licenseNumber?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RejectRequest {
  rejectionReason: string;
}

export interface RiderResponse {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  phoneNumber: string;
  vehicleNumber: string;
  licenseNumber?: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'BREAK';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RiderStats {
  totalRiders: number;
  onlineRiders: number;
  offlineRiders: number;
  inactiveRiders: number;
}

export const riderService = {
  // 라이더 회원가입
  register: async (data: RiderRegisterRequest): Promise<ApiResponse<RiderApplicationResponse>> => {
    const response = await api.post<ApiResponse<RiderApplicationResponse>>('/riders/register', data);
    return response.data;
  },

  // 라이더 로그인
  login: async (data: RiderLoginRequest): Promise<ApiResponse<RiderLoginResponse>> => {
    const response = await api.post<ApiResponse<RiderLoginResponse>>('/riders/login', data);
    return response.data;
  },

  // 내 신청 상태 조회
  getApplicationStatus: async (userId: number): Promise<ApiResponse<RiderApplicationResponse>> => {
    const response = await api.get<ApiResponse<RiderApplicationResponse>>(`/riders/application/status?userId=${userId}`);
    return response.data;
  }
};

// 관리자용 라이더 관리 서비스
export const adminRiderService = {
  // 모든 라이더 신청 목록 조회
  getAllApplications: async (): Promise<ApiResponse<RiderApplicationResponse[]>> => {
    const response = await api.get<ApiResponse<RiderApplicationResponse[]>>('/riders/admin/applications');
    return response.data;
  },

  // 특정 상태의 라이더 신청 목록 조회
  getApplicationsByStatus: async (status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<ApiResponse<RiderApplicationResponse[]>> => {
    const response = await api.get<ApiResponse<RiderApplicationResponse[]>>(`/riders/admin/applications/status/${status}`);
    return response.data;
  },

  // 라이더 신청 상세 조회
  getApplicationById: async (applicationId: number): Promise<ApiResponse<RiderApplicationResponse>> => {
    const response = await api.get<ApiResponse<RiderApplicationResponse>>(`/riders/admin/applications/${applicationId}`);
    return response.data;
  },

  // 라이더 신청 승인
  approveApplication: async (applicationId: number): Promise<ApiResponse<RiderApplicationResponse>> => {
    const response = await api.post<ApiResponse<RiderApplicationResponse>>(`/riders/admin/applications/${applicationId}/approve`);
    return response.data;
  },

  // 라이더 신청 거절
  rejectApplication: async (applicationId: number, reason: string): Promise<ApiResponse<RiderApplicationResponse>> => {
    const response = await api.post<ApiResponse<RiderApplicationResponse>>(`/riders/admin/applications/${applicationId}/reject`, {
      rejectionReason: reason
    });
    return response.data;
  },

  // 승인된 라이더 목록 조회
  getApprovedRiders: async (): Promise<ApiResponse<RiderResponse[]>> => {
    const response = await api.get<ApiResponse<RiderResponse[]>>('/riders/admin/approved');
    return response.data;
  },

  // 라이더 통계 조회
  getRiderStats: async (): Promise<ApiResponse<RiderStats>> => {
    const response = await api.get<ApiResponse<RiderStats>>('/riders/admin/stats');
    return response.data;
  },

  // 라이더 출퇴근 상태 변경
  updateDriverStatus: async (driverId: number, status: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'BREAK'): Promise<ApiResponse<RiderResponse>> => {
    const response = await api.put<ApiResponse<RiderResponse>>(`/riders/admin/${driverId}/status`, {
      status
    });
    return response.data;
  },

  // 라이더 비활성화
  deactivateDriver: async (driverId: number): Promise<ApiResponse<RiderResponse>> => {
    const response = await api.put<ApiResponse<RiderResponse>>(`/riders/admin/${driverId}/deactivate`);
    return response.data;
  },

  // 라이더 활성화
  activateDriver: async (driverId: number): Promise<ApiResponse<RiderResponse>> => {
    const response = await api.put<ApiResponse<RiderResponse>>(`/riders/admin/${driverId}/activate`);
    return response.data;
  }
};

export default api;