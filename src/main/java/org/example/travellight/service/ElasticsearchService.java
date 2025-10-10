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

            // 사용자 ID 필터
            if (searchRequest.getUserId() != null) {
                boolQuery.must(Query.of(q -> q
                        .term(t -> t
                                .field("mdc_userId")
                                .value(searchRequest.getUserId().toString())
                        )
                ));
            }

            // 액션 카테고리 필터
            if (searchRequest.getActionCategory() != null) {
                boolQuery.must(Query.of(q -> q
                        .term(t -> t
                                .field("action_category.keyword")
                                .value(searchRequest.getActionCategory())
                        )
                ));
            }

            // 특정 액션 필터
            if (searchRequest.getAction() != null) {
                boolQuery.must(Query.of(q -> q
                        .term(t -> t
                                .field("mdc_action.keyword")
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
        String timestamp = (String) source.get("@timestamp");
        if (timestamp != null) {
            builder.timestamp(LocalDateTime.parse(timestamp, ISO_FORMATTER));
        }

        // 기본 필드
        builder.action((String) source.get("mdc_action"))
                .actionCategory((String) source.get("action_category"))
                .level((String) source.get("level"))
                .message((String) source.get("message"))
                .httpMethod((String) source.get("mdc_httpMethod"))
                .requestUri((String) source.get("mdc_requestUri"));

        // 사용자 정보
        Object userIdObj = source.get("mdc_userId");
        if (userIdObj != null) {
            builder.userId(Long.parseLong(userIdObj.toString()));
        }
        builder.userName((String) source.get("mdc_userName"))
                .userEmail((String) source.get("mdc_userEmail"));

        // 클라이언트 정보
        builder.clientIp((String) source.get("mdc_clientIp"));

        // 에러 정보
        builder.httpStatus((String) source.get("mdc_httpStatus"))
                .errorType((String) source.get("mdc_errorType"));

        // 세부 정보 구성
        StringBuilder details = new StringBuilder();
        if (source.get("mdc_amount") != null) {
            details.append("금액: ").append(source.get("mdc_amount")).append(" ");
        }
        if (source.get("mdc_placeName") != null) {
            details.append("장소: ").append(source.get("mdc_placeName")).append(" ");
        }
        if (source.get("mdc_paymentId") != null) {
            details.append("결제ID: ").append(source.get("mdc_paymentId")).append(" ");
        }
        if (source.get("mdc_paymentMethod") != null) {
            details.append("결제수단: ").append(source.get("mdc_paymentMethod")).append(" ");
        }
        if (source.get("mdc_errorMessage") != null) {
            details.append("에러: ").append(source.get("mdc_errorMessage")).append(" ");
        }
        if (source.get("mdc_cancelReason") != null) {
            details.append("취소사유: ").append(source.get("mdc_cancelReason")).append(" ");
        }

        if (details.length() > 0) {
            builder.details(details.toString().trim());
        }

        return builder.build();
    }
}
