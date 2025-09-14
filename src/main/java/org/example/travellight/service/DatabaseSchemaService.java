package org.example.travellight.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.persistence.EntityManager;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.Attribute;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class DatabaseSchemaService {

    private final EntityManager entityManager;
    private final ObjectMapper objectMapper;

    public JsonNode getDatabaseSchema() {
        ObjectNode schemaNode = objectMapper.createObjectNode();
        ObjectNode tablesNode = objectMapper.createObjectNode();

        Set<EntityType<?>> entities = entityManager.getMetamodel().getEntities();

        for (EntityType<?> entity : entities) {
            ObjectNode tableNode = objectMapper.createObjectNode();
            ArrayNode columnsNode = objectMapper.createArrayNode();

            String tableName = getTableName(entity);
            tableNode.put("tableName", tableName);
            tableNode.put("entityName", entity.getName());

            for (Attribute<?, ?> attribute : entity.getAttributes()) {
                ObjectNode columnNode = objectMapper.createObjectNode();
                columnNode.put("name", attribute.getName());
                columnNode.put("dbColumnName", camelCaseToSnakeCase(attribute.getName()));
                columnNode.put("type", attribute.getJavaType().getSimpleName());
                // ID 속성인지 확인
                boolean isId = false;
                try {
                    if (entity.getIdType() != null && entity.getId(entity.getIdType().getJavaType()) != null) {
                        isId = attribute.equals(entity.getId(entity.getIdType().getJavaType()));
                    }
                } catch (Exception e) {
                    // ID가 없는 엔티티일 수 있음
                    isId = false;
                }
                columnNode.put("isId", isId);

                // 관계형 속성인지 확인
                switch (attribute.getPersistentAttributeType()) {
                    case BASIC:
                        columnNode.put("relationshipType", "BASIC");
                        break;
                    case ONE_TO_MANY:
                        columnNode.put("relationshipType", "ONE_TO_MANY");
                        break;
                    case MANY_TO_ONE:
                        columnNode.put("relationshipType", "MANY_TO_ONE");
                        break;
                    case ONE_TO_ONE:
                        columnNode.put("relationshipType", "ONE_TO_ONE");
                        break;
                    case MANY_TO_MANY:
                        columnNode.put("relationshipType", "MANY_TO_MANY");
                        break;
                    case ELEMENT_COLLECTION:
                        columnNode.put("relationshipType", "ELEMENT_COLLECTION");
                        break;
                }

                columnsNode.add(columnNode);
            }

            tableNode.set("columns", columnsNode);
            tablesNode.set(entity.getName(), tableNode);
        }

        schemaNode.set("tables", tablesNode);
        schemaNode.put("description", "TravelLight 데이터베이스 스키마 정보");

        return schemaNode;
    }

    private String getTableName(EntityType<?> entity) {
        String className = entity.getJavaType().getSimpleName();

        // 일반적인 테이블 네이밍 컨벤션에 따라 변환
        switch (className) {
            case "Reservation":
                return "reservations";
            case "Partnership":
                return "partnerships";
            case "User":
                return "users";
            case "Delivery":
                return "deliveries";
            case "EventStorage":
                return "event_storages";
            case "Review":
                return "reviews";
            case "Driver":
                return "drivers";
            case "StorageItem":
                return "storage_items";
            default:
                return className.toLowerCase() + "s";
        }
    }

    private String camelCaseToSnakeCase(String camelCase) {
        if (camelCase == null || camelCase.isEmpty()) {
            return camelCase;
        }

        // 특별한 매핑들
        switch (camelCase) {
            case "totalPrice":
                return "total_price";
            case "createdAt":
                return "created_at";
            case "updatedAt":
                return "updated_at";
            case "userId":
                return "user_id";
            case "partnerId":
                return "partner_id";
            case "bagSize":
                return "bag_size";
            case "placeName":
                return "place_name";
            case "businessName":
                return "business_name";
            case "phoneNumber":
                return "phone_number";
            case "pickupTime":
                return "pickup_time";
            case "deliveryTime":
                return "delivery_time";
            default:
                // 일반적인 camelCase -> snake_case 변환
                return camelCase.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
        }
    }

    public String getSchemaForPrompt() {
        try {
            JsonNode schema = getDatabaseSchema();
            StringBuilder promptBuilder = new StringBuilder();

            promptBuilder.append("다음은 TravelLight 여행 짐 보관 서비스의 데이터베이스 스키마입니다:\n\n");

            JsonNode tables = schema.get("tables");
            tables.fieldNames().forEachRemaining(entityName -> {
                JsonNode table = tables.get(entityName);
                String tableName = table.get("tableName").asText();

                promptBuilder.append(String.format("테이블: %s (%s)\n", tableName, entityName));

                JsonNode columns = table.get("columns");
                columns.forEach(column -> {
                    String name = column.get("name").asText();
                    String dbColumnName = column.get("dbColumnName").asText();
                    String type = column.get("type").asText();
                    String relationship = column.get("relationshipType").asText();
                    boolean isId = column.get("isId").asBoolean();

                    promptBuilder.append(String.format("  - %s (DB: %s, %s)%s%s\n",
                        name,
                        dbColumnName,
                        type,
                        isId ? " [기본키]" : "",
                        !"BASIC".equals(relationship) ? " [" + relationship + "]" : ""
                    ));
                });
                promptBuilder.append("\n");
            });

            promptBuilder.append("주요 비즈니스 개념:\n");
            promptBuilder.append("- reservations: 짐 보관 예약 정보 (예약번호, 장소, 날짜, 가격 등)\n");
            promptBuilder.append("- partnerships: 제휴점 정보 (매장명, 주소, 상태, 보관함 용량 등)\n");
            promptBuilder.append("- users: 사용자 정보 (고객 정보)\n");
            promptBuilder.append("- deliveries: 배달 정보 (픽업/배송 데이터)\n");
            promptBuilder.append("- reviews: 리뷰 정보 (고객 평점 및 후기)\n");
            promptBuilder.append("- event_storages: 이벤트 보관 신청 정보\n");

            return promptBuilder.toString();
        } catch (Exception e) {
            log.error("스키마 정보를 프롬프트용으로 변환하는 중 오류 발생", e);
            return "데이터베이스 스키마 정보를 가져올 수 없습니다.";
        }
    }
}