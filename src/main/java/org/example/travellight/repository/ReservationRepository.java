package org.example.travellight.repository;

import org.example.travellight.entity.Reservation;
import org.example.travellight.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    // 사용자의 모든 예약 조회
    List<Reservation> findByUser(User user);
    
    // 예약번호로 예약 조회
    Optional<Reservation> findByReservationNumber(String reservationNumber);
    
    // 사용자 ID로 예약 조회
    List<Reservation> findByUserId(Long userId);
    
    // 매장명으로 예약 조회
    List<Reservation> findByPlaceName(String placeName);
    
    // 매장명과 주소로 예약 조회
    List<Reservation> findByPlaceNameAndPlaceAddress(String placeName, String placeAddress);
    
    // 최근 예약 조회 (생성일 기준 내림차순)
    @Query("SELECT r FROM Reservation r ORDER BY r.createdAt DESC")
    List<Reservation> findRecentReservations(Pageable pageable);
    
    // 특정 매장의 만료된 예약 조회
    @Query("SELECT r FROM Reservation r WHERE r.placeName = :placeName AND r.placeAddress = :placeAddress " +
           "AND r.status = 'RESERVED' " +
           "AND ((r.storageEndDate < CURRENT_DATE) OR " +
           "(r.storageEndDate = CURRENT_DATE AND r.storageEndTime < CURRENT_TIME))")
    List<Reservation> findExpiredReservationsForStore(@Param("placeName") String placeName, 
                                                     @Param("placeAddress") String placeAddress);
    
    // 특정 매장의 만료된 예약들을 배치로 COMPLETED 상태로 업데이트
    @Modifying
    @Query("UPDATE Reservation r SET r.status = 'COMPLETED', r.updatedAt = CURRENT_TIMESTAMP " +
           "WHERE r.placeName = :placeName AND r.placeAddress = :placeAddress " +
           "AND r.status = 'RESERVED' " +
           "AND ((r.storageEndDate < CURRENT_DATE) OR " +
           "(r.storageEndDate = CURRENT_DATE AND r.storageEndTime < CURRENT_TIME))")
    int updateExpiredReservationsForStoreToCompleted(@Param("placeName") String placeName, 
                                                    @Param("placeAddress") String placeAddress);
} 