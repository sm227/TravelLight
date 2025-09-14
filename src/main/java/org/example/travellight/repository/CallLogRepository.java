package org.example.travellight.repository;

import org.example.travellight.entity.CallLog;
import org.example.travellight.entity.CallStatus;
import org.example.travellight.entity.CallType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CallLogRepository extends JpaRepository<CallLog, Long> {

    List<CallLog> findByDeliveryIdOrderByCallStartTimeDesc(Long deliveryId);

    List<CallLog> findByDriverIdOrderByCallStartTimeDesc(Long driverId);

    List<CallLog> findByDriverIdAndCallStartTimeBetween(Long driverId,
                                                       LocalDateTime startTime,
                                                       LocalDateTime endTime);

    List<CallLog> findByCallStatus(CallStatus callStatus);

    List<CallLog> findByCallType(CallType callType);

    @Query("SELECT cl FROM CallLog cl WHERE cl.driver.id = :driverId " +
           "AND cl.callStartTime >= :startTime ORDER BY cl.callStartTime DESC")
    List<CallLog> findRecentCallsByDriverId(@Param("driverId") Long driverId,
                                           @Param("startTime") LocalDateTime startTime);

    @Query("SELECT COUNT(cl) FROM CallLog cl WHERE cl.driver.id = :driverId " +
           "AND cl.callStatus = :status")
    Long countByDriverIdAndCallStatus(@Param("driverId") Long driverId,
                                     @Param("status") CallStatus status);

    @Query("SELECT AVG(cl.duration) FROM CallLog cl WHERE cl.driver.id = :driverId " +
           "AND cl.duration IS NOT NULL")
    Double getAverageCallDurationByDriverId(@Param("driverId") Long driverId);

    @Query("SELECT cl FROM CallLog cl WHERE cl.delivery.id = :deliveryId " +
           "AND cl.callStatus = :status ORDER BY cl.callStartTime DESC")
    List<CallLog> findByDeliveryIdAndCallStatus(@Param("deliveryId") Long deliveryId,
                                               @Param("status") CallStatus status);

    Long countByDriverId(Long driverId);

    @Query("SELECT COUNT(cl) FROM CallLog cl WHERE cl.driver.id = :driverId " +
           "AND cl.callStartTime >= :startOfDay AND cl.callStartTime < :endOfDay")
    Long countTodayCallsByDriverId(@Param("driverId") Long driverId,
                                  @Param("startOfDay") LocalDateTime startOfDay,
                                  @Param("endOfDay") LocalDateTime endOfDay);
}