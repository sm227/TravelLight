package org.example.travellight.entity;

public enum Role {
    ADMIN("관리자"),
    USER("일반사용자"),
    PARTNER("파트너 사용자"),
    WAIT("승인대기중");
    
    private final String displayName;
    
    Role(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 