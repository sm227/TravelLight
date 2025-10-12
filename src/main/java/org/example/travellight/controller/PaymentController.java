package org.example.travellight.controller;

import org.example.travellight.dto.CommonApiResponse;
import org.example.travellight.service.PortOnePaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
@Slf4j
public class PaymentController {
    
    @Autowired
    private PortOnePaymentService portOnePaymentService;

    @PostMapping("/portone/complete")
    public ResponseEntity<?> completePortonePayment(@RequestBody Map<String, String> request) {
        String paymentId = request.get("paymentId");
        String payMethod = request.get("payMethod");

        try {
            if (paymentId == null || paymentId.isEmpty()) {
                org.slf4j.MDC.put("action", "PAYMENT_FAIL");
        org.slf4j.MDC.put("actionCategory", "PAYMENT");
                org.slf4j.MDC.put("reason", "Missing payment ID");
                log.warn("PAYMENT_FAIL - Missing payment ID");
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "결제 ID가 필요합니다."));
            }

            // 포트원 API를 통한 실제 결제 검증
            Map<String, Object> paymentInfo = portOnePaymentService.verifyPayment(paymentId);

            if (paymentInfo == null) {
                org.slf4j.MDC.put("action", "PAYMENT_FAIL");
                org.slf4j.MDC.put("actionCategory", "PAYMENT");
                org.slf4j.MDC.put("paymentId", paymentId);
                org.slf4j.MDC.put("paymentMethod", payMethod != null ? payMethod : "unknown");
                org.slf4j.MDC.put("reason", "Verification failed");
                log.error("PAYMENT_FAIL - Verification failed: paymentId = {}", paymentId);
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "결제 검증에 실패했습니다."));
            }

            // customData에서 userId 추출
            String userId = null;
            try {
                if (paymentInfo.get("customData") != null) {
                    String customDataStr = paymentInfo.get("customData").toString();
                    // JSON 파싱하여 userId 추출
                    if (customDataStr.contains("\"userId\":")) {
                        int userIdStart = customDataStr.indexOf("\"userId\":") + 9;
                        int userIdEnd = customDataStr.indexOf(",", userIdStart);
                        if (userIdEnd == -1) {
                            userIdEnd = customDataStr.indexOf("}", userIdStart);
                        }
                        userId = customDataStr.substring(userIdStart, userIdEnd).trim();
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to extract userId from customData", e);
            }

            // MDC에 공통 정보 설정
            org.slf4j.MDC.put("actionCategory", "PAYMENT");
            org.slf4j.MDC.put("paymentId", paymentId);
            org.slf4j.MDC.put("paymentMethod", payMethod != null ? payMethod : "unknown");
            if (userId != null) {
                org.slf4j.MDC.put("userId", userId);
            }

            // 결제 시도 로그
            org.slf4j.MDC.put("action", "PAYMENT_ATTEMPT");
            log.info("PAYMENT_ATTEMPT - PaymentId: {}, Method: {}", paymentId, payMethod);

            String paymentStatus = (String) paymentInfo.get("status");
            if (!"PAID".equals(paymentStatus)) {
                org.slf4j.MDC.put("action", "PAYMENT_FAIL");
                org.slf4j.MDC.put("status", paymentStatus);
                org.slf4j.MDC.put("reason", "Payment not completed");
                log.error("PAYMENT_FAIL - Status: {}, paymentId = {}", paymentStatus, paymentId);
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "결제가 완료되지 않았습니다. 상태: " + paymentStatus));
            }

            // 결제 성공 로그
            org.slf4j.MDC.put("action", "PAYMENT_SUCCESS");
            org.slf4j.MDC.put("amount", paymentInfo.get("amount").toString());
            org.slf4j.MDC.put("status", "PAID");
            log.info("PAYMENT_SUCCESS - PaymentId: {}, Amount: {}, Method: {}",
                paymentId, paymentInfo.get("amount"), payMethod);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "PAID");
            response.put("paymentId", paymentId);
            response.put("payMethod", payMethod);
            response.put("message", getSuccessMessage(payMethod));
            response.put("amount", paymentInfo.get("amount"));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            org.slf4j.MDC.put("action", "PAYMENT_ERROR");
        org.slf4j.MDC.put("actionCategory", "PAYMENT");
            org.slf4j.MDC.put("errorMessage", e.getMessage());
            log.error("PAYMENT_ERROR - Exception: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "결제 처리 중 오류가 발생했습니다: " + e.getMessage()));
        } finally {
            org.slf4j.MDC.clear();
        }
    }
    
    private String getSuccessMessage(String payMethod) {
        if ("paypal".equalsIgnoreCase(payMethod)) {
            return "PayPal 결제가 성공적으로 완료되었습니다.";
        } else if ("card".equalsIgnoreCase(payMethod)) {
            return "카드 결제가 성공적으로 완료되었습니다.";
        } else {
            return "결제가 성공적으로 완료되었습니다.";
        }
    }
    
    @PostMapping("/{paymentId}/cancel")
    public ResponseEntity<CommonApiResponse> cancelPayment(@PathVariable String paymentId,
                                                           @RequestBody Map<String, String> request) {
        String reason = request.getOrDefault("reason", "고객 요청");

        try {
            // 결제 정보 조회하여 userId 추출
            Map<String, Object> paymentInfo = portOnePaymentService.verifyPayment(paymentId);
            String userId = null;
            try {
                if (paymentInfo != null && paymentInfo.get("customData") != null) {
                    String customDataStr = paymentInfo.get("customData").toString();
                    if (customDataStr.contains("\"userId\":")) {
                        int userIdStart = customDataStr.indexOf("\"userId\":") + 9;
                        int userIdEnd = customDataStr.indexOf(",", userIdStart);
                        if (userIdEnd == -1) {
                            userIdEnd = customDataStr.indexOf("}", userIdStart);
                        }
                        userId = customDataStr.substring(userIdStart, userIdEnd).trim();
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to extract userId from customData", e);
            }

            // MDC에 공통 정보 설정
            org.slf4j.MDC.put("actionCategory", "PAYMENT");
            org.slf4j.MDC.put("paymentId", paymentId);
            org.slf4j.MDC.put("cancelReason", reason);
            if (userId != null) {
                org.slf4j.MDC.put("userId", userId);
            }

            // 결제 취소 시도 로그
            org.slf4j.MDC.put("action", "PAYMENT_CANCEL_ATTEMPT");
            log.info("PAYMENT_CANCEL_ATTEMPT - PaymentId: {}, Reason: {}", paymentId, reason);

            // 실제 포트원 API를 통한 결제 취소
            portOnePaymentService.cancelPayment(paymentId, reason);

            // 결제 취소 성공 로그
            org.slf4j.MDC.put("action", "PAYMENT_CANCEL_SUCCESS");
            log.info("PAYMENT_CANCEL_SUCCESS - PaymentId: {}", paymentId);

            return ResponseEntity.ok(CommonApiResponse.success("결제가 성공적으로 취소되었습니다.", null));

        } catch (Exception e) {
            // 결제 취소 실패 로그
            org.slf4j.MDC.put("action", "PAYMENT_CANCEL_FAIL");
            org.slf4j.MDC.put("errorMessage", e.getMessage());
            log.error("PAYMENT_CANCEL_FAIL - PaymentId: {}, Error: {}", paymentId, e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(CommonApiResponse.error("결제 취소 중 오류가 발생했습니다: " + e.getMessage()));
        } finally {
            org.slf4j.MDC.clear();
        }
    }
    
    // 웹훅 엔드포인트 비활성화 (필요시 나중에 활성화)
    /*
    @PostMapping("/portone/webhook")
    public ResponseEntity<?> handlePortoneWebhook(@RequestBody String payload, 
                                                  @RequestHeader Map<String, String> headers) {
        try {
            log.info("포트원 웹훅 수신: {}", payload);
            
            // TODO: 포트원 웹훅 검증 및 처리 로직 구현
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("포트원 웹훅 처리 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    */
} 