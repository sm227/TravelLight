package org.example.travellight.entity;

import lombok.Getter;

@Getter
public enum FaqCategory {
    ALL("전체", "all"),
    RESERVATION("예약 및 결제", "reservation"),
    DELIVERY("배송 서비스", "delivery"),
    STORAGE("짐 보관", "storage"),
    ACCOUNT("계정 관리", "account"),
    REFUND("환불 및 취소", "refund");
    
    private final String displayName;
    private final String code;
    
    FaqCategory(String displayName, String code) {
        this.displayName = displayName;
        this.code = code;
    }
    
    public static FaqCategory fromCode(String code) {
        for (FaqCategory category : values()) {
            if (category.code.equals(code)) {
                return category;
            }
        }
        throw new IllegalArgumentException("Invalid FAQ category code: " + code);
    }
}


