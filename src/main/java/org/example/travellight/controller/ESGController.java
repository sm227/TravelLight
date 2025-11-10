package org.example.travellight.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.CommonApiResponse;
import org.example.travellight.dto.ESGScoreDto;
import org.example.travellight.dto.ESGTrendDto;
import org.example.travellight.service.ESGMonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/esg")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin ESG", description = "관리자 ESG 모니터링 API")
@PreAuthorize("hasRole('ADMIN')")
public class ESGController {

    private final ESGMonitoringService esgMonitoringService;

    /**
     * 현재 ESG 점수 조회
     *
     * @return 현재 ESG 점수
     */
    @GetMapping("/current")
    @Operation(summary = "현재 ESG 점수 조회", description = "오늘 날짜의 ESG 점수를 조회합니다. 데이터가 없으면 자동으로 계산합니다.")
    public ResponseEntity<CommonApiResponse<ESGScoreDto>> getCurrentESGScores() {
        try {
            log.info("현재 ESG 점수 조회 요청");
            ESGScoreDto scores = esgMonitoringService.getCurrentESGScores();
            return ResponseEntity.ok(CommonApiResponse.success("ESG 점수 조회 성공", scores));
        } catch (Exception e) {
            log.error("ESG 점수 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("ESG 점수 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * ESG 트렌드 조회
     *
     * @param days 조회할 일 수 (기본 30일)
     * @return ESG 트렌드 데이터
     */
    @GetMapping("/trends")
    @Operation(summary = "ESG 트렌드 조회", description = "최근 N일간의 ESG 점수 트렌드를 조회합니다.")
    public ResponseEntity<CommonApiResponse<ESGTrendDto>> getESGTrends(
            @Parameter(description = "조회할 일 수", example = "30")
            @RequestParam(defaultValue = "30") int days) {
        try {
            log.info("ESG 트렌드 조회 요청: {}일", days);

            if (days <= 0 || days > 365) {
                return ResponseEntity.badRequest()
                        .body(CommonApiResponse.error("조회 기간은 1~365일 사이여야 합니다."));
            }

            ESGTrendDto trend = esgMonitoringService.getESGTrends(days);
            return ResponseEntity.ok(CommonApiResponse.success("ESG 트렌드 조회 성공", trend));
        } catch (Exception e) {
            log.error("ESG 트렌드 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("ESG 트렌드 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * ESG 메트릭 수동 계산 및 저장
     *
     * @return 계산된 ESG 점수
     */
    @PostMapping("/calculate")
    @Operation(summary = "ESG 메트릭 수동 계산", description = "관리자가 수동으로 오늘 날짜의 ESG 메트릭을 계산하고 저장합니다. 기존 데이터는 덮어씁니다.")
    public ResponseEntity<CommonApiResponse<ESGScoreDto>> calculateESGMetrics() {
        try {
            log.info("ESG 메트릭 수동 계산 요청");
            ESGScoreDto scores = esgMonitoringService.calculateAndSave();
            return ResponseEntity.ok(CommonApiResponse.success("ESG 메트릭 계산 및 저장 완료", scores));
        } catch (Exception e) {
            log.error("ESG 메트릭 계산 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("ESG 메트릭 계산 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}
