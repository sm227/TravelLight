package org.example.travellight.dto;

import lombok.Getter;
import lombok.Setter;
import org.example.travellight.entity.DriverStatus;
import java.time.LocalDateTime;
import java.util.List;

public class DriverDto {

    @Getter
    @Setter
    public static class DriverLoginRequest {
        private String email;
        private String password;
    }

    @Getter
    @Setter
    public static class DriverResponse {
        private Long id;
        private Long userId;
        private String name;
        private String email;
        private String licenseNumber;
        private String vehicleType;
        private String vehicleNumber;
        private DriverStatus status;
        private Double currentLatitude;
        private Double currentLongitude;
        private String phoneNumber;
        private LocalDateTime lastLocationUpdate;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    public static class DriverStatusUpdateRequest {
        private DriverStatus status;
    }

    @Getter
    @Setter
    public static class DriverLocationUpdateRequest {
        private Double latitude;
        private Double longitude;
        private Double speed;
        private Double bearing;
        private Double accuracy;
    }

    @Getter
    @Setter
    public static class DriverStatsResponse {
        private Long driverId;
        private String driverName;
        private Integer totalDeliveries;
        private Integer completedDeliveries;
        private Integer todayDeliveries;
        private Double totalEarnings;
        private Double todayEarnings;
        private Double averageRating;
        private Integer onlineHours;
        private LocalDateTime lastActiveAt;
    }

    @Getter
    @Setter
    public static class DriverListResponse {
        private Long id;
        private String name;
        private String vehicleType;
        private String vehicleNumber;
        private DriverStatus status;
        private Double currentLatitude;
        private Double currentLongitude;
        private Integer activeDeliveries;
        private LocalDateTime lastLocationUpdate;
    }
}