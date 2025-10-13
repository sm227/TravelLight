package org.example.travellight.repository;

import org.example.travellight.entity.Payment;
import org.example.travellight.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // 결제 ID로 조회
    Optional<Payment> findByPaymentId(String paymentId);

    // 예약으로 결제 조회
    Optional<Payment> findByReservation(Reservation reservation);

    // 예약 ID로 결제 조회
    @Query("SELECT p FROM Payment p WHERE p.reservation.id = :reservationId")
    Optional<Payment> findByReservationId(@Param("reservationId") Long reservationId);

    // 예약 번호로 결제 조회
    @Query("SELECT p FROM Payment p WHERE p.reservation.reservationNumber = :reservationNumber")
    Optional<Payment> findByReservationNumber(@Param("reservationNumber") String reservationNumber);

    // 결제 상태로 조회
    List<Payment> findByPaymentStatus(String paymentStatus);

    // 결제 제공자로 조회
    List<Payment> findByPaymentProvider(String paymentProvider);

    // 특정 예약의 모든 결제 내역 조회 (결제, 취소, 환불 등)
    @Query("SELECT p FROM Payment p WHERE p.reservation.id = :reservationId ORDER BY p.createdAt DESC")
    List<Payment> findAllByReservationId(@Param("reservationId") Long reservationId);

    // 거래 ID로 조회
    Optional<Payment> findByTransactionId(String transactionId);

    // 사용자 ID로 모든 결제 내역 조회
    @Query("SELECT p FROM Payment p WHERE p.reservation.user.id = :userId ORDER BY p.createdAt DESC")
    List<Payment> findAllByUserId(@Param("userId") Long userId);
}
