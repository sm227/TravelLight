package org.example.travellight.repository;

import org.example.travellight.entity.Delivery;
import org.example.travellight.entity.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    List<Delivery> findByReservationId(Long reservationId);

    List<Delivery> findByDriverIdOrderByRequestedAtDesc(Long driverId);

    List<Delivery> findByDriverIdAndStatus(Long driverId, DeliveryStatus status);

    List<Delivery> findByStatusOrderByRequestedAtDesc(DeliveryStatus status);

    List<Delivery> findByStatusIn(List<DeliveryStatus> statuses);

    Optional<Delivery> findByTrackingNumber(String trackingNumber);

    @Query("SELECT d FROM Delivery d WHERE d.driver.id = :driverId " +
           "AND d.status IN :statuses ORDER BY d.requestedAt DESC")
    List<Delivery> findByDriverIdAndStatusIn(@Param("driverId") Long driverId,
                                           @Param("statuses") List<DeliveryStatus> statuses);

    @Query("SELECT d FROM Delivery d WHERE d.status = 'PENDING' " +
           "ORDER BY d.requestedAt ASC")
    List<Delivery> findPendingDeliveries();

    @Query("SELECT d FROM Delivery d WHERE d.driver.id = :driverId " +
           "AND d.requestedAt >= :startTime ORDER BY d.requestedAt DESC")
    List<Delivery> findByDriverIdAndRequestedAtAfter(@Param("driverId") Long driverId,
                                                    @Param("startTime") LocalDateTime startTime);

    @Query("SELECT COUNT(d) FROM Delivery d WHERE d.driver.id = :driverId " +
           "AND d.status = :status")
    Long countByDriverIdAndStatus(@Param("driverId") Long driverId,
                                 @Param("status") DeliveryStatus status);

    @Query("SELECT COUNT(d) FROM Delivery d WHERE d.driver.id = :driverId " +
           "AND DATE(d.requestedAt) = CURRENT_DATE")
    Long countTodayDeliveriesByDriverId(@Param("driverId") Long driverId);

    @Query("SELECT d FROM Delivery d WHERE d.estimatedDeliveryTime < :currentTime " +
           "AND d.status IN ('ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_PROGRESS')")
    List<Delivery> findOverdueDeliveries(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT d FROM Delivery d WHERE d.driver IS NULL AND d.status = 'PENDING' " +
           "ORDER BY d.requestedAt ASC")
    List<Delivery> findUnassignedDeliveries();

    Long countByStatus(DeliveryStatus status);

    @Query("SELECT d FROM Delivery d WHERE d.user.id = :userId " +
           "ORDER BY d.requestedAt DESC")
    List<Delivery> findByUserId(@Param("userId") Long userId);
} 