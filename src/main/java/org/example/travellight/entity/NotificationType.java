package org.example.travellight.entity;

public enum NotificationType {
    DELIVERY_ASSIGNED("배달 배정"),
    DELIVERY_STATUS_UPDATE("배달 상태 업데이트"),
    PICKUP_COMPLETED("픽업 완료"),
    DELIVERY_COMPLETED("배달 완료"),
    CUSTOMER_CALL("고객 연락"),
    SYSTEM("시스템"),
    PROMOTION("프로모션"),
    EMERGENCY("긴급");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}