package org.example.travellight.repository;

import org.example.travellight.entity.Notification;
import org.example.travellight.entity.NotificationStatus;
import org.example.travellight.entity.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Notification> findByDriverIdOrderByCreatedAtDesc(Long driverId);

    Page<Notification> findByDriverIdOrderByCreatedAtDesc(Long driverId, Pageable pageable);

    List<Notification> findByUserIdAndStatus(Long userId, NotificationStatus status);

    List<Notification> findByDriverIdAndStatus(Long driverId, NotificationStatus status);

    @Query("SELECT n FROM Notification n WHERE (n.user.id = :userId OR n.driver.id = :driverId) " +
           "AND n.status = :status ORDER BY n.createdAt DESC")
    List<Notification> findByUserOrDriverAndStatus(@Param("userId") Long userId,
                                                   @Param("driverId") Long driverId,
                                                   @Param("status") NotificationStatus status);

    Long countByUserIdAndStatus(Long userId, NotificationStatus status);

    Long countByDriverIdAndStatus(Long driverId, NotificationStatus status);

    List<Notification> findByDeliveryIdOrderByCreatedAtDesc(Long deliveryId);

    List<Notification> findByType(NotificationType type);

    @Query("SELECT n FROM Notification n WHERE n.status = :status " +
           "AND n.createdAt <= :cutoffTime ORDER BY n.createdAt")
    List<Notification> findOldNotificationsByStatus(@Param("status") NotificationStatus status,
                                                    @Param("cutoffTime") LocalDateTime cutoffTime);

    @Query("SELECT n FROM Notification n WHERE n.status = 'PENDING' " +
           "ORDER BY n.createdAt")
    List<Notification> findPendingNotifications();

    void deleteByCreatedAtBefore(LocalDateTime cutoffTime);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId " +
           "AND n.readAt IS NULL")
    Long countUnreadByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.driver.id = :driverId " +
           "AND n.readAt IS NULL")
    Long countUnreadByDriverId(@Param("driverId") Long driverId);
}