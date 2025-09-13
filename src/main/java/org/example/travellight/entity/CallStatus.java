package org.example.travellight.entity;

public enum CallStatus {
    INITIATED("발신 시도"),
    RINGING("벨울림"),
    ANSWERED("응답"),
    COMPLETED("통화 완료"),
    BUSY("통화중"),
    NO_ANSWER("응답 없음"),
    FAILED("통화 실패");

    private final String displayName;

    CallStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}