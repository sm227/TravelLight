package org.example.travellight.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiQueryService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.model.name:gemini-2.5-flash}")
    private String modelName;

    private final DatabaseSchemaService databaseSchemaService;
    private final QueryCacheService queryCacheService;

    public String convertNaturalLanguageToSQL(String naturalQuery) {
        // 입력 유효성 검증
        if (naturalQuery == null || naturalQuery.trim().isEmpty()) {
            throw new IllegalArgumentException("질문을 입력해주세요.");
        }

        if (naturalQuery.length() > 1000) {
            throw new IllegalArgumentException("질문이 너무 깁니다. 1000자 이내로 입력해주세요.");
        }

        // 캐시에서 먼저 확인
        try {
            Optional<String> cachedResult = queryCacheService.getCachedQuery(naturalQuery);
            if (cachedResult.isPresent()) {
                log.info("쿼리 캐시 히트: {}", naturalQuery);
                return cachedResult.get();
            }
        } catch (Exception e) {
            log.warn("캐시 조회 중 오류 발생, API 호출로 진행: {}", e.getMessage());
        }

        // API 키 확인 (환경변수 GOOGLE_API_KEY 체크)
        String googleApiKey = System.getenv("GOOGLE_API_KEY");
        if (googleApiKey == null || googleApiKey.isEmpty()) {
            log.error("GOOGLE_API_KEY 환경변수가 설정되지 않았습니다.");
            return createErrorResponse("Gemini API 키가 설정되지 않았습니다. GOOGLE_API_KEY 환경변수를 설정해주세요.");
        }

        int retryCount = 0;
        int maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                // Gemini API 클라이언트 생성
                // 환경변수 GOOGLE_API_KEY에서 자동으로 API 키를 감지
                Client client = new Client();

                String systemPrompt = buildSystemPrompt();
                String fullPrompt = systemPrompt + "\n\n" + String.format("""
                    사용자 질문: "%s"

                    위 질문을 PostgreSQL 쿼리로 변환해주세요.

                    중요: 반드시 순수 JSON 형태로만 응답해주세요. 마크다운 코드 블록(```)을 사용하지 마세요.

                    응답 형식:
                    {
                      "sql": "SELECT ... FROM ...",
                      "explanation": "이 쿼리는 ...",
                      "chartType": "bar|line|pie|table",
                      "title": "결과 제목"
                    }

                    주의사항:
                    - 반드시 유효한 PostgreSQL 문법을 사용하세요
                    - JOIN이 필요한 경우 적절한 관계를 사용하세요
                    - 날짜 관련 쿼리는 현재 날짜를 기준으로 하세요
                    - 집계 함수 사용 시 적절한 GROUP BY를 포함하세요
                    - 보안상 위험한 쿼리(DELETE, UPDATE, DROP 등)는 사용하지 마세요
                    - 테이블명은 정확히 스키마에 있는 이름을 사용하세요
                    """, naturalQuery);

                GenerateContentResponse response = client.models.generateContent(
                    modelName,
                    fullPrompt,
                    null
                );
                String result = response.text();
                log.info("Gemini 응답 (시도 {}): {}", retryCount + 1, result);

                // 마크다운 코드 블록에서 JSON 추출
                String cleanedResult = extractJsonFromMarkdown(result);

                if (cleanedResult != null && !cleanedResult.isEmpty()) {
                    // 성공한 결과를 캐시에 저장
                    try {
                        queryCacheService.cacheQuery(naturalQuery, cleanedResult);
                    } catch (Exception cacheException) {
                        log.warn("캐시 저장 중 오류 발생: {}", cacheException.getMessage());
                    }

                    return cleanedResult;
                } else {
                    log.warn("Gemini가 올바른 JSON 형태로 응답하지 않음: {}", result);
                    if (retryCount == maxRetries - 1) {
                        return createErrorResponse("AI가 올바른 형태로 응답하지 않았습니다. 다른 질문을 시도해보세요.");
                    }
                }

            } catch (Exception e) {
                log.error("Gemini API 호출 중 오류 발생 (시도 {}): ", retryCount + 1, e);

                if (retryCount == maxRetries - 1) {
                    return createErrorResponse("AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.");
                }

                // 재시도 전 잠시 대기
                try {
                    Thread.sleep(1000 * (retryCount + 1));
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return createErrorResponse("요청이 중단되었습니다.");
                }
            }

            retryCount++;
        }

        return createErrorResponse("여러 번 시도했지만 실패했습니다. 잠시 후 다시 시도해주세요.");
    }

    private String extractJsonFromMarkdown(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }

        String trimmed = text.trim();

        // ```json 코드 블록에서 JSON 추출
        if (trimmed.startsWith("```json") && trimmed.endsWith("```")) {
            String json = trimmed.substring(7, trimmed.length() - 3).trim();
            log.debug("마크다운 코드 블록에서 JSON 추출: {}", json);
            return json;
        }

        // ``` 코드 블록에서 JSON 추출 (json 키워드 없이)
        if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
            String content = trimmed.substring(3, trimmed.length() - 3).trim();
            if (content.startsWith("{") && content.endsWith("}")) {
                log.debug("일반 코드 블록에서 JSON 추출: {}", content);
                return content;
            }
        }

        // 순수 JSON인지 확인
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            log.debug("순수 JSON 사용: {}", trimmed);
            return trimmed;
        }

        log.warn("JSON을 추출할 수 없는 응답 형태: {}", text);
        return null;
    }

    private String createErrorResponse(String errorMessage) {
        return String.format("""
            {
              "sql": "SELECT COUNT(*) FROM reservations WHERE 1=0",
              "explanation": "%s",
              "chartType": "table",
              "title": "오류 발생",
              "error": true
            }
            """, errorMessage);
    }

    private String buildSystemPrompt() {
        String schemaInfo = databaseSchemaService.getSchemaForPrompt();

        return String.format("""
            당신은 TravelLight 여행 짐 보관 서비스의 데이터 분석 전문가입니다.
            사용자의 자연어 질문을 PostgreSQL 쿼리로 변환하는 역할을 합니다.

            %s

            규칙:
            1. 항상 JSON 형태로 응답하세요
            2. SQL은 반드시 SELECT문만 사용하세요 (INSERT, UPDATE, DELETE 금지)
            3. 날짜 비교 시 CURRENT_DATE, CURRENT_TIMESTAMP 등을 활용하세요
            4. 적절한 chartType을 선택하세요:
               - bar: 카테고리별 수치 비교
               - line: 시간 흐름에 따른 변화
               - pie: 전체 대비 비율
               - table: 상세 데이터 나열
            5. 한국어로 설명을 작성하세요
            6. 중요: 반드시 실제 데이터베이스 컬럼명(DB:로 표시된 이름)을 사용하세요! JPA 엔티티 필드명이 아닌 snake_case DB 컬럼명을 사용해야 합니다.

            예시 변환:
            - "이번달 매출" → SELECT SUM(total_price) FROM reservations WHERE EXTRACT(month FROM created_at) = EXTRACT(month FROM CURRENT_DATE)
            - "지역별 예약 현황" → SELECT place_name, COUNT(*) FROM reservations GROUP BY place_name
            - "파트너 승인 대기" → SELECT business_name FROM partnerships WHERE status = 'PENDING'
            """, schemaInfo);
    }
}