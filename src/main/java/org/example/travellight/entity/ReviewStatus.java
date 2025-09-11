package org.example.travellight.entity;

public enum ReviewStatus {
    ACTIVE,         // 활성화된 리뷰
    HIDDEN,         // 숨겨진 리뷰 (신고 등으로 인해)
    DELETED,        // 삭제된 리뷰
    PENDING         // 승인 대기 중인 리뷰 (필요시 사용)
}
