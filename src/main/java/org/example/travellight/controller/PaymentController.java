package org.example.travellight.controller;

import org.example.travellight.dto.ApiResponse;
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
        try {
            String paymentId = request.get("paymentId");
            String payMethod = request.get("payMethod"); // 결제 수단 정보 추가
            
            if (paymentId == null || paymentId.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "결제 ID가 필요합니다."));
            }
            
            log.info("포트원 결제 완료 처리: paymentId = {}, payMethod = {}", paymentId, payMethod);
            
            // PayPal 결제인 경우 추가 로그
            if ("paypal".equalsIgnoreCase(payMethod)) {
                log.info("PayPal 결제 완료: paymentId = {}", paymentId);
            }
            
            // TODO: 실제 포트원 API를 통한 결제 검증 로직 구현
            // PayPal의 경우 포트원 V2 API로 결제 상태 확인 필요
            // 현재는 테스트를 위해 항상 성공으로 처리
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "PAID");
            response.put("paymentId", paymentId);
            response.put("payMethod", payMethod);
            response.put("message", getSuccessMessage(payMethod));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("포트원 결제 완료 처리 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "결제 처리 중 오류가 발생했습니다."));
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
    public ResponseEntity<ApiResponse> cancelPayment(@PathVariable String paymentId, 
                                                    @RequestBody Map<String, String> request) {
        try {
            String reason = request.getOrDefault("reason", "고객 요청");
            
            log.info("결제 취소 요청: paymentId = {}, reason = {}", paymentId, reason);
            
            // 실제 포트원 API를 통한 결제 취소
            portOnePaymentService.cancelPayment(paymentId, reason);
            
            log.info("결제 취소 완료: paymentId = {}", paymentId);
            
            return ResponseEntity.ok(ApiResponse.success("결제가 성공적으로 취소되었습니다.", null));
            
        } catch (Exception e) {
            log.error("결제 취소 처리 중 오류 발생: paymentId = {}", paymentId, e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("결제 취소 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    @PostMapping("/portone/webhook")
    public ResponseEntity<?> handlePortoneWebhook(@RequestBody String payload, 
                                                  @RequestHeader Map<String, String> headers) {
        try {
            log.info("포트원 웹훅 수신: {}", payload);
            
            // TODO: 포트원 웹훅 검증 및 처리 로직 구현
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("포트원 웹훅 처리 중 오료 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 