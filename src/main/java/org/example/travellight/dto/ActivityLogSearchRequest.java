package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 활동 로그 검색 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogSearchRequest {

    /**
     * 사용자 ID (필터)
     */
    private Long userId;

    /**
     * 액션 카테고리 (LOGIN, RESERVATION, PAYMENT, ERROR, PAGE_VIEW)
     */
    private String actionCategory;

    /**
     * 특정 액션 타입
     */
    private String action;

    /**
     * 로그 레벨 (INFO, WARN, ERROR)
     */
    private String level;

    /**
     * 시작 일시
     */
    private LocalDateTime startTime;

    /**
     * 종료 일시
     */
    private LocalDateTime endTime;

    /**
     * 페이지 번호 (0부터 시작)
     */
    @Builder.Default
    private int page = 0;

    /**
     * 페이지 크기
     */
    @Builder.Default
    private int size = 50;
}
