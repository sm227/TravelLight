package org.example.travellight.repository;

import org.example.travellight.entity.DriverLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DriverLocationRepository extends JpaRepository<DriverLocation, Long> {

    List<DriverLocation> findByDriverIdOrderByRecordedAtDesc(Long driverId);

    Optional<DriverLocation> findTopByDriverIdOrderByRecordedAtDesc(Long driverId);

    List<DriverLocation> findByDriverIdAndRecordedAtBetween(Long driverId,
                                                           LocalDateTime startTime,
                                                           LocalDateTime endTime);

    @Query("SELECT dl FROM DriverLocation dl WHERE dl.driver.id = :driverId " +
           "AND dl.recordedAt >= :since ORDER BY dl.recordedAt DESC")
    List<DriverLocation> findRecentLocationsByDriverId(@Param("driverId") Long driverId,
                                                       @Param("since") LocalDateTime since);

    @Query("SELECT dl FROM DriverLocation dl WHERE dl.recordedAt < :cutoffTime")
    List<DriverLocation> findOldLocations(@Param("cutoffTime") LocalDateTime cutoffTime);

    void deleteByDriverIdAndRecordedAtBefore(Long driverId, LocalDateTime cutoffTime);

    Long countByDriverId(Long driverId);

    @Query("SELECT dl FROM DriverLocation dl WHERE dl.driver.id IN :driverIds " +
           "AND dl.recordedAt = (SELECT MAX(dl2.recordedAt) FROM DriverLocation dl2 " +
           "WHERE dl2.driver.id = dl.driver.id)")
    List<DriverLocation> findLatestLocationsByDriverIds(@Param("driverIds") List<Long> driverIds);
}