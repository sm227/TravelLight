package org.example.travellight.exception;

import org.example.travellight.dto.CommonApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<CommonApiResponse<Void>> handleCustomException(CustomException e) {
        logger.error("사용자 정의 예외 발생: {}", e.getMessage(), e);
        return ResponseEntity
                .status(e.getStatus())
                .body(CommonApiResponse.error(e.getMessage()));
    }
    
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonApiResponse<Void>> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        logger.error("요청 메시지 파싱 오류: {}", e.getMessage(), e);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(CommonApiResponse.error("요청 데이터 형식이 올바르지 않습니다: " + e.getMessage()));
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<CommonApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException e) {
        logger.error("잘못된 인자 예외 발생: {}", e.getMessage(), e);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(CommonApiResponse.error("잘못된 요청 값: " + e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<CommonApiResponse<Void>> handleException(Exception e) {
        logger.error("처리되지 않은 예외 발생: {}", e.getMessage(), e);
        return ResponseEntity
                .badRequest()
                .body(CommonApiResponse.error("서버 오류가 발생했습니다: " + e.getMessage()));
    }
} 