package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.entity.*;
import org.example.travellight.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ESGCalculationService {

    private final PartnershipRepository partnershipRepository;
    private final ReservationRepository reservationRepository;
    private final ReviewRepository reviewRepository;
    private final ClaimRepository claimRepository;
    private final SystemHealthService systemHealthService;
    private final ElasticsearchService elasticsearchService;

    /**
     * E (환경) - 공간 활용 효율성 계산
     * = (현재 사용 중인 보관함 / 전체 보관함 용량) × 100
     */
    public double calculateSpaceUtilization() {
        try {
            List<Partnership> approvedPartnerships = partnershipRepository.findAll().stream()
                    .filter(p -> "APPROVED".equals(p.getStatus()))
                    .toList();

            if (approvedPartnerships.isEmpty()) {
                log.warn("승인된 제휴점이 없습니다.");
                return 0.0;
            }

            int totalCapacity = 0;
            int totalUsed = 0;

            for (Partnership partnership : approvedPartnerships) {
                int capacity = (partnership.getSmallBagsAvailable() != null ? partnership.getSmallBagsAvailable() : 0)
                        + (partnership.getMediumBagsAvailable() != null ? partnership.getMediumBagsAvailable() : 0)
                        + (partnership.getLargeBagsAvailable() != null ? partnership.getLargeBagsAvailable() : 0);

                // 현재 사용 중인 예약 찾기 (오늘 날짜 기준)
                // placeName과 placeAddress로 매칭
                List<Reservation> activeReservations = reservationRepository.findAll().stream()
                        .filter(r -> partnership.getBusinessName().equals(r.getPlaceName()) &&
                                    partnership.getAddress().equals(r.getPlaceAddress()))
                        .filter(r -> "RESERVED".equals(r.getStatus()) || "IN_STORAGE".equals(r.getStatus()))
                        .filter(r -> {
                            LocalDate today = LocalDate.now();
                            LocalDate storageDate = r.getStorageDate() != null ? r.getStorageDate() : null;
                            LocalDate endDate = r.getStorageEndDate() != null ? r.getStorageEndDate() : null;
                            return storageDate != null && endDate != null &&
                                    !today.isBefore(storageDate) && !today.isAfter(endDate);
                        })
                        .toList();

                int used = activeReservations.stream()
                        .mapToInt(r -> (r.getSmallBags() != null ? r.getSmallBags() : 0)
                                + (r.getMediumBags() != null ? r.getMediumBags() : 0)
                                + (r.getLargeBags() != null ? r.getLargeBags() : 0))
                        .sum();

                totalCapacity += capacity;
                totalUsed += used;
            }

            if (totalCapacity == 0) {
                return 0.0;
            }

            double utilization = (double) totalUsed / totalCapacity * 100.0;
            log.info("공간 활용 효율성 계산 완료: {}/{} = {}%", totalUsed, totalCapacity, String.format("%.2f", utilization));
            return Math.round(utilization * 100.0) / 100.0; // 소수점 2자리
        } catch (Exception e) {
            log.error("공간 활용 효율성 계산 중 오류 발생", e);
            return 0.0;
        }
    }

    /**
     * S1 (사회) - 고객 만족도 계산
     * = 전체 리뷰의 평균 평점 (1-5점)
     */
    public double calculateCustomerSatisfaction() {
        try {
            List<Review> activeReviews = reviewRepository.findAll().stream()
                    .filter(r -> ReviewStatus.ACTIVE.equals(r.getStatus()))
                    .toList();

            if (activeReviews.isEmpty()) {
                log.warn("활성 리뷰가 없습니다.");
                return 0.0;
            }

            double averageRating = activeReviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);

            log.info("고객 만족도 계산 완료: 평균 평점 {}/5.0", String.format("%.2f", averageRating));
            return Math.round(averageRating * 100.0) / 100.0; // 소수점 2자리
        } catch (Exception e) {
            log.error("고객 만족도 계산 중 오류 발생", e);
            return 0.0;
        }
    }

    /**
     * S2 (사회) - 클레임 해결률 계산
     * = (해결된 클레임 / 전체 클레임) × 100
     */
    public double calculateClaimResolutionRate() {
        try {
            List<Claim> allClaims = claimRepository.findAll();

            if (allClaims.isEmpty()) {
                log.info("클레임이 없습니다. 해결률 100%로 설정");
                return 100.0;
            }

            long resolvedCount = allClaims.stream()
                    .filter(c -> ClaimStatus.RESOLVED.equals(c.getStatus()) || ClaimStatus.CLOSED.equals(c.getStatus()))
                    .count();

            double resolutionRate = (double) resolvedCount / allClaims.size() * 100.0;
            log.info("클레임 해결률 계산 완료: {}/{} = {}%", resolvedCount, allClaims.size(), String.format("%.2f", resolutionRate));
            return Math.round(resolutionRate * 100.0) / 100.0; // 소수점 2자리
        } catch (Exception e) {
            log.error("클레임 해결률 계산 중 오류 발생", e);
            return 0.0;
        }
    }

    /**
     * G1 (지배구조) - 시스템 안정성 계산
     * = (시스템 업타임 / 전체 시간) × 100
     *
     * 시스템이 24시간 가동되었다고 가정하면, 99.9% 이상이 정상
     */
    public double calculateSystemUptime() {
        try {
            var systemHealth = systemHealthService.getSystemHealth();
            Long uptimeSeconds = systemHealth.getUptimeSeconds();

            if (uptimeSeconds == null || uptimeSeconds == 0) {
                log.warn("시스템 업타임 정보를 가져올 수 없습니다.");
                return 0.0;
            }

            // 24시간 = 86400초
            // 업타임이 24시간보다 짧으면 해당 비율로, 길면 99.9%로 계산
            double oneDaySeconds = 86400.0;
            double uptimeRate;

            if (uptimeSeconds < oneDaySeconds) {
                // 시스템이 오늘 시작한 경우
                uptimeRate = (uptimeSeconds / oneDaySeconds) * 100.0;
            } else {
                // 시스템이 하루 이상 가동된 경우 - 99.9% 이상으로 가정
                uptimeRate = 99.9;
            }

            log.info("시스템 안정성 계산 완료: Uptime {}초 = {}%", uptimeSeconds, String.format("%.2f", uptimeRate));
            return Math.round(uptimeRate * 100.0) / 100.0; // 소수점 2자리
        } catch (Exception e) {
            log.error("시스템 안정성 계산 중 오류 발생", e);
            return 0.0;
        }
    }

    /**
     * G2 (지배구조) - 활동 로그 기록률 계산
     * = (오늘 기록된 로그 수 / 오늘 발생한 예상 이벤트 수) × 100
     *
     * 간단히 하기 위해: 오늘 발생한 예약 수 대비 로그 기록 수로 계산
     */
    public double calculateActivityLogRate() {
        try {
            // 오늘 생성된 예약 수 (예상 이벤트)
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            LocalDateTime endOfDay = startOfDay.plusDays(1);

            long todayReservations = reservationRepository.findAll().stream()
                    .filter(r -> r.getCreatedAt() != null)
                    .filter(r -> !r.getCreatedAt().isBefore(startOfDay) && r.getCreatedAt().isBefore(endOfDay))
                    .count();

            // Elasticsearch에서 오늘 기록된 로그 수 조회
            long todayLogs = 0;
            try {
                // ElasticsearchService를 통해 오늘 로그 수 조회
                // 실제 구현은 ElasticsearchService에 메서드 추가 필요
                todayLogs = elasticsearchService.countTodayLogs();
            } catch (Exception e) {
                log.debug("Elasticsearch 로그 조회 실패, 기본값 사용: {}", e.getMessage());
                // fallback: 예약 수만큼은 로그가 있다고 가정
                todayLogs = todayReservations;
            }

            if (todayReservations == 0) {
                log.info("오늘 예약이 없습니다. 로그 기록률 100%로 설정");
                return 100.0;
            }

            // 로그는 예약 외에도 다른 활동(로그인, 조회 등)이 있으므로
            // 로그 수가 예약 수보다 많을 수 있음 -> 100% 상한선 설정
            double logRate = Math.min((double) todayLogs / todayReservations * 100.0, 100.0);
            log.info("활동 로그 기록률 계산 완료: {}/{} = {}%", todayLogs, todayReservations, String.format("%.2f", logRate));
            return Math.round(logRate * 100.0) / 100.0; // 소수점 2자리
        } catch (Exception e) {
            log.error("활동 로그 기록률 계산 중 오류 발생", e);
            return 100.0; // 오류 시 100%로 가정
        }
    }

    /**
     * 종합 ESG 점수 계산
     * E, S, G 각각의 점수를 계산하고 평균을 구함
     */
    @Transactional
    public ESGMetrics calculateAllMetrics(LocalDate calculationDate) {
        log.info("ESG 메트릭 계산 시작: {}", calculationDate);

        // E (환경) 지표 계산
        double spaceUtilization = calculateSpaceUtilization();
        double environmentScore = spaceUtilization; // E 점수 = 공간 활용률

        // S (사회) 지표 계산
        double customerSatisfaction = calculateCustomerSatisfaction();
        double claimResolutionRate = calculateClaimResolutionRate();
        // S 점수 = (고객 만족도(1-5) / 5 * 100 + 클레임 해결률) / 2
        double socialScore = ((customerSatisfaction / 5.0 * 100.0) + claimResolutionRate) / 2.0;

        // G (지배구조) 지표 계산
        double systemUptime = calculateSystemUptime();
        double activityLogRate = calculateActivityLogRate();
        double governanceScore = (systemUptime + activityLogRate) / 2.0;

        // ESGMetrics 엔티티 생성
        ESGMetrics metrics = ESGMetrics.builder()
                .calculationDate(calculationDate)
                .environmentScore(Math.round(environmentScore * 100.0) / 100.0)
                .socialScore(Math.round(socialScore * 100.0) / 100.0)
                .governanceScore(Math.round(governanceScore * 100.0) / 100.0)
                .spaceUtilization(spaceUtilization)
                .customerSatisfaction(customerSatisfaction)
                .claimResolutionRate(claimResolutionRate)
                .systemUptime(systemUptime)
                .activityLogRate(activityLogRate)
                .build();

        // 종합 점수 계산
        metrics.calculateTotalScore();

        log.info("ESG 메트릭 계산 완료 - E: {}, S: {}, G: {}, Total: {}",
                metrics.getEnvironmentScore(),
                metrics.getSocialScore(),
                metrics.getGovernanceScore(),
                metrics.getTotalScore());

        return metrics;
    }
}
