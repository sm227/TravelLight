package org.example.travellight.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 통합 검색 타입
 */
@Getter
@RequiredArgsConstructor
public enum SearchType {
    RESERVATION("예약"),
    USER("사용자"),
    PARTNERSHIP("제휴점"),
    EVENT("이벤트"),
    INQUIRY("문의"),
    REVIEW("리뷰"),
    FAQ("FAQ");

    private final String label;
}