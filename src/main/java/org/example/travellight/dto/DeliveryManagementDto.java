package org.example.travellight.dto;

import lombok.Getter;
import lombok.Setter;
import org.example.travellight.entity.DeliveryStatus;
import java.time.LocalDateTime;
import java.util.List;

public class DeliveryManagementDto {

    @Getter
    @Setter
    public static class DeliveryAssignRequest {
        private Long driverId;
        private String notes;
    }

    @Getter
    @Setter
    public static class DeliveryStatusUpdateRequest {
        private DeliveryStatus status;
        private String notes;
        private Double latitude;
        private Double longitude;
    }

    @Getter
    @Setter
    public static class DeliveryDetailResponse {
        private Long id;
        private String trackingNumber;
        private String pickupAddress;
        private String deliveryAddress;
        private String itemDescription;
        private Double weight;
        private DeliveryStatus status;
        private LocalDateTime requestedAt;
        private LocalDateTime estimatedDeliveryTime;
        private LocalDateTime assignedAt;
        private LocalDateTime pickedUpAt;
        private LocalDateTime deliveredAt;
        private String deliveryNotes;
        private String customerPhoneNumber;

        // Driver information
        private Long driverId;
        private String driverName;
        private String driverPhone;
        private String vehicleInfo;

        // Customer information
        private Long customerId;
        private String customerName;

        // Location information
        private Double pickupLatitude;
        private Double pickupLongitude;
        private Double deliveryLatitude;
        private Double deliveryLongitude;

        // Photos
        private List<DeliveryPhotoResponse> photos;
    }

    @Getter
    @Setter
    public static class DeliveryListResponse {
        private Long id;
        private String trackingNumber;
        private String pickupAddress;
        private String deliveryAddress;
        private DeliveryStatus status;
        private LocalDateTime requestedAt;
        private LocalDateTime estimatedDeliveryTime;
        private String driverName;
        private String customerName;
        private String customerPhone;
    }

    @Getter
    @Setter
    public static class DeliveryPhotoUploadRequest {
        private String description;
        private String photoType; // PICKUP, DELIVERY, DAMAGE, OTHER
    }

    @Getter
    @Setter
    public static class DeliveryPhotoResponse {
        private Long id;
        private String photoUrl;
        private String fileName;
        private String description;
        private String photoType;
        private LocalDateTime uploadedAt;
    }

    @Getter
    @Setter
    public static class DeliveryCompleteRequest {
        private String notes;
        private Double latitude;
        private Double longitude;
        private List<String> photoUrls;
    }

    @Getter
    @Setter
    public static class DeliveryRouteResponse {
        private Long deliveryId;
        private String pickupAddress;
        private String deliveryAddress;
        private Double pickupLatitude;
        private Double pickupLongitude;
        private Double deliveryLatitude;
        private Double deliveryLongitude;
        private Double estimatedDistance;
        private Integer estimatedDuration; // minutes
        private String routePolyline; // encoded polyline for map
    }

    @Getter
    @Setter
    public static class DeliveryETAUpdateRequest {
        private LocalDateTime estimatedArrival;
        private String reason;
    }

    @Getter
    @Setter
    public static class CustomerContactResponse {
        private Long deliveryId;
        private String customerName;
        private String customerPhone;
        private String deliveryAddress;
        private String specialInstructions;
    }

    @Getter
    @Setter
    public static class DeliveryStatsResponse {
        private Integer totalDeliveries;
        private Integer pendingDeliveries;
        private Integer assignedDeliveries;
        private Integer inProgressDeliveries;
        private Integer completedDeliveries;
        private Integer cancelledDeliveries;
        private Double averageDeliveryTime; // hours
        private Double successRate; // percentage
    }
}