package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.config.PortOneProperties;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PortOnePaymentService {
    
    private final PortOneProperties portOneProperties;
    private final RestTemplate restTemplate = new RestTemplate();
    
    private static final String PORTONE_API_BASE_URL = "https://api.portone.io";
    
    /**
     * 포트원 결제 검증 (REST API)
     * @param paymentId 결제 ID
     * @return 결제 정보
     */
    public Map<String, Object> verifyPayment(String paymentId) {
        try {
            String url = PORTONE_API_BASE_URL + "/payments/" + paymentId;
            
            // 헤더 설정 - PortOne 인증 스킴 사용
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "PortOne " + portOneProperties.getApi());
            
            HttpEntity<String> requestEntity = new HttpEntity<>(headers);
            
            log.info("포트원 결제 검증 요청: paymentId={}, url={}", paymentId, url);
            
            // API 호출
            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                Map.class
            );
            
            Map<String, Object> responseBody = response.getBody();
            
            log.info("포트원 결제 검증 성공: paymentId={}, response={}", paymentId, responseBody);
            
            return responseBody;
            
        } catch (Exception e) {
            log.error("포트원 결제 검증 실패: paymentId={}, error={}", paymentId, e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 포트원 결제 취소 (REST API)
     * @param paymentId 결제 ID
     * @param reason 취소 사유
     * @return 취소 결과
     */
    public Map<String, Object> cancelPayment(String paymentId, String reason) {
        try {
            String url = PORTONE_API_BASE_URL + "/payments/" + paymentId + "/cancel";
            
            // 헤더 설정 - PortOne 인증 스킴 사용 (Bearer 대신)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "PortOne " + portOneProperties.getApi());
            
            // 요청 바디 설정 (reason 필수)
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("reason", reason);
            
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            log.info("포트원 결제 취소 요청: paymentId={}, reason={}, url={}", paymentId, reason, url);
            
            // API 호출
            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                Map.class
            );
            
            Map<String, Object> responseBody = response.getBody();
            
            log.info("포트원 결제 취소 성공: paymentId={}, response={}", paymentId, responseBody);
            
            return responseBody;
            
        } catch (Exception e) {
            log.error("포트원 결제 취소 실패: paymentId={}, error={}", paymentId, e.getMessage(), e);
            throw new RuntimeException("결제 취소 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
}