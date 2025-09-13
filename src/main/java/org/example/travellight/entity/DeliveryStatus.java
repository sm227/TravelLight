package org.example.travellight.entity;

public enum DeliveryStatus {
    PENDING,        // 배달 요청 대기 중
    ASSIGNED,       // 배달원 배정됨
    ACCEPTED,       // 배달 요청 수락됨
    PICKED_UP,      // 물품 수거 완료
    IN_PROGRESS,    // 배송 중 (in_progress로 변경)
    DELIVERED,      // 배달 완료
    CANCELLED       // 배달 취소
} 