package org.example.travellight.service;

import org.example.travellight.dto.ReservationDto;
import java.util.List;
import java.util.Map;

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
    
    // 전체 예약 조회 (관리자용)
    List<ReservationDto> getAllReservations();
    
    // 매장별 회원별 예약 통계 조회 (관리자용)
    Map<String, Object> getReservationStatsByStoreAndUser();
    
    // 예약의 결제 ID 업데이트
    void updatePaymentId(String reservationNumber, String paymentId);
    
    // 예약의 결제 정보 업데이트 (결제 방법, 금액, 시간 포함)
    void updatePaymentInfo(String reservationNumber, String paymentId, String paymentMethod, Integer paymentAmount);
    
    // 예약의 상세 결제 정보 업데이트 (결제 상태, 제공자, 카드사 등 포함)
    void updateDetailedPaymentInfo(String reservationNumber, String paymentId, String paymentMethod, Integer paymentAmount, 
                                 String paymentStatus, String paymentProvider, String cardCompany, String cardType);
    
    // 예약 상태를 COMPLETED로 업데이트 (매장 용량 복원)
    void updateReservationStatusToCompleted(String reservationNumber);
    
    // 특정 매장의 만료된 예약들을 실시간으로 COMPLETED 상태로 변경
    void processExpiredReservationsForStore(String businessName, String address);
} 