package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.travellight.entity.SearchType;

import java.util.List;

/**
 * 통합 검색 결과 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDto {

    /**
     * 검색 결과 타입
     */
    private SearchType type;

    /**
     * 검색 결과 ID
     */
    private Long id;

    /**
     * 검색 결과 주 제목
     */
    private String title;

    /**
     * 검색 결과 부 제목 (추가 정보)
     */
    private String subtitle;

    /**
     * 검색 결과 상태 (예: RESERVED, COMPLETED, APPROVED 등)
     */
    private String status;

    /**
     * 추가 메타 정보 (타입별 특수 정보)
     */
    private String meta;

    /**
     * 상세 페이지 URL
     */
    private String detailUrl;

    /**
     * 통합 검색 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchResponse {
        /**
         * 전체 검색 결과 수
         */
        private int totalCount;

        /**
         * 검색 결과 리스트
         */
        private List<SearchResultDto> results;

        /**
         * 타입별 검색 결과 수
         */
        private TypeCounts typeCounts;
    }

    /**
     * 타입별 검색 결과 수
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TypeCounts {
        private int reservations;
        private int users;
        private int partnerships;
        private int events;
        private int inquiries;
        private int reviews;
        private int faqs;
    }
}
