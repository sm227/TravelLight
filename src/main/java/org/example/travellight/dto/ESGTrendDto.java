package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ESGTrendDto {

    // 트렌드 데이터 리스트
    private List<TrendDataPoint> trendData;

    // 통계 정보
    private TrendStatistics statistics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendDataPoint {
        private String date;
        private Double totalScore;
        private Double environmentScore;
        private Double socialScore;
        private Double governanceScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendStatistics {
        private Double averageTotalScore;
        private Double averageEnvironmentScore;
        private Double averageSocialScore;
        private Double averageGovernanceScore;
        private String period;
    }
}
