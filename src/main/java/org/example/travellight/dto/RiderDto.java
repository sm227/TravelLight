package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.travellight.entity.DriverStatus;
import org.example.travellight.entity.RiderApplicationStatus;
import org.example.travellight.entity.Role;

import java.time.LocalDateTime;

public class RiderDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiderRegisterRequest {
        private String name;
        private String email;
        private String password;
        private String phoneNumber;
        private String vehicleNumber;
        private String licenseNumber; // 선택 사항
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiderLoginRequest {
        private String email;
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiderLoginResponse {
        // User 정보
        private Long userId;
        private String name;
        private String email;
        private Role role;

        // Driver 정보 (승인된 라이더만)
        private Long driverId;
        private String vehicleNumber;
        private String phoneNumber;
        private DriverStatus driverStatus;

        // JWT 토큰
        private String accessToken;
        private String refreshToken;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiderApplicationResponse {
        private Long id;
        private Long userId;
        private String userName;
        private String userEmail;
        private String phoneNumber;
        private String vehicleNumber;
        private String licenseNumber;
        private RiderApplicationStatus status;
        private String rejectionReason;
        private LocalDateTime approvedAt;
        private LocalDateTime rejectedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RejectRequest {
        private String rejectionReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiderResponse {
        private Long id;
        private Long userId;
        private String userName;
        private String userEmail;
        private String phoneNumber;
        private String vehicleNumber;
        private String licenseNumber;
        private DriverStatus status;
        private Boolean isActive;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiderStats {
        private Long totalRiders;
        private Long onlineRiders;
        private Long offlineRiders;
        private Long inactiveRiders;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStatusRequest {
        private DriverStatus status;
    }
}
