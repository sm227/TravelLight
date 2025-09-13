package org.example.travellight.entity;

public enum NotificationStatus {
    PENDING("대기중"),
    SENT("전송됨"),
    READ("읽음"),
    FAILED("전송 실패");

    private final String displayName;

    NotificationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}