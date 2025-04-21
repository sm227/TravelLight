package org.example.travellight.repository;

import org.example.travellight.entity.Reservation;
import org.example.travellight.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    // 사용자의 모든 예약 조회
    List<Reservation> findByUser(User user);
    
    // 예약번호로 예약 조회
    Reservation findByReservationNumber(String reservationNumber);
    
    // 사용자 ID로 예약 조회
    List<Reservation> findByUserId(Long userId);
} 