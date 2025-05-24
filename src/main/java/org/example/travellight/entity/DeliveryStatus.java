package org.example.travellight.entity;

public enum DeliveryStatus {
    PENDING,        // 배달 요청 대기 중
    ACCEPTED,       // 배달 요청 수락됨
    PICKED_UP,      // 물품 수거 완료
    IN_TRANSIT,     // 배송 중
    DELIVERED,      // 배달 완료
    CANCELLED       // 배달 취소
} 