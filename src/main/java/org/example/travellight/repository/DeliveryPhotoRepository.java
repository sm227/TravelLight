package org.example.travellight.repository;

import org.example.travellight.entity.DeliveryPhoto;
import org.example.travellight.entity.PhotoType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DeliveryPhotoRepository extends JpaRepository<DeliveryPhoto, Long> {

    List<DeliveryPhoto> findByDeliveryId(Long deliveryId);

    List<DeliveryPhoto> findByDeliveryIdAndPhotoType(Long deliveryId, PhotoType photoType);

    List<DeliveryPhoto> findByDeliveryIdOrderByUploadedAtDesc(Long deliveryId);

    Long countByDeliveryId(Long deliveryId);

    List<DeliveryPhoto> findByUploadedAtBetween(LocalDateTime startTime, LocalDateTime endTime);

    void deleteByDeliveryId(Long deliveryId);
}