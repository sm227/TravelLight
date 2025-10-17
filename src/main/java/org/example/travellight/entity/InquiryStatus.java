package org.example.travellight.entity;

import lombok.Getter;

@Getter
public enum InquiryStatus {
    PENDING("답변 대기", "pending"),
    ANSWERED("답변 완료", "answered"),
    CLOSED("문의 종료", "closed");
    
    private final String displayName;
    private final String code;
    
    InquiryStatus(String displayName, String code) {
        this.displayName = displayName;
        this.code = code;
    }
}





