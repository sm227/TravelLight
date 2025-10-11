package org.example.travellight.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.ActivityLogDto;
import org.example.travellight.dto.ActivityLogSearchRequest;
import org.example.travellight.dto.CommonApiResponse;
import org.example.travellight.service.ElasticsearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 활동 로그 API 컨트롤러
 * - ERP 회원 상세 페이지에서 사용자 활동 로그 조회
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/activity-logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ActivityLogController {

    private final ElasticsearchService elasticsearchService;

    /**
     * 사용자 활동 로그 조회
     * - 관리자 권한 필요
     *
     * @param userId 사용자 ID
     * @param actionCategory 액션 카테고리 (LOGIN, RESERVATION, PAYMENT, ERROR, PAGE_VIEW)
     * @param action 특정 액션
     * @param level 로그 레벨
     * @param days 최근 며칠간의 로그 (기본값: 30일)
     * @param page 페이지 번호 (기본값: 0)
     * @param size 페이지 크기 (기본값: 50)
     * @return 활동 로그 리스트
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<List<ActivityLogDto>>> getActivityLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String actionCategory,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String level,
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        try {
            log.info("활동 로그 조회 요청: userId={}, category={}, days={}", userId, actionCategory, days);

            // 검색 요청 객체 생성
            ActivityLogSearchRequest searchRequest = ActivityLogSearchRequest.builder()
                    .userId(userId)
                    .actionCategory(actionCategory)
                    .action(action)
                    .level(level)
                    .endTime(LocalDateTime.now())
                    .startTime(LocalDateTime.now().minusDays(days))
                    .page(page)
                    .size(size)
                    .build();

            // Elasticsearch에서 로그 검색
            List<ActivityLogDto> logs = elasticsearchService.searchActivityLogs(searchRequest);

            log.info("활동 로그 조회 완료: {} 건", logs.size());
            return ResponseEntity.ok(CommonApiResponse.success("활동 로그 조회 성공", logs));

        } catch (Exception e) {
            log.error("활동 로그 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("활동 로그 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 특정 사용자의 최근 활동 요약 조회
     *
     * @param userId 사용자 ID
     * @return 최근 활동 로그 (최근 10개)
     */
    @GetMapping("/user/{userId}/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<List<ActivityLogDto>>> getRecentUserActivity(
            @PathVariable Long userId
    ) {
        try {
            log.info("사용자 최근 활동 조회: userId={}", userId);

            ActivityLogSearchRequest searchRequest = ActivityLogSearchRequest.builder()
                    .userId(userId)
                    .endTime(LocalDateTime.now())
                    .startTime(LocalDateTime.now().minusDays(7))
                    .page(0)
                    .size(10)
                    .build();

            List<ActivityLogDto> logs = elasticsearchService.searchActivityLogs(searchRequest);

            log.info("사용자 최근 활동 조회 완료: {} 건", logs.size());
            return ResponseEntity.ok(CommonApiResponse.success("최근 활동 조회 성공", logs));

        } catch (Exception e) {
            log.error("사용자 최근 활동 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("최근 활동 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 특정 사용자의 에러 로그만 조회
     *
     * @param userId 사용자 ID
     * @param days 최근 며칠간의 로그
     * @return 에러 로그 리스트
     */
    @GetMapping("/user/{userId}/errors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<List<ActivityLogDto>>> getUserErrors(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "30") int days
    ) {
        try {
            log.info("사용자 에러 로그 조회: userId={}, days={}", userId, days);

            ActivityLogSearchRequest searchRequest = ActivityLogSearchRequest.builder()
                    .userId(userId)
                    .actionCategory("ERROR")
                    .endTime(LocalDateTime.now())
                    .startTime(LocalDateTime.now().minusDays(days))
                    .page(0)
                    .size(50)
                    .build();

            List<ActivityLogDto> logs = elasticsearchService.searchActivityLogs(searchRequest);

            log.info("사용자 에러 로그 조회 완료: {} 건", logs.size());
            return ResponseEntity.ok(CommonApiResponse.success("에러 로그 조회 성공", logs));

        } catch (Exception e) {
            log.error("사용자 에러 로그 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("에러 로그 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}
