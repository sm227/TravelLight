package org.example.travellight.entity;

import lombok.Getter;

@Getter
public enum InquiryType {
    RESERVATION("예약 및 결제 문의", "reservation"),
    DELIVERY("배송 서비스 문의", "delivery"),
    STORAGE("짐 보관 문의", "storage"),
    ACCOUNT("계정 관리 문의", "account"),
    REFUND("환불 및 취소 문의", "refund"),
    OTHER("기타 문의", "other");
    
    private final String displayName;
    private final String code;
    
    InquiryType(String displayName, String code) {
        this.displayName = displayName;
        this.code = code;
    }
    
    public static InquiryType fromCode(String code) {
        for (InquiryType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid inquiry type code: " + code);
    }
}

