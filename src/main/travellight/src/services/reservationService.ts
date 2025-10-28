import { ReservationDto } from '../types/reservation';

// const API_BASE_URL = 'http://localhost:8080/api';
// const API_BASE_URL = 'http://52.79.53.239:8080/api';
const API_BASE_URL = '/api';


export const getMyReservations = async (userId: number): Promise<ReservationDto[]> => {
  const response = await fetch(`${API_BASE_URL}/reservations/user/${userId}`);
  if (!response.ok) {
    throw new Error('예약 정보를 불러오는데 실패했습니다.');
  }
  return response.json();
};

export const getReservationDetail = async (reservationNumber: string): Promise<ReservationDto> => {
  const response = await fetch(`${API_BASE_URL}/reservations/number/${reservationNumber}`);
  if (!response.ok) {
    throw new Error('예약 상세 정보를 불러오는데 실패했습니다.');
  }
  return response.json();
};

export const getRecentReservations = async (limit: number = 10): Promise<ReservationDto[]> => {
  const response = await fetch(`${API_BASE_URL}/reservations/recent?limit=${limit}`);
  if (!response.ok) {
    throw new Error('최근 예약 정보를 불러오는데 실패했습니다.');
  }
  return response.json();
};

// 관리자용 전체 예약 조회
export const getAllReservations = async (): Promise<ReservationDto[]> => {
  const response = await fetch(`${API_BASE_URL}/reservations/admin/all`);
  if (!response.ok) {
    throw new Error('전체 예약 정보를 불러오는데 실패했습니다.');
  }
  return response.json();
};

// 매장별 회원별 예약 통계 조회
export const getReservationStats = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/reservations/admin/stats/by-store-and-user`);
  if (!response.ok) {
    throw new Error('예약 통계 정보를 불러오는데 실패했습니다.');
  }
  return response.json();
};

// 예약 취소 API
export const cancelReservation = async (reservationNumber: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/reservations/${reservationNumber}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '예약 취소에 실패했습니다.' }));
    throw new Error(errorData.message || '예약 취소에 실패했습니다.');
  }
  
  return response.json();
};

// 포트원 결제 취소 API
export const cancelPayment = async (paymentId: string, reason: string = '고객 요청'): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/payment/${paymentId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason: reason
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '결제 취소에 실패했습니다.' }));
    throw new Error(errorData.message || '결제 취소에 실패했습니다.');
  }
  
  return response.json();
}; 