package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 사용자 활동 로그 DTO
 * - ELK에서 조회한 로그 데이터를 담는 객체
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogDto {

    /**
     * 로그 타임스탬프
     */
    private LocalDateTime timestamp;

    /**
     * 액션 타입 (LOGIN_SUCCESS, RESERVATION_CREATE_ATTEMPT, PAYMENT_SUCCESS 등)
     */
    private String action;

    /**
     * 액션 카테고리 (LOGIN, RESERVATION, PAYMENT, ERROR, PAGE_VIEW)
     */
    private String actionCategory;

    /**
     * 사용자 ID
     */
    private Long userId;

    /**
     * 사용자 이메일
     */
    private String userEmail;

    /**
     * 사용자 이름
     */
    private String userName;

    /**
     * 클라이언트 IP 주소
     */
    private String clientIp;

    /**
     * HTTP 메서드 (GET, POST, PUT, DELETE)
     */
    private String httpMethod;

    /**
     * 요청 URI
     */
    private String requestUri;

    /**
     * 로그 레벨 (INFO, WARN, ERROR)
     */
    private String level;

    /**
     * 로그 메시지
     */
    private String message;

    /**
     * 추가 세부 정보 (에러 메시지, 금액, 예약 장소 등)
     */
    private String details;

    /**
     * HTTP 상태 코드 (에러 로그의 경우)
     */
    private String httpStatus;

    /**
     * 에러 타입 (에러 로그의 경우)
     */
    private String errorType;
}
