package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ESGMetricsDetailDto {

    // E (환경) 세부 지표
    private EnvironmentMetrics environment;

    // S (사회) 세부 지표
    private SocialMetrics social;

    // G (지배구조) 세부 지표
    private GovernanceMetrics governance;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnvironmentMetrics {
        // 공간 활용 효율성 (%)
        private Double spaceUtilization;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SocialMetrics {
        // 고객 만족도 (리뷰 평점 평균, 1-5점)
        private Double customerSatisfaction;

        // 클레임 해결률 (%)
        private Double claimResolutionRate;

        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GovernanceMetrics {
        // 시스템 안정성 (Uptime %)
        private Double systemUptime;

        // 활동 로그 기록률 (%)
        private Double activityLogRate;

        private String description;
    }
}
