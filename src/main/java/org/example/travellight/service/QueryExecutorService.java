package org.example.travellight.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class QueryExecutorService {

    private final EntityManager entityManager;
    private final ObjectMapper objectMapper;

    // SQL 인젝션 방지를 위한 허용된 키워드 패턴
    private static final Pattern ALLOWED_SQL_PATTERN = Pattern.compile(
        "^\\s*SELECT\\s+.*\\s+FROM\\s+.*$",
        Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    // 금지된 키워드들 (관리자용으로 완화) - 단어 경계 사용으로 EXTRACT 등 허용
    private static final Pattern FORBIDDEN_KEYWORDS = Pattern.compile(
        ".*(\\bDROP\\b|\\bDELETE\\b|\\bINSERT\\b|\\bUPDATE\\b|\\bALTER\\b|\\bCREATE\\b|\\bTRUNCATE\\b|\\bEXEC\\b|\\bEXECUTE\\b|;\\s*SELECT|;\\s*DROP|;\\s*DELETE|;\\s*UPDATE|;\\s*INSERT).*",
        Pattern.CASE_INSENSITIVE
    );

    // 관리자 전용이므로 테이블 제한 해제
    // private static final Set<String> ALLOWED_TABLES = Set.of(...); - 제거됨

    @Transactional(readOnly = true)
    public JsonNode executeQuery(String sql, String chartType, String title, String explanation) {
        try {
            // SQL 안전성 검증
            if (!isValidSQL(sql)) {
                throw new IllegalArgumentException("허용되지 않은 SQL 쿼리입니다.");
            }

            log.info("실행할 SQL: {}", sql);

            Query query = entityManager.createNativeQuery(sql);
            List<?> resultList = query.getResultList();

            // 결과를 JSON으로 변환
            ObjectNode resultNode = objectMapper.createObjectNode();
            resultNode.put("title", title);
            resultNode.put("chartType", chartType);
            resultNode.put("explanation", explanation);
            resultNode.put("sql", sql);
            resultNode.put("success", true);

            ArrayNode dataArray = objectMapper.createArrayNode();

            if (resultList.isEmpty()) {
                resultNode.set("data", dataArray);
                resultNode.put("message", "조회된 데이터가 없습니다.");
                return resultNode;
            }

            // 첫 번째 행으로 컬럼 구조 파악
            Object firstRow = resultList.get(0);
            ArrayNode columnsArray = objectMapper.createArrayNode();

            if (firstRow instanceof Object[]) {
                // 다중 컬럼 결과
                Object[] firstRowArray = (Object[]) firstRow;

                // 컬럼명 추출 (실제로는 쿼리 파싱이나 메타데이터에서 가져와야 하지만, 간단히 처리)
                for (int i = 0; i < firstRowArray.length; i++) {
                    columnsArray.add("column_" + i);
                }

                // 데이터 변환
                for (Object row : resultList) {
                    Object[] rowArray = (Object[]) row;
                    ObjectNode rowNode = objectMapper.createObjectNode();

                    for (int i = 0; i < rowArray.length; i++) {
                        Object value = rowArray[i];
                        String columnName = "column_" + i;
                        addValueToNode(rowNode, columnName, value);
                    }
                    dataArray.add(rowNode);
                }
            } else {
                // 단일 컬럼 결과
                columnsArray.add("result");

                for (Object row : resultList) {
                    ObjectNode rowNode = objectMapper.createObjectNode();
                    addValueToNode(rowNode, "result", row);
                    dataArray.add(rowNode);
                }
            }

            resultNode.set("columns", columnsArray);
            resultNode.set("data", dataArray);
            resultNode.put("rowCount", resultList.size());

            log.info("쿼리 실행 완료. 결과 행 수: {}", resultList.size());
            return resultNode;

        } catch (Exception e) {
            log.error("쿼리 실행 중 오류 발생: {}", sql, e);

            ObjectNode errorNode = objectMapper.createObjectNode();
            errorNode.put("success", false);
            errorNode.put("error", "쿼리 실행 중 오류가 발생했습니다: " + e.getMessage());
            errorNode.put("sql", sql);

            return errorNode;
        }
    }

    private boolean isValidSQL(String sql) {
        if (sql == null || sql.trim().isEmpty()) {
            return false;
        }

        String trimmedSQL = sql.trim().toLowerCase();

        // SELECT문만 허용
        if (!ALLOWED_SQL_PATTERN.matcher(trimmedSQL).matches()) {
            log.warn("허용되지 않은 SQL 패턴: {}", sql);
            return false;
        }

        // 금지된 키워드 체크
        if (FORBIDDEN_KEYWORDS.matcher(trimmedSQL).matches()) {
            log.warn("금지된 키워드가 포함된 SQL: {}", sql);
            return false;
        }

        // 관리자 전용이므로 테이블명 검증 생략 (복잡한 쿼리에서 오탐 방지)

        // 다중 스테이트먼트 방지 (세미콜론 체크)
        if (sql.contains(";") && !sql.trim().endsWith(";")) {
            log.warn("다중 스테이트먼트가 감지된 SQL: {}", sql);
            return false;
        }

        return true;
    }

    // 관리자 전용 시스템이므로 테이블명 검증 생략
    // private boolean validateTableNames(String sql) { ... } - 제거됨

    private void addValueToNode(ObjectNode node, String key, Object value) {
        if (value == null) {
            node.putNull(key);
        } else if (value instanceof String) {
            node.put(key, (String) value);
        } else if (value instanceof Integer) {
            node.put(key, (Integer) value);
        } else if (value instanceof Long) {
            node.put(key, (Long) value);
        } else if (value instanceof Double) {
            node.put(key, (Double) value);
        } else if (value instanceof BigDecimal) {
            node.put(key, ((BigDecimal) value).doubleValue());
        } else if (value instanceof Boolean) {
            node.put(key, (Boolean) value);
        } else if (value instanceof LocalDate) {
            node.put(key, value.toString());
        } else if (value instanceof LocalDateTime) {
            node.put(key, value.toString());
        } else if (value instanceof Timestamp) {
            node.put(key, value.toString());
        } else {
            node.put(key, value.toString());
        }
    }

    public JsonNode generateSampleData() {
        ObjectNode sampleNode = objectMapper.createObjectNode();
        sampleNode.put("title", "샘플 데이터");
        sampleNode.put("chartType", "bar");
        sampleNode.put("explanation", "테스트용 샘플 데이터입니다.");
        sampleNode.put("success", true);

        ArrayNode columnsArray = objectMapper.createArrayNode();
        columnsArray.add("category");
        columnsArray.add("value");
        sampleNode.set("columns", columnsArray);

        ArrayNode dataArray = objectMapper.createArrayNode();

        ObjectNode row1 = objectMapper.createObjectNode();
        row1.put("category", "예약완료");
        row1.put("value", 150);
        dataArray.add(row1);

        ObjectNode row2 = objectMapper.createObjectNode();
        row2.put("category", "예약대기");
        row2.put("value", 75);
        dataArray.add(row2);

        ObjectNode row3 = objectMapper.createObjectNode();
        row3.put("category", "취소됨");
        row3.put("value", 25);
        dataArray.add(row3);

        sampleNode.set("data", dataArray);
        sampleNode.put("rowCount", 3);

        return sampleNode;
    }
}