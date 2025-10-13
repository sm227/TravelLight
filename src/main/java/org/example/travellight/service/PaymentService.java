package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.entity.Payment;
import org.example.travellight.entity.Reservation;
import org.example.travellight.repository.PaymentRepository;
import org.example.travellight.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;

    /**
     * PortOne API 응답을 파싱하여 Payment 엔티티 생성 및 저장
     */
    @Transactional
    public Payment createPaymentFromPortOne(Map<String, Object> paymentInfo, String reservationNumber) {
        log.info("결제 정보 저장 시작 - reservationNumber: {}", reservationNumber);
        log.info("PaymentInfo 전체: {}", paymentInfo);
        log.info("amount 필드: {}", paymentInfo.get("amount"));
        log.info("amount 타입: {}", paymentInfo.get("amount") != null ? paymentInfo.get("amount").getClass().getName() : "null");

        // 예약 조회
        Reservation reservation = reservationRepository.findByReservationNumber(reservationNumber)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다: " + reservationNumber));

        // Payment 엔티티 생성
        Payment.PaymentBuilder builder = Payment.builder()
                .reservation(reservation)
                .paymentId((String) paymentInfo.get("id"))
                .transactionId((String) paymentInfo.get("transactionId"))
                .merchantId((String) paymentInfo.get("merchantId"))
                .storeId((String) paymentInfo.get("storeId"))
                .paymentStatus((String) paymentInfo.get("status"))
                .paymentTime(LocalDateTime.now());

        // method 정보 추출
        if (paymentInfo.get("method") != null) {
            Map<String, Object> method = (Map<String, Object>) paymentInfo.get("method");
            String methodType = (String) method.get("type");

            // 결제 수단 타입 설정
            if ("PaymentMethodEasyPay".equals(methodType)) {
                builder.paymentMethod("easypay");
                builder.easyPayProvider((String) method.get("provider"));

                // 간편결제 내 카드 정보
                if (method.get("easyPayMethod") != null) {
                    Map<String, Object> easyPayMethod = (Map<String, Object>) method.get("easyPayMethod");

                    if (easyPayMethod.get("card") != null) {
                        Map<String, Object> card = (Map<String, Object>) easyPayMethod.get("card");
                        extractCardInfo(builder, card);
                    }

                    // 승인번호
                    if (easyPayMethod.get("approvalNumber") != null) {
                        builder.approvalNumber((String) easyPayMethod.get("approvalNumber"));
                    }

                    // 할부 정보
                    if (easyPayMethod.get("installment") != null) {
                        Map<String, Object> installment = (Map<String, Object>) easyPayMethod.get("installment");
                        builder.installmentMonth((Integer) installment.get("month"));
                        builder.isInterestFree((Boolean) installment.get("isInterestFree"));
                    }
                }
            } else if ("PaymentMethodCard".equals(methodType)) {
                builder.paymentMethod("card");

                if (method.get("card") != null) {
                    Map<String, Object> card = (Map<String, Object>) method.get("card");
                    extractCardInfo(builder, card);
                }
            } else {
                builder.paymentMethod(methodType.toLowerCase());
            }
        }

        // channel 정보 추출
        if (paymentInfo.get("channel") != null) {
            Map<String, Object> channel = (Map<String, Object>) paymentInfo.get("channel");
            builder.channelType((String) channel.get("type"));
            builder.channelId((String) channel.get("id"));
            builder.channelKey((String) channel.get("key"));
            builder.channelName((String) channel.get("name"));
            builder.paymentProvider((String) channel.get("pgProvider"));
            builder.pgMerchantId((String) channel.get("pgMerchantId"));
        }

        // 결제 금액
        if (paymentInfo.get("amount") != null) {
            Object amountObj = paymentInfo.get("amount");
            log.info("amount 객체: {}", amountObj);

            // amount가 Map인 경우 (V2 API의 경우)
            if (amountObj instanceof Map) {
                Map<String, Object> amount = (Map<String, Object>) amountObj;
                log.info("amount Map: {}", amount);
                Object totalObj = amount.get("total");
                log.info("total 객체: {}, 타입: {}", totalObj, totalObj != null ? totalObj.getClass().getName() : "null");

                if (totalObj != null) {
                    if (totalObj instanceof Integer) {
                        builder.paymentAmount((Integer) totalObj);
                        log.info("Integer로 설정: {}", totalObj);
                    } else if (totalObj instanceof Long) {
                        builder.paymentAmount(((Long) totalObj).intValue());
                        log.info("Long에서 변환: {}", totalObj);
                    } else if (totalObj instanceof Double) {
                        builder.paymentAmount(((Double) totalObj).intValue());
                        log.info("Double에서 변환: {}", totalObj);
                    } else {
                        int parsed = Integer.parseInt(totalObj.toString());
                        builder.paymentAmount(parsed);
                        log.info("String 파싱: {}", parsed);
                    }
                } else {
                    log.error("total 필드가 null입니다!");
                    builder.paymentAmount(0);
                }
            }
            // amount가 직접 숫자인 경우
            else if (amountObj instanceof Integer) {
                builder.paymentAmount((Integer) amountObj);
            } else if (amountObj instanceof Long) {
                builder.paymentAmount(((Long) amountObj).intValue());
            } else if (amountObj instanceof Double) {
                builder.paymentAmount(((Double) amountObj).intValue());
            } else {
                builder.paymentAmount(Integer.parseInt(amountObj.toString()));
            }
        } else {
            // amount 필드가 없으면 로그 남기고 0으로 설정
            log.warn("결제 금액 정보가 없습니다. paymentId: {}", paymentInfo.get("id"));
            builder.paymentAmount(0);
        }

        Payment payment = builder.build();
        Payment savedPayment = paymentRepository.save(payment);

        log.info("결제 정보 저장 완료 - paymentId: {}, reservationNumber: {}",
                savedPayment.getPaymentId(), reservationNumber);

        return savedPayment;
    }

    /**
     * 카드 정보 추출 헬퍼 메서드
     */
    private void extractCardInfo(Payment.PaymentBuilder builder, Map<String, Object> card) {
        if (card.get("issuer") != null) {
            builder.cardCompany((String) card.get("issuer"));
        }
        if (card.get("type") != null) {
            builder.cardType((String) card.get("type"));
        }
        if (card.get("number") != null) {
            builder.cardNumber((String) card.get("number"));
        }
        if (card.get("name") != null) {
            builder.cardName((String) card.get("name"));
        }
    }

    /**
     * 결제 ID로 조회
     */
    @Transactional(readOnly = true)
    public Optional<Payment> getPaymentByPaymentId(String paymentId) {
        return paymentRepository.findByPaymentId(paymentId);
    }

    /**
     * 예약 번호로 결제 조회
     */
    @Transactional(readOnly = true)
    public Optional<Payment> getPaymentByReservationNumber(String reservationNumber) {
        return paymentRepository.findByReservationNumber(reservationNumber);
    }

    /**
     * 예약의 모든 결제 내역 조회
     */
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByReservationId(Long reservationId) {
        return paymentRepository.findAllByReservationId(reservationId);
    }

    /**
     * 결제 취소 처리
     */
    @Transactional
    public Payment cancelPayment(String paymentId, String cancelReason) {
        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new RuntimeException("결제 정보를 찾을 수 없습니다: " + paymentId));

        payment.setPaymentStatus("CANCELLED");
        payment.setCancelledAt(LocalDateTime.now());
        payment.setCancelReason(cancelReason);

        log.info("결제 취소 처리 완료 - paymentId: {}, reason: {}", paymentId, cancelReason);

        return paymentRepository.save(payment);
    }

    /**
     * 환불 처리
     */
    @Transactional
    public Payment refundPayment(String paymentId, Integer refundAmount, String refundReason) {
        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new RuntimeException("결제 정보를 찾을 수 없습니다: " + paymentId));

        payment.setPaymentStatus("REFUNDED");
        payment.setRefundAmount(refundAmount);
        payment.setCancelReason(refundReason);
        payment.setCancelledAt(LocalDateTime.now());

        log.info("환불 처리 완료 - paymentId: {}, refundAmount: {}", paymentId, refundAmount);

        return paymentRepository.save(payment);
    }
}
