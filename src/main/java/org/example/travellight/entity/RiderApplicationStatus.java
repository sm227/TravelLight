package org.example.travellight.entity;

public enum RiderApplicationStatus {
    PENDING("대기중"),
    APPROVED("승인됨"),
    REJECTED("거절됨");

    private final String displayName;

    RiderApplicationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
