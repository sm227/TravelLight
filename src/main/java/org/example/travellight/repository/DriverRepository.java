package org.example.travellight.repository;

import org.example.travellight.entity.Driver;
import org.example.travellight.entity.DriverStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {

    Optional<Driver> findByUserId(Long userId);

    Optional<Driver> findByLicenseNumber(String licenseNumber);

    List<Driver> findByStatus(DriverStatus status);

    List<Driver> findByStatusIn(List<DriverStatus> statuses);

    @Query("SELECT d FROM Driver d WHERE d.status = :status AND " +
           "d.currentLatitude IS NOT NULL AND d.currentLongitude IS NOT NULL")
    List<Driver> findAvailableDriversWithLocation(@Param("status") DriverStatus status);

    @Query("SELECT d FROM Driver d WHERE d.status IN (:statuses) AND " +
           "d.lastLocationUpdate >= :since")
    List<Driver> findActiveDriversSince(@Param("statuses") List<DriverStatus> statuses,
                                       @Param("since") LocalDateTime since);

    @Query("SELECT d FROM Driver d JOIN d.deliveries delivery " +
           "WHERE delivery.status IN ('ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_PROGRESS') " +
           "GROUP BY d.id")
    List<Driver> findDriversWithActiveDeliveries();

    @Query("SELECT COUNT(d) FROM Driver d WHERE d.status = :status")
    Long countByStatus(@Param("status") DriverStatus status);

    @Query("SELECT d FROM Driver d WHERE d.vehicleType = :vehicleType AND d.status = :status")
    List<Driver> findByVehicleTypeAndStatus(@Param("vehicleType") String vehicleType,
                                           @Param("status") DriverStatus status);

    boolean existsByLicenseNumber(String licenseNumber);

    boolean existsByVehicleNumber(String vehicleNumber);

    @Query("SELECT d FROM Driver d WHERE " +
           "(:lat - d.currentLatitude) * (:lat - d.currentLatitude) + " +
           "(:lng - d.currentLongitude) * (:lng - d.currentLongitude) <= :radiusSquared " +
           "AND d.status = :status AND d.currentLatitude IS NOT NULL")
    List<Driver> findNearbyDrivers(@Param("lat") Double latitude,
                                  @Param("lng") Double longitude,
                                  @Param("radiusSquared") Double radiusSquared,
                                  @Param("status") DriverStatus status);
}