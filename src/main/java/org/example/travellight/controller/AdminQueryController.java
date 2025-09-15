package org.example.travellight.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.service.DatabaseSchemaService;
import org.example.travellight.service.GeminiQueryService;
import org.example.travellight.service.QueryCacheService;
import org.example.travellight.service.QueryExecutorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/query")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AdminQueryController {

    private final GeminiQueryService geminiQueryService;
    private final QueryExecutorService queryExecutorService;
    private final DatabaseSchemaService databaseSchemaService;
    private final QueryCacheService queryCacheService;
    private final ObjectMapper objectMapper;

    @PostMapping("/natural")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> processNaturalQuery(@RequestBody Map<String, String> request) {
        try {
            String naturalQuery = request.get("query");

            if (naturalQuery == null || naturalQuery.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "질문을 입력해주세요."));
            }

            log.info("자연어 질의 요청: {}", naturalQuery);

            // 1. Gemini를 통해 자연어를 SQL로 변환
            String geminiResponse = geminiQueryService.convertNaturalLanguageToSQL(naturalQuery);
            log.info("Gemini 응답: {}", geminiResponse);

            // 2. Gemini 응답 파싱
            JsonNode responseNode = objectMapper.readTree(geminiResponse);

            String sql = responseNode.get("sql").asText();
            String explanation = responseNode.get("explanation").asText();
            String chartType = responseNode.get("chartType").asText();
            String title = responseNode.get("title").asText();

            // 3. SQL 실행 및 결과 반환
            JsonNode result = queryExecutorService.executeQuery(sql, chartType, title, explanation);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("자연어 질의 처리 중 오류 발생", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "질의 처리 중 오류가 발생했습니다: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/schema")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDatabaseSchema() {
        try {
            JsonNode schema = databaseSchemaService.getDatabaseSchema();
            return ResponseEntity.ok(schema);
        } catch (Exception e) {
            log.error("스키마 정보 조회 중 오류 발생", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "스키마 정보를 조회할 수 없습니다: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/sample")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSampleData() {
        try {
            JsonNode sampleData = queryExecutorService.generateSampleData();
            return ResponseEntity.ok(sampleData);
        } catch (Exception e) {
            log.error("샘플 데이터 생성 중 오류 발생", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "샘플 데이터를 생성할 수 없습니다: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/direct-sql")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> executeDirectSQL(@RequestBody Map<String, String> request) {
        try {
            String sql = request.get("sql");
            String title = request.getOrDefault("title", "직접 SQL 실행 결과");
            String chartType = request.getOrDefault("chartType", "table");
            String explanation = request.getOrDefault("explanation", "사용자가 직접 입력한 SQL 쿼리입니다.");

            if (sql == null || sql.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "SQL 쿼리를 입력해주세요."));
            }

            log.info("직접 SQL 실행 요청: {}", sql);

            JsonNode result = queryExecutorService.executeQuery(sql, chartType, title, explanation);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("직접 SQL 실행 중 오류 발생", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "SQL 실행 중 오류가 발생했습니다: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/examples")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getQueryExamples() {
        try {
            Map<String, Object> examples = new HashMap<>();

            examples.put("basicQueries", new String[]{
                "이번달 총 매출은 얼마인가요?",
                "오늘 예약 건수는 몇 건인가요?",
                "지역별 예약 현황을 보여주세요",
                "파트너십 승인 대기 중인 매장은 몇 개인가요?"
            });

            examples.put("advancedQueries", new String[]{
                "최근 7일간 일별 매출 추이를 보여주세요",
                "가방 크기별 예약 분포를 알려주세요",
                "매장별 보관함 이용률을 보여주세요",
                "작년 같은 기간 대비 이번달 매출 증감률은?",
                "평균 예약 금액이 가장 높은 지역은 어디인가요?"
            });

            examples.put("reportQueries", new String[]{
                "월별 신규 고객 수를 보여주세요",
                "리뷰 평점이 4점 이상인 매장들을 알려주세요",
                "배달 완료까지 평균 소요 시간은 얼마인가요?",
                "취소 사유별 통계를 보여주세요"
            });

            return ResponseEntity.ok(Map.of("success", true, "examples", examples));

        } catch (Exception e) {
            log.error("예시 쿼리 조회 중 오류 발생", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "예시 쿼리를 조회할 수 없습니다: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    // 캐시 관리 엔드포인트들
    @GetMapping("/cache/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCacheStats() {
        try {
            QueryCacheService.CacheStats stats = queryCacheService.getDetailedCacheStats();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cacheSize", stats.getCacheSize());
            response.put("totalRequests", stats.getTotalRequests());
            response.put("hits", stats.getHits());
            response.put("misses", stats.getMisses());
            response.put("hitRate", Math.round(stats.getHitRate() * 100.0) / 100.0); // 소수점 2자리

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("캐시 통계 조회 중 오류 발생", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "캐시 통계를 조회할 수 없습니다: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @DeleteMapping("/cache/clear")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> clearCache() {
        try {
            queryCacheService.clearAllCache();
            queryCacheService.resetStats(); // 통계도 초기화
            databaseSchemaService.invalidateSchemaCache();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "모든 캐시와 통계가 초기화되었습니다.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("캐시 삭제 중 오류 발생", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "캐시 삭제 중 오류가 발생했습니다: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @DeleteMapping("/cache/query/{queryHash}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> clearSpecificCache(@PathVariable String queryHash) {
        try {
            queryCacheService.invalidateCache(queryHash);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "지정된 쿼리 캐시가 삭제되었습니다.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("특정 캐시 삭제 중 오류 발생", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "특정 캐시 삭제 중 오류가 발생했습니다: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}