package org.example.travellight.repository;

import org.example.travellight.entity.StorageItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StorageItemRepository extends JpaRepository<StorageItem, Long> {

    // 예약 ID로 StorageItem 조회
    Optional<StorageItem> findByReservationId(Long reservationId);

    // 스토리지 코드로 조회 (QR코드 스캔용)
    Optional<StorageItem> findByStorageCode(String storageCode);

    // 특정 매장의 현재 보관 중인 짐들 조회
    @Query("SELECT si FROM StorageItem si " +
           "JOIN si.reservation r " +
           "WHERE r.placeName = :placeName " +
           "AND r.placeAddress = :placeAddress " +
           "AND si.status = 'STORED' " +
           "ORDER BY si.checkInTime DESC")
    List<StorageItem> findCurrentStoredItemsByStore(@Param("placeName") String placeName,
                                                    @Param("placeAddress") String placeAddress);

    // 특정 매장의 모든 보관 이력 조회
    @Query("SELECT si FROM StorageItem si " +
           "JOIN si.reservation r " +
           "WHERE r.placeName = :placeName " +
           "AND r.placeAddress = :placeAddress " +
           "ORDER BY si.checkInTime DESC")
    List<StorageItem> findAllStorageItemsByStore(@Param("placeName") String placeName,
                                                 @Param("placeAddress") String placeAddress);

    // 상태별 StorageItem 조회
    List<StorageItem> findByStatusOrderByCheckInTimeDesc(String status);

    // 예약번호로 StorageItem 조회
    @Query("SELECT si FROM StorageItem si " +
           "JOIN si.reservation r " +
           "WHERE r.reservationNumber = :reservationNumber")
    Optional<StorageItem> findByReservationNumber(@Param("reservationNumber") String reservationNumber);

    // 고객의 모든 보관 이력 조회
    @Query("SELECT si FROM StorageItem si " +
           "JOIN si.reservation r " +
           "WHERE r.user.id = :userId " +
           "ORDER BY si.checkInTime DESC")
    List<StorageItem> findByUserId(@Param("userId") Long userId);

    // 특정 기간 내 출고되지 않은 짐들 조회 (장기 미수령 관리용)
    @Query("SELECT si FROM StorageItem si " +
           "WHERE si.status = 'STORED' " +
           "AND si.checkInTime < :cutoffDate " +
           "ORDER BY si.checkInTime ASC")
    List<StorageItem> findLongTermStoredItems(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);
}