package org.example.travellight.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

public class DeliveryDto {
    @Getter
    @Setter
    public static class DeliveryRequest {
        private Long userId;
        private String pickupAddress;
        private String deliveryAddress;
        private String itemDescription;
        private Double weight;
    }

    @Getter
    @Setter
    public static class DeliveryResponse {
        private Long id;
        private Long userId;
        private String pickupAddress;
        private String deliveryAddress;
        private String itemDescription;
        private Double weight;
        private LocalDateTime requestedAt;
        private String status;
        private String trackingNumber;
        private LocalDateTime estimatedDeliveryTime;
    }
} 