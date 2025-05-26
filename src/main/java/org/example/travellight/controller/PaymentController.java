package org.example.travellight.controller;

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

    @PostMapping("/portone/complete")
    public ResponseEntity<?> completePortonePayment(@RequestBody Map<String, String> request) {
        try {
            String paymentId = request.get("paymentId");
            
            if (paymentId == null || paymentId.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "결제 ID가 필요합니다."));
            }
            
            log.info("포트원 결제 완료 처리: paymentId = {}", paymentId);
            
            // TODO: 실제 포트원 API를 통한 결제 검증 로직 구현
            // 현재는 테스트를 위해 항상 성공으로 처리
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "PAID");
            response.put("paymentId", paymentId);
            response.put("message", "결제가 성공적으로 완료되었습니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("포트원 결제 완료 처리 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "결제 처리 중 오류가 발생했습니다."));
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
            log.error("포트원 웹훅 처리 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 