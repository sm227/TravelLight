package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ESGScoreDto {

    // 종합 ESG 점수
    private Double totalScore;

    // E (환경) 점수
    private Double environmentScore;

    // S (사회) 점수
    private Double socialScore;

    // G (지배구조) 점수
    private Double governanceScore;

    // 세부 지표
    private ESGMetricsDetailDto details;

    // 계산 날짜
    private String calculationDate;
}
