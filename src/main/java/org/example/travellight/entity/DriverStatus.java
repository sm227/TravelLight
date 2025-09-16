package org.example.travellight.entity;

public enum DriverStatus {
    ONLINE("온라인"),
    OFFLINE("오프라인"),
    BUSY("배달중"),
    BREAK("휴식중");

    private final String displayName;

    DriverStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}