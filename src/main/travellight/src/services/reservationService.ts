import { ReservationDto } from '../types/reservation';

const API_BASE_URL = 'http://localhost:8080/api';

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