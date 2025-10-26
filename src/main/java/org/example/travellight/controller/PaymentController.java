package org.example.travellight.controller;

import org.example.travellight.dto.CommonApiResponse;
import org.example.travellight.dto.ReservationDto;
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

    @Autowired
    private org.example.travellight.service.ReservationService reservationService;

    @Autowired
    private org.example.travellight.service.PaymentService paymentService;

    @GetMapping("/portone/info/{paymentId}")
    public ResponseEntity<?> getPortonePaymentInfo(@PathVariable String paymentId) {
        try {
            log.info("결제 정보 조회 요청: paymentId = {}", paymentId);

            // 포트원 API를 통한 결제 정보 조회
            Map<String, Object> paymentInfo = portOnePaymentService.verifyPayment(paymentId);

            if (paymentInfo == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "결제 정보를 찾을 수 없습니다."));
            }

            return ResponseEntity.ok(paymentInfo);

        } catch (Exception e) {
            log.error("결제 정보 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "결제 정보 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

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

            // customData에서 userId와 reservationNumber 추출
            String userId = null;
            String reservationNumber = null;
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

                    // JSON 파싱하여 reservationNumber 추출
                    if (customDataStr.contains("\"reservationNumber\":")) {
                        int resNumStart = customDataStr.indexOf("\"reservationNumber\":\"") + 21;
                        int resNumEnd = customDataStr.indexOf("\"", resNumStart);
                        reservationNumber = customDataStr.substring(resNumStart, resNumEnd).trim();
                        log.info("customData에서 reservationNumber 추출: {}", reservationNumber);
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to extract data from customData", e);
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

            // PortOne API 응답에서 상세 결제 정보 추출
            String cardCompany = null;
            String cardType = null;
            String paymentProvider = "portone"; // 기본값

            try {
                // method 객체에서 카드 정보 추출
                if (paymentInfo.get("method") != null) {
                    Map<String, Object> method = (Map<String, Object>) paymentInfo.get("method");

                    log.info("method 객체 타입: {}", method.getClass().getName());
                    log.info("method type: {}", method.get("type"));
                    log.info("method provider: {}", method.get("provider"));

                    // 간편결제(EasyPay)의 경우 easyPayMethod에서 카드 정보 추출
                    if (method.get("easyPayMethod") != null) {
                        Map<String, Object> easyPayMethod = (Map<String, Object>) method.get("easyPayMethod");
                        log.info("easyPayMethod 발견: {}", easyPayMethod);

                        if (easyPayMethod.get("card") != null) {
                            Map<String, Object> card = (Map<String, Object>) easyPayMethod.get("card");
                            log.info("easyPayMethod.card 전체 내용: {}", card);

                            // 카드사 정보 (issuer 필드 사용)
                            if (card.get("issuer") != null) {
                                cardCompany = card.get("issuer").toString();
                                log.info("카드사 issuer에서 추출: {}", cardCompany);
                            } else if (card.get("name") != null) {
                                cardCompany = card.get("name").toString();
                                log.info("카드사 name에서 추출: {}", cardCompany);
                            }

                            // 카드 타입 (CREDIT, DEBIT 등)
                            if (card.get("type") != null) {
                                cardType = card.get("type").toString();
                                log.info("카드 타입 type에서 추출: {}", cardType);
                            }
                        }
                    }
                    // 일반 카드 결제의 경우 card에서 직접 추출
                    else if (method.get("card") != null) {
                        Map<String, Object> card = (Map<String, Object>) method.get("card");
                        log.info("card 전체 내용: {}", card);

                        // 카드사 정보
                        if (card.get("issuer") != null) {
                            cardCompany = card.get("issuer").toString();
                            log.info("카드사 issuer에서 추출: {}", cardCompany);
                        } else if (card.get("publisher") != null) {
                            cardCompany = card.get("publisher").toString();
                            log.info("카드사 publisher에서 추출: {}", cardCompany);
                        } else if (card.get("name") != null) {
                            cardCompany = card.get("name").toString();
                            log.info("카드사 name에서 추출: {}", cardCompany);
                        }

                        // 카드 타입
                        if (card.get("type") != null) {
                            cardType = card.get("type").toString();
                            log.info("카드 타입 type에서 추출: {}", cardType);
                        }
                    } else {
                        log.warn("카드 정보를 찾을 수 없음. method 객체의 모든 키: {}", method.keySet());
                    }
                } else {
                    log.warn("paymentInfo.method가 null입니다. paymentInfo의 모든 키: {}", paymentInfo.keySet());
                }

                // channel 정보에서 결제 제공자(PG사) 추출
                if (paymentInfo.get("channel") != null) {
                    Map<String, Object> channel = (Map<String, Object>) paymentInfo.get("channel");
                    log.info("channel 전체 내용: {}", channel);

                    // pgProvider 필드 우선 확인 (예: KCP_V2, TOSSPAYMENTS 등)
                    if (channel.get("pgProvider") != null) {
                        paymentProvider = channel.get("pgProvider").toString();
                        log.info("PG사 pgProvider에서 추출: {}", paymentProvider);
                    } else if (channel.get("name") != null) {
                        paymentProvider = channel.get("name").toString();
                        log.info("PG사 name에서 추출: {}", paymentProvider);
                    }
                }

                // 결제 수단이 PayPal인 경우
                if ("paypal".equals(payMethod)) {
                    paymentProvider = "PayPal";
                    log.info("PayPal 결제로 설정");
                }

                log.info("=== 최종 추출된 결제 상세 정보 ===");
                log.info("cardCompany: {}", cardCompany);
                log.info("cardType: {}", cardType);
                log.info("paymentProvider: {}", paymentProvider);

            } catch (Exception e) {
                log.warn("결제 상세 정보 추출 중 오류 (계속 진행): {}", e.getMessage(), e);
            }

            // Payment 테이블에 결제 정보 저장
            if (reservationNumber != null && !reservationNumber.isEmpty()) {
                try {
                    log.info("Payment 테이블에 결제 정보 저장 시작 - reservationNumber: {}", reservationNumber);
                    paymentService.createPaymentFromPortOne(paymentInfo, reservationNumber);
                    log.info("Payment 테이블에 결제 정보 저장 완료");
                } catch (Exception e) {
                    log.error("Payment 테이블 저장 중 오류 발생 (계속 진행): {}", e.getMessage(), e);
                    // 결제는 성공했으므로 Payment 저장 실패해도 계속 진행
                }
            } else {
                log.warn("reservationNumber가 없어서 Payment 테이블에 저장하지 못했습니다.");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "PAID");
            response.put("paymentId", paymentId);
            response.put("payMethod", payMethod);
            response.put("message", getSuccessMessage(payMethod));
            response.put("amount", paymentInfo.get("amount"));
            response.put("paymentStatus", "PAID");
            response.put("paymentProvider", paymentProvider);
            response.put("cardCompany", cardCompany);
            response.put("cardType", cardType);

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
    
    @PostMapping("/save")
    public ResponseEntity<?> savePaymentInfo(@RequestBody Map<String, String> request) {
        String paymentId = request.get("paymentId");
        String reservationNumber = request.get("reservationNumber");

        try {
            if (paymentId == null || paymentId.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "결제 ID가 필요합니다."));
            }

            if (reservationNumber == null || reservationNumber.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "예약 번호가 필요합니다."));
            }

            log.info("Payment 저장 요청 - paymentId: {}, reservationNumber: {}", paymentId, reservationNumber);

            // 포트원 API로 결제 정보 재조회
            Map<String, Object> paymentInfo = portOnePaymentService.verifyPayment(paymentId);

            if (paymentInfo == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "결제 정보를 찾을 수 없습니다."));
            }

            // Payment 테이블에 저장
            paymentService.createPaymentFromPortOne(paymentInfo, reservationNumber);

            log.info("Payment 저장 완료 - paymentId: {}, reservationNumber: {}", paymentId, reservationNumber);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "결제 정보가 저장되었습니다."
            ));

        } catch (Exception e) {
            log.error("Payment 저장 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "결제 정보 저장 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 결제 ID로 결제 정보 조회
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<CommonApiResponse<org.example.travellight.entity.Payment>> getPaymentByPaymentId(@PathVariable String paymentId) {
        try {
            return paymentService.getPaymentByPaymentId(paymentId)
                    .<ResponseEntity<CommonApiResponse<org.example.travellight.entity.Payment>>>map(payment ->
                        ResponseEntity.ok(CommonApiResponse.success("결제 정보 조회 성공", payment)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("결제 정보 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("결제 정보 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 예약 번호로 결제 정보 조회
     */
    @GetMapping("/reservation/{reservationNumber}")
    public ResponseEntity<CommonApiResponse<org.example.travellight.entity.Payment>> getPaymentByReservationNumber(@PathVariable String reservationNumber) {
        try {
            return paymentService.getPaymentByReservationNumber(reservationNumber)
                    .<ResponseEntity<CommonApiResponse<org.example.travellight.entity.Payment>>>map(payment ->
                        ResponseEntity.ok(CommonApiResponse.success("결제 정보 조회 성공", payment)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("예약의 결제 정보 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("결제 정보 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 예약 ID로 모든 결제 내역 조회
     */
    @GetMapping("/reservation/{reservationId}/all")
    public ResponseEntity<CommonApiResponse<java.util.List<org.example.travellight.entity.Payment>>> getPaymentsByReservationId(@PathVariable Long reservationId) {
        try {
            java.util.List<org.example.travellight.entity.Payment> payments =
                    paymentService.getPaymentsByReservationId(reservationId);
            return ResponseEntity.ok(CommonApiResponse.success("결제 내역 조회 성공", payments));
        } catch (Exception e) {
            log.error("예약의 결제 내역 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("결제 내역 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사용자 ID로 모든 결제 내역 조회
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<CommonApiResponse<java.util.List<Map<String, Object>>>> getPaymentsByUserId(@PathVariable Long userId) {
        try {
            // User의 모든 Reservation을 조회하고, 각 Reservation의 Payment를 수집
            java.util.List<org.example.travellight.entity.Payment> allPayments = new java.util.ArrayList<>();

            // ReservationService를 통해 사용자의 예약 목록 조회
            java.util.List<ReservationDto> reservations = reservationService.getUserReservations(userId);

            // 각 예약의 결제 내역 수집
            for (ReservationDto reservation : reservations) {
                java.util.List<org.example.travellight.entity.Payment> payments =
                        paymentService.getPaymentsByReservationId(reservation.getId());
                allPayments.addAll(payments);
            }

            // Payment 엔티티를 DTO로 변환 (순환 참조 방지)
            java.util.List<Map<String, Object>> paymentDtos = allPayments.stream()
                    .map(this::convertToDto)
                    .collect(java.util.stream.Collectors.toList());

            log.info("사용자 ID {}의 결제 내역 {} 건 조회", userId, paymentDtos.size());
            return ResponseEntity.ok(CommonApiResponse.success("결제 내역 조회 성공", paymentDtos));
        } catch (Exception e) {
            log.error("사용자의 결제 내역 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("결제 내역 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * Payment 엔티티를 DTO로 변환 (순환 참조 방지)
     */
    private Map<String, Object> convertToDto(org.example.travellight.entity.Payment payment) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", payment.getId());
        dto.put("reservationId", payment.getReservation().getId());
        dto.put("paymentId", payment.getPaymentId());
        dto.put("transactionId", payment.getTransactionId());
        dto.put("merchantId", payment.getMerchantId());
        dto.put("storeId", payment.getStoreId());
        dto.put("paymentMethod", payment.getPaymentMethod());
        dto.put("paymentProvider", payment.getPaymentProvider());
        dto.put("easyPayProvider", payment.getEasyPayProvider());
        dto.put("cardCompany", payment.getCardCompany());
        dto.put("cardType", payment.getCardType());
        dto.put("cardNumber", payment.getCardNumber());
        dto.put("cardName", payment.getCardName());
        dto.put("installmentMonth", payment.getInstallmentMonth());
        dto.put("isInterestFree", payment.getIsInterestFree());
        dto.put("approvalNumber", payment.getApprovalNumber());
        dto.put("paymentAmount", payment.getPaymentAmount());
        dto.put("paymentStatus", payment.getPaymentStatus());
        dto.put("paymentTime", payment.getPaymentTime());
        dto.put("cancelledAt", payment.getCancelledAt());
        dto.put("cancelReason", payment.getCancelReason());
        dto.put("refundAmount", payment.getRefundAmount());
        dto.put("channelType", payment.getChannelType());
        dto.put("channelId", payment.getChannelId());
        dto.put("channelKey", payment.getChannelKey());
        dto.put("channelName", payment.getChannelName());
        dto.put("pgMerchantId", payment.getPgMerchantId());
        dto.put("pgTransactionId", payment.getPgTransactionId());
        dto.put("createdAt", payment.getCreatedAt());
        dto.put("updatedAt", payment.getUpdatedAt());
        return dto;
    }

    /**
     * 결제 취소 (관리자용 - 요청 본문에서 paymentId 받음)
     */
    @PostMapping("/cancel")
    public ResponseEntity<?> cancelPaymentAdmin(@RequestBody Map<String, String> request) {
        try {
            String paymentId = request.get("paymentId");
            String cancelReason = request.get("cancelReason");

            if (paymentId == null || paymentId.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "결제 ID가 필요합니다."));
            }

            if (cancelReason == null || cancelReason.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "취소 사유가 필요합니다."));
            }

            log.info("결제 취소 요청 (관리자): paymentId = {}, reason = {}", paymentId, cancelReason);

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
            org.slf4j.MDC.put("cancelReason", cancelReason);
            if (userId != null) {
                org.slf4j.MDC.put("userId", userId);
            }

            // 결제 취소 시도 로그
            org.slf4j.MDC.put("action", "PAYMENT_CANCEL_ATTEMPT");
            log.info("PAYMENT_CANCEL_ATTEMPT - PaymentId: {}, Reason: {}", paymentId, cancelReason);

            // 1. 포트원 API를 통한 실제 결제 취소
            portOnePaymentService.cancelPayment(paymentId, cancelReason);
            log.info("포트원 결제 취소 완료: paymentId = {}", paymentId);

            // 2. DB에 취소 정보 저장
            paymentService.cancelPayment(paymentId, cancelReason);
            log.info("DB 결제 취소 정보 저장 완료: paymentId = {}", paymentId);

            // 결제 취소 성공 로그
            org.slf4j.MDC.put("action", "PAYMENT_CANCEL_SUCCESS");
            log.info("PAYMENT_CANCEL_SUCCESS - PaymentId: {}", paymentId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentId", paymentId);
            response.put("message", "결제가 성공적으로 취소되었습니다.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // 결제 취소 실패 로그
            org.slf4j.MDC.put("action", "PAYMENT_CANCEL_FAIL");
            org.slf4j.MDC.put("errorMessage", e.getMessage());
            log.error("결제 취소 처리 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "결제 취소 처리 중 오류가 발생했습니다: " + e.getMessage()));
        } finally {
            org.slf4j.MDC.clear();
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