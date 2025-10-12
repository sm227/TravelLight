package org.example.travellight.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.RangeQuery;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.json.JsonData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.ActivityLogDto;
import org.example.travellight.dto.ActivityLogSearchRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Elasticsearch 로그 조회 서비스
 * - ELK 스택에서 사용자 활동 로그를 검색하고 조회
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ElasticsearchService {

    private final ElasticsearchClient elasticsearchClient;

    private static final String INDEX_PATTERN = "travellight-logs-*";
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    /**
     * 사용자 활동 로그 검색
     *
     * @param searchRequest 검색 조건
     * @return 활동 로그 리스트
     */
    public List<ActivityLogDto> searchActivityLogs(ActivityLogSearchRequest searchRequest) {
        try {
            // 쿼리 빌드
            BoolQuery.Builder boolQuery = new BoolQuery.Builder();

            // 필수: action 필드가 존재하는 로그만 조회 (활동 로그만)
            boolQuery.must(Query.of(q -> q
                    .exists(e -> e.field("action"))
            ));

            // 사용자 ID 필터
            if (searchRequest.getUserId() != null) {
                boolQuery.must(Query.of(q -> q
                        .term(t -> t
                                .field("userId")
                                .value(searchRequest.getUserId().toString())
                        )
                ));
            }

            // 액션 카테고리 필터
            if (searchRequest.getActionCategory() != null) {
                boolQuery.must(Query.of(q -> q
                        .term(t -> t
                                .field("actionCategory.keyword")
                                .value(searchRequest.getActionCategory())
                        )
                ));
            }

            // 특정 액션 필터
            if (searchRequest.getAction() != null) {
                boolQuery.must(Query.of(q -> q
                        .term(t -> t
                                .field("action.keyword")
                                .value(searchRequest.getAction())
                        )
                ));
            }

            // 로그 레벨 필터
            if (searchRequest.getLevel() != null) {
                boolQuery.must(Query.of(q -> q
                        .term(t -> t
                                .field("level.keyword")
                                .value(searchRequest.getLevel())
                        )
                ));
            }

            // 시간 범위 필터
            if (searchRequest.getStartTime() != null || searchRequest.getEndTime() != null) {
                RangeQuery.Builder rangeQuery = new RangeQuery.Builder().field("@timestamp");

                if (searchRequest.getStartTime() != null) {
                    rangeQuery.gte(JsonData.of(searchRequest.getStartTime().format(ISO_FORMATTER)));
                }
                if (searchRequest.getEndTime() != null) {
                    rangeQuery.lte(JsonData.of(searchRequest.getEndTime().format(ISO_FORMATTER)));
                }

                boolQuery.must(Query.of(q -> q.range(rangeQuery.build())));
            }

            // Elasticsearch 검색 요청
            SearchRequest searchRequestEs = SearchRequest.of(s -> s
                    .index(INDEX_PATTERN)
                    .query(q -> q.bool(boolQuery.build()))
                    .sort(sort -> sort
                            .field(f -> f
                                    .field("@timestamp")
                                    .order(SortOrder.Desc)
                            )
                    )
                    .from(searchRequest.getPage() * searchRequest.getSize())
                    .size(searchRequest.getSize())
            );

            // 검색 실행
            SearchResponse<Map> response = elasticsearchClient.search(searchRequestEs, Map.class);

            // 결과 변환
            List<ActivityLogDto> logs = new ArrayList<>();
            for (Hit<Map> hit : response.hits().hits()) {
                Map<String, Object> source = hit.source();
                if (source != null) {
                    logs.add(convertToActivityLogDto(source));
                }
            }

            log.info("Elasticsearch 로그 검색 완료: {} 건", logs.size());
            return logs;

        } catch (Exception e) {
            log.error("Elasticsearch 로그 검색 중 오류 발생", e);
            throw new RuntimeException("로그 검색 중 오류가 발생했습니다", e);
        }
    }

    /**
     * Elasticsearch 문서를 ActivityLogDto로 변환
     */
    private ActivityLogDto convertToActivityLogDto(Map<String, Object> source) {
        ActivityLogDto.ActivityLogDtoBuilder builder = ActivityLogDto.builder();

        // 타임스탬프 파싱
        String timestamp = getStringValue(source, "@timestamp");
        if (timestamp != null) {
            builder.timestamp(LocalDateTime.parse(timestamp, ISO_FORMATTER));
        }

        // 기본 필드
        builder.action(getStringValue(source, "action"))
                .actionCategory(getStringValue(source, "actionCategory"))
                .level(getStringValue(source, "level"))
                .message(getStringValue(source, "message"))
                .httpMethod(getStringValue(source, "httpMethod"))
                .requestUri(getStringValue(source, "requestUri"));

        // 사용자 정보
        Object userIdObj = source.get("userId");
        if (userIdObj != null) {
            builder.userId(Long.parseLong(userIdObj.toString()));
        }
        builder.userName(getStringValue(source, "userName"))
                .userEmail(getStringValue(source, "email"));

        // 클라이언트 정보
        builder.clientIp(getStringValue(source, "clientIp"));

        // 에러 정보
        builder.httpStatus(getStringValue(source, "httpStatus"))
                .errorType(getStringValue(source, "errorType"));

        // 세부 정보 구성
        StringBuilder details = new StringBuilder();
        if (source.get("amount") != null) {
            details.append("금액: ").append(source.get("amount")).append(" ");
        }
        if (source.get("placeName") != null) {
            details.append("장소: ").append(getStringValue(source, "placeName")).append(" ");
        }
        if (source.get("paymentId") != null) {
            details.append("결제ID: ").append(getStringValue(source, "paymentId")).append(" ");
        }
        if (source.get("paymentMethod") != null) {
            details.append("결제수단: ").append(getStringValue(source, "paymentMethod")).append(" ");
        }
        if (source.get("errorMessage") != null) {
            details.append("에러: ").append(getStringValue(source, "errorMessage")).append(" ");
        }
        if (source.get("cancelReason") != null) {
            details.append("취소사유: ").append(getStringValue(source, "cancelReason")).append(" ");
        }

        if (details.length() > 0) {
            builder.details(details.toString().trim());
        }

        return builder.build();
    }

    /**
     * Map에서 안전하게 String 값을 추출하는 헬퍼 메서드
     * - 값이 List인 경우 첫 번째 요소를 반환
     * - 값이 null이거나 빈 문자열인 경우 null 반환
     */
    private String getStringValue(Map<String, Object> source, String key) {
        Object value = source.get(key);
        if (value == null) {
            return null;
        }

        // List인 경우 첫 번째 요소 반환
        if (value instanceof List) {
            List<?> list = (List<?>) value;
            if (list.isEmpty()) {
                return null;
            }
            Object firstItem = list.get(0);
            return firstItem != null ? firstItem.toString() : null;
        }

        // String으로 변환
        String strValue = value.toString();
        return strValue.isEmpty() ? null : strValue;
    }
}
