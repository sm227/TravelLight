package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "esg_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ESGMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 계산 날짜
    @Column(name = "calculation_date", nullable = false, unique = true)
    private LocalDate calculationDate;

    // E (환경) 점수 (0-100)
    @Column(name = "environment_score", nullable = false)
    private Double environmentScore;

    // S (사회) 점수 (0-100)
    @Column(name = "social_score", nullable = false)
    private Double socialScore;

    // G (지배구조) 점수 (0-100)
    @Column(name = "governance_score", nullable = false)
    private Double governanceScore;

    // 종합 ESG 점수 (0-100)
    @Column(name = "total_score", nullable = false)
    private Double totalScore;

    // === E (환경) 세부 지표 ===

    // 공간 활용 효율성 (%)
    @Column(name = "space_utilization", nullable = false)
    private Double spaceUtilization;

    // === S (사회) 세부 지표 ===

    // 고객 만족도 (리뷰 평점 평균, 1-5점)
    @Column(name = "customer_satisfaction")
    private Double customerSatisfaction;

    // 클레임 해결률 (%)
    @Column(name = "claim_resolution_rate")
    private Double claimResolutionRate;

    // === G (지배구조) 세부 지표 ===

    // 시스템 안정성 (Uptime %)
    @Column(name = "system_uptime")
    private Double systemUptime;

    // 활동 로그 기록률 (%)
    @Column(name = "activity_log_rate")
    private Double activityLogRate;

    // 생성 시간
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * 종합 ESG 점수 계산 (E, S, G의 평균)
     */
    public void calculateTotalScore() {
        this.totalScore = (environmentScore + socialScore + governanceScore) / 3.0;
    }
}
