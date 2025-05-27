package org.example.travellight.service;

import org.example.travellight.dto.ReservationDto;
import java.util.List;

public interface ReservationService {
    
    // 예약 생성
    ReservationDto createReservation(ReservationDto reservationDto);
    
    // 예약 ID로 조회
    ReservationDto getReservationById(Long id);
    
    // 예약 번호로 조회
    ReservationDto getReservationByNumber(String reservationNumber);
    
    // 사용자의 모든 예약 조회
    List<ReservationDto> getUserReservations(Long userId);
    
    // 예약 취소
    void cancelReservation(Long id);
    
    // 매장명으로 예약 조회
    List<ReservationDto> getReservationsByPlaceName(String placeName);
    
    // 최근 예약 조회 (관리자 대시보드용)
    List<ReservationDto> getRecentReservations(int limit);
} 