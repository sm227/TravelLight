package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.ESGMetricsDetailDto;
import org.example.travellight.dto.ESGScoreDto;
import org.example.travellight.dto.ESGTrendDto;
import org.example.travellight.entity.ESGMetrics;
import org.example.travellight.repository.ESGMetricsRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ESGMonitoringService {

    private final ESGMetricsRepository esgMetricsRepository;
    private final ESGCalculationService esgCalculationService;

    /**
     * 현재 ESG 점수 조회
     * - 오늘 날짜의 메트릭이 없으면 자동으로 계산
     */
    @Transactional
    public ESGScoreDto getCurrentESGScores() {
        LocalDate today = LocalDate.now();

        // 오늘 날짜의 메트릭 조회
        ESGMetrics metrics = esgMetricsRepository.findByCalculationDate(today)
                .orElseGet(() -> {
                    // 없으면 새로 계산하고 저장
                    log.info("오늘({}) ESG 메트릭이 없어 새로 계산합니다.", today);
                    ESGMetrics newMetrics = esgCalculationService.calculateAllMetrics(today);
                    return esgMetricsRepository.save(newMetrics);
                });

        return convertToScoreDto(metrics);
    }

    /**
     * ESG 트렌드 조회 (최근 N일)
     *
     * @param days 조회할 일 수 (기본 30일)
     * @return ESG 트렌드 데이터
     */
    @Transactional(readOnly = true)
    public ESGTrendDto getESGTrends(int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);

        List<ESGMetrics> metricsList = esgMetricsRepository.findByDateRange(startDate, endDate);

        if (metricsList.isEmpty()) {
            log.warn("{}일간의 ESG 메트릭 데이터가 없습니다.", days);
            return ESGTrendDto.builder()
                    .trendData(List.of())
                    .statistics(ESGTrendDto.TrendStatistics.builder()
                            .averageTotalScore(0.0)
                            .averageEnvironmentScore(0.0)
                            .averageSocialScore(0.0)
                            .averageGovernanceScore(0.0)
                            .period(String.format("%s ~ %s", startDate, endDate))
                            .build())
                    .build();
        }

        // 트렌드 데이터 변환
        List<ESGTrendDto.TrendDataPoint> trendData = metricsList.stream()
                .map(m -> ESGTrendDto.TrendDataPoint.builder()
                        .date(m.getCalculationDate().toString())
                        .totalScore(m.getTotalScore())
                        .environmentScore(m.getEnvironmentScore())
                        .socialScore(m.getSocialScore())
                        .governanceScore(m.getGovernanceScore())
                        .build())
                .collect(Collectors.toList());

        // 통계 계산
        double avgTotal = metricsList.stream()
                .mapToDouble(ESGMetrics::getTotalScore)
                .average()
                .orElse(0.0);

        double avgEnv = metricsList.stream()
                .mapToDouble(ESGMetrics::getEnvironmentScore)
                .average()
                .orElse(0.0);

        double avgSocial = metricsList.stream()
                .mapToDouble(ESGMetrics::getSocialScore)
                .average()
                .orElse(0.0);

        double avgGov = metricsList.stream()
                .mapToDouble(ESGMetrics::getGovernanceScore)
                .average()
                .orElse(0.0);

        ESGTrendDto.TrendStatistics statistics = ESGTrendDto.TrendStatistics.builder()
                .averageTotalScore(Math.round(avgTotal * 100.0) / 100.0)
                .averageEnvironmentScore(Math.round(avgEnv * 100.0) / 100.0)
                .averageSocialScore(Math.round(avgSocial * 100.0) / 100.0)
                .averageGovernanceScore(Math.round(avgGov * 100.0) / 100.0)
                .period(String.format("%s ~ %s", startDate, endDate))
                .build();

        return ESGTrendDto.builder()
                .trendData(trendData)
                .statistics(statistics)
                .build();
    }

    /**
     * 수동으로 ESG 메트릭 계산 및 저장
     * (관리자가 수동으로 트리거할 수 있음)
     */
    @Transactional
    public ESGScoreDto calculateAndSave() {
        LocalDate today = LocalDate.now();
        log.info("수동 ESG 메트릭 계산 시작: {}", today);

        // 기존 데이터가 있으면 삭제하고 새로 계산
        esgMetricsRepository.findByCalculationDate(today)
                .ifPresent(existing -> {
                    log.info("기존 메트릭 삭제: {}", today);
                    esgMetricsRepository.delete(existing);
                });

        ESGMetrics metrics = esgCalculationService.calculateAllMetrics(today);
        ESGMetrics saved = esgMetricsRepository.save(metrics);

        log.info("ESG 메트릭 저장 완료: {}", today);
        return convertToScoreDto(saved);
    }

    /**
     * 매일 자정에 자동으로 ESG 메트릭 계산 및 저장
     * 스케줄러: 매일 00:05:00에 실행
     */
    @Scheduled(cron = "0 5 0 * * *") // 매일 00:05:00
    @Transactional
    public void scheduledDailyCalculation() {
        try {
            LocalDate today = LocalDate.now();
            log.info("스케줄된 ESG 메트릭 계산 시작: {}", today);

            // 이미 오늘 데이터가 있으면 건너뛰기
            if (esgMetricsRepository.findByCalculationDate(today).isPresent()) {
                log.info("오늘({}) ESG 메트릭이 이미 존재하여 건너뜁니다.", today);
                return;
            }

            ESGMetrics metrics = esgCalculationService.calculateAllMetrics(today);
            esgMetricsRepository.save(metrics);

            log.info("스케줄된 ESG 메트릭 저장 완료: {}", today);
        } catch (Exception e) {
            log.error("스케줄된 ESG 메트릭 계산 중 오류 발생", e);
        }
    }

    /**
     * ESGMetrics 엔티티를 ESGScoreDto로 변환
     */
    private ESGScoreDto convertToScoreDto(ESGMetrics metrics) {
        return ESGScoreDto.builder()
                .totalScore(metrics.getTotalScore())
                .environmentScore(metrics.getEnvironmentScore())
                .socialScore(metrics.getSocialScore())
                .governanceScore(metrics.getGovernanceScore())
                .calculationDate(metrics.getCalculationDate().format(DateTimeFormatter.ISO_LOCAL_DATE))
                .details(ESGMetricsDetailDto.builder()
                        .environment(ESGMetricsDetailDto.EnvironmentMetrics.builder()
                                .spaceUtilization(metrics.getSpaceUtilization())
                                .description("전체 보관함 대비 사용 중인 보관함 비율")
                                .build())
                        .social(ESGMetricsDetailDto.SocialMetrics.builder()
                                .customerSatisfaction(metrics.getCustomerSatisfaction())
                                .claimResolutionRate(metrics.getClaimResolutionRate())
                                .description("고객 만족도 및 클레임 처리 효율성")
                                .build())
                        .governance(ESGMetricsDetailDto.GovernanceMetrics.builder()
                                .systemUptime(metrics.getSystemUptime())
                                .activityLogRate(metrics.getActivityLogRate())
                                .description("시스템 안정성 및 투명성")
                                .build())
                        .build())
                .build();
    }
}
