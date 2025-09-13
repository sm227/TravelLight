package org.example.travellight.entity;

public enum PhotoType {
    PICKUP("픽업 증빙"),
    DELIVERY("배달 완료 증빙"),
    DAMAGE("손상 증빙"),
    OTHER("기타");

    private final String displayName;

    PhotoType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}