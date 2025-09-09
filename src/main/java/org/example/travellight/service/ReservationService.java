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
    
    // 예약 번호로 예약 취소
    void cancelReservationByNumber(String reservationNumber);
    
    // 매장명으로 예약 조회
    List<ReservationDto> getReservationsByPlaceName(String placeName);
    
    // 최근 예약 조회 (관리자 대시보드용)
    List<ReservationDto> getRecentReservations(int limit);
    
    // 예약의 결제 ID 업데이트
    void updatePaymentId(String reservationNumber, String paymentId);
    
    // 예약 상태를 COMPLETED로 업데이트 (매장 용량 복원)
    void updateReservationStatusToCompleted(String reservationNumber);
    
    // 특정 매장의 만료된 예약들을 실시간으로 COMPLETED 상태로 변경
    void processExpiredReservationsForStore(String businessName, String address);
} 