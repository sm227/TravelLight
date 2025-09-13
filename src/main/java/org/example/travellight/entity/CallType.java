package org.example.travellight.entity;

public enum CallType {
    OUTGOING("발신"),
    INCOMING("수신");

    private final String displayName;

    CallType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}