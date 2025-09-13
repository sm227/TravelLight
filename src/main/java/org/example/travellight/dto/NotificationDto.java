package org.example.travellight.dto;

import lombok.Getter;
import lombok.Setter;
import org.example.travellight.entity.NotificationStatus;
import org.example.travellight.entity.NotificationType;
import java.time.LocalDateTime;
import java.util.List;

public class NotificationDto {

    @Getter
    @Setter
    public static class NotificationCreateRequest {
        private Long userId;
        private Long driverId;
        private String title;
        private String message;
        private NotificationType type;
        private Long deliveryId;
        private String actionUrl;
    }

    @Getter
    @Setter
    public static class PushNotificationRequest {
        private List<Long> userIds;
        private List<Long> driverIds;
        private String title;
        private String message;
        private NotificationType type;
        private String actionUrl;
        private Boolean sendToAll; // 모든 사용자에게 전송
    }

    @Getter
    @Setter
    public static class NotificationResponse {
        private Long id;
        private String title;
        private String message;
        private NotificationType type;
        private NotificationStatus status;
        private Long deliveryId;
        private String actionUrl;
        private LocalDateTime createdAt;
        private LocalDateTime readAt;
        private LocalDateTime sentAt;
        private Boolean isRead;
    }

    @Getter
    @Setter
    public static class NotificationListResponse {
        private List<NotificationResponse> notifications;
        private Integer totalCount;
        private Integer unreadCount;
        private Integer page;
        private Integer pageSize;
        private Boolean hasNext;
    }

    @Getter
    @Setter
    public static class NotificationMarkReadRequest {
        private List<Long> notificationIds;
    }

    @Getter
    @Setter
    public static class NotificationStatsResponse {
        private Integer totalNotifications;
        private Integer unreadNotifications;
        private Integer sentNotifications;
        private Integer failedNotifications;
        private Double deliveryRate; // percentage
    }
}