const API_BASE_URL = '/api';

export interface Coupon {
  id: number;
  code: string;
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCouponRequest {
  code: string;
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  description?: string;
}

export interface UpdateCouponRequest {
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  isActive: boolean;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface UserCoupon {
  userCouponId: number;
  couponId: number;
  code: string;
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  description?: string;
  isUsed: boolean;
  issuedAt: string;
  usedAt?: string;
  orderId?: string;
  canUse: boolean;
}

export interface UseCouponRequest {
  userId: number;
  couponCode: string;
  purchaseAmount: number;
  orderId?: string;
}

export interface ApplyCouponResponse {
  couponId: number;
  couponCode: string;
  couponName: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  message: string;
}

/**
 * 인증 토큰 가져오기
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * 인증 헤더 생성
 */
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * 모든 쿠폰 조회
 */
export const getAllCoupons = async (): Promise<Coupon[]> => {
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('쿠폰 목록을 불러오는데 실패했습니다.');
  }

  const result: ApiResponse<Coupon[]> = await response.json();
  return result.data;
};

/**
 * 쿠폰 ID로 조회
 */
export const getCouponById = async (id: number): Promise<Coupon> => {
  const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('쿠폰 정보를 불러오는데 실패했습니다.');
  }

  const result: ApiResponse<Coupon> = await response.json();
  return result.data;
};

/**
 * 사용 가능한 쿠폰 조회
 */
export const getAvailableCoupons = async (): Promise<Coupon[]> => {
  const response = await fetch(`${API_BASE_URL}/coupons/available`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('사용 가능한 쿠폰을 불러오는데 실패했습니다.');
  }

  const result: ApiResponse<Coupon[]> = await response.json();
  return result.data;
};

/**
 * 쿠폰 생성 (관리자 전용)
 */
export const createCoupon = async (request: CreateCouponRequest): Promise<Coupon> => {
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '쿠폰 생성에 실패했습니다.' }));
    throw new Error(errorData.message || '쿠폰 생성에 실패했습니다.');
  }

  const result: ApiResponse<Coupon> = await response.json();
  return result.data;
};

/**
 * 쿠폰 수정 (관리자 전용)
 */
export const updateCoupon = async (id: number, request: UpdateCouponRequest): Promise<Coupon> => {
  const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '쿠폰 수정에 실패했습니다.' }));
    throw new Error(errorData.message || '쿠폰 수정에 실패했습니다.');
  }

  const result: ApiResponse<Coupon> = await response.json();
  return result.data;
};

/**
 * 쿠폰 삭제 (관리자 전용)
 */
export const deleteCoupon = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '쿠폰 삭제에 실패했습니다.' }));
    throw new Error(errorData.message || '쿠폰 삭제에 실패했습니다.');
  }
};

/**
 * 쿠폰 활성화/비활성화 토글 (관리자 전용)
 */
export const toggleCouponStatus = async (id: number): Promise<Coupon> => {
  const response = await fetch(`${API_BASE_URL}/coupons/${id}/toggle`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '쿠폰 상태 변경에 실패했습니다.' }));
    throw new Error(errorData.message || '쿠폰 상태 변경에 실패했습니다.');
  }

  const result: ApiResponse<Coupon> = await response.json();
  return result.data;
};

// ========== 사용자 쿠폰 API ==========

/**
 * 사용자의 모든 쿠폰 조회
 */
export const getUserCoupons = async (userId: number): Promise<UserCoupon[]> => {
  const response = await fetch(`${API_BASE_URL}/user-coupons/user/${userId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('쿠폰 목록을 불러오는데 실패했습니다.');
  }

  const result: ApiResponse<UserCoupon[]> = await response.json();
  return result.data;
};

/**
 * 사용자의 사용 가능한 쿠폰 조회
 */
export const getAvailableUserCoupons = async (userId: number): Promise<UserCoupon[]> => {
  const response = await fetch(`${API_BASE_URL}/user-coupons/user/${userId}/available`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('사용 가능한 쿠폰을 불러오는데 실패했습니다.');
  }

  const result: ApiResponse<UserCoupon[]> = await response.json();
  return result.data;
};

/**
 * 쿠폰 사용
 */
export const useCoupon = async (request: UseCouponRequest): Promise<ApplyCouponResponse> => {
  const response = await fetch(`${API_BASE_URL}/user-coupons/use`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '쿠폰 사용에 실패했습니다.' }));
    throw new Error(errorData.message || '쿠폰 사용에 실패했습니다.');
  }

  const result: ApiResponse<ApplyCouponResponse> = await response.json();
  return result.data;
};

/**
 * 웰컴 쿠폰 발급 (수동)
 */
export const issueWelcomeCoupon = async (userId: number): Promise<UserCoupon> => {
  const response = await fetch(`${API_BASE_URL}/user-coupons/user/${userId}/welcome`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '웰컴 쿠폰 발급에 실패했습니다.' }));
    throw new Error(errorData.message || '웰컴 쿠폰 발급에 실패했습니다.');
  }

  const result: ApiResponse<UserCoupon> = await response.json();
  return result.data;
};

/**
 * 사용자가 특정 쿠폰을 보유하고 있는지 확인
 */
export const hasUserCoupon = async (userId: number, couponCode: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/user-coupons/user/${userId}/has/${couponCode}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('쿠폰 보유 확인에 실패했습니다.');
  }

  const result: ApiResponse<boolean> = await response.json();
  return result.data;
};

/**
 * 사용자에게 알림으로 보여줄 쿠폰 목록 조회 (아직 받지 않은 쿠폰)
 */
export const getNotificationCoupons = async (userId: number): Promise<Coupon[]> => {
  const response = await fetch(`${API_BASE_URL}/user-coupons/user/${userId}/notifications`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('알림 쿠폰 조회에 실패했습니다.');
  }

  const result: ApiResponse<Coupon[]> = await response.json();
  return result.data;
};

/**
 * 웰컴 쿠폰 사용 여부 확인
 */
export const hasUsedWelcomeCoupon = async (userId: number): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/user-coupons/user/${userId}/welcome-used`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('웰컴 쿠폰 사용 여부 확인에 실패했습니다.');
  }

  const result: ApiResponse<boolean> = await response.json();
  return result.data;
};
