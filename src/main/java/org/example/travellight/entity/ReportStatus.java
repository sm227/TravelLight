package org.example.travellight.entity;

public enum ReportStatus {
    PENDING,    // 처리 대기
    APPROVED,   // 신고 승인 (조치 완료)
    REJECTED,   // 신고 거부
    DISMISSED   // 신고 기각
}
