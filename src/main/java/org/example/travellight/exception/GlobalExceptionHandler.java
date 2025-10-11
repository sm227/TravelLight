package org.example.travellight.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.example.travellight.dto.CommonApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<CommonApiResponse<Void>> handleCustomException(CustomException e, HttpServletRequest request) {
        // 에러 로그 (ELK 전용)
        MDC.put("action", "ERROR_CUSTOM");
        MDC.put("actionCategory", "ERROR");
        MDC.put("errorType", "CustomException");
        MDC.put("errorMessage", e.getMessage());
        MDC.put("httpStatus", String.valueOf(e.getStatus().value()));
        MDC.put("endpoint", request.getRequestURI());

        logger.error("ERROR_CUSTOM - {} at {}: {}", e.getClass().getSimpleName(), request.getRequestURI(), e.getMessage(), e);

        MDC.clear();
        return ResponseEntity
                .status(e.getStatus())
                .body(CommonApiResponse.error(e.getMessage()));
    }
    
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonApiResponse<Void>> handleHttpMessageNotReadableException(HttpMessageNotReadableException e, HttpServletRequest request) {
        // 에러 로그 (ELK 전용)
        MDC.put("action", "ERROR_BAD_REQUEST");
        MDC.put("actionCategory", "ERROR");
        MDC.put("errorType", "HttpMessageNotReadableException");
        MDC.put("errorMessage", e.getMessage());
        MDC.put("httpStatus", String.valueOf(HttpStatus.BAD_REQUEST.value()));
        MDC.put("endpoint", request.getRequestURI());

        logger.error("ERROR_BAD_REQUEST - Message parsing error at {}: {}", request.getRequestURI(), e.getMessage(), e);

        MDC.clear();
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(CommonApiResponse.error("요청 데이터 형식이 올바르지 않습니다: " + e.getMessage()));
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<CommonApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException e, HttpServletRequest request) {
        // 에러 로그 (ELK 전용)
        MDC.put("action", "ERROR_INVALID_ARGUMENT");
        MDC.put("actionCategory", "ERROR");
        MDC.put("errorType", "IllegalArgumentException");
        MDC.put("errorMessage", e.getMessage());
        MDC.put("httpStatus", String.valueOf(HttpStatus.BAD_REQUEST.value()));
        MDC.put("endpoint", request.getRequestURI());

        logger.error("ERROR_INVALID_ARGUMENT - Invalid argument at {}: {}", request.getRequestURI(), e.getMessage(), e);

        MDC.clear();
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(CommonApiResponse.error("잘못된 요청 값: " + e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<CommonApiResponse<Void>> handleException(Exception e, HttpServletRequest request) {
        // 에러 로그 (ELK 전용)
        MDC.put("action", "ERROR_UNHANDLED");
        MDC.put("actionCategory", "ERROR");
        MDC.put("errorType", e.getClass().getSimpleName());
        MDC.put("errorMessage", e.getMessage());
        MDC.put("httpStatus", String.valueOf(HttpStatus.INTERNAL_SERVER_ERROR.value()));
        MDC.put("endpoint", request.getRequestURI());

        logger.error("ERROR_UNHANDLED - Unhandled exception at {}: {} - {}",
                request.getRequestURI(), e.getClass().getSimpleName(), e.getMessage(), e);

        MDC.clear();
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(CommonApiResponse.error("서버 오류가 발생했습니다: " + e.getMessage()));
    }
} 