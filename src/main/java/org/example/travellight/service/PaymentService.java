package org.example.travellight.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper;

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

        // channel 정보를 먼저 확인 (PayPal 등 일부 결제는 method가 없을 수 있음)
        String paymentProvider = null;
        if (paymentInfo.get("channel") != null) {
            Map<String, Object> channel = (Map<String, Object>) paymentInfo.get("channel");
            if (channel.get("pgProvider") != null) {
                paymentProvider = (String) channel.get("pgProvider");
                log.info("PG Provider 확인: {}", paymentProvider);
            }
        }

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
            } else if (methodType != null) {
                builder.paymentMethod(methodType.toLowerCase());
            }
        } else {
            // method가 없는 경우 (PayPal 등)
            log.warn("method 정보가 없습니다. pgProvider 기반으로 결제 수단 설정: {}", paymentProvider);

            // pgProvider 기반으로 결제 수단 설정
            if (paymentProvider != null && paymentProvider.contains("PAYPAL")) {
                builder.paymentMethod("paypal");
                log.info("PayPal 결제로 설정");
            } else {
                // 기본값 설정
                builder.paymentMethod("other");
                log.warn("결제 수단을 'other'로 설정");
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

        // 통화 정보 추출
        if (paymentInfo.get("currency") != null) {
            builder.currency((String) paymentInfo.get("currency"));
            log.info("통화 단위: {}", paymentInfo.get("currency"));
        } else {
            // 기본값은 KRW
            builder.currency("KRW");
            log.info("통화 정보가 없어 기본값 KRW로 설정");
        }

        // 결제 금액 및 할인 정보 (쿠폰 포함)
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

                // 할인 정보 추출 (쿠폰)
                if (amount.get("discount") != null) {
                    Object discountObj = amount.get("discount");
                    Integer discountAmount = null;

                    if (discountObj instanceof Integer) {
                        discountAmount = (Integer) discountObj;
                    } else if (discountObj instanceof Long) {
                        discountAmount = ((Long) discountObj).intValue();
                    } else if (discountObj instanceof Double) {
                        discountAmount = ((Double) discountObj).intValue();
                    } else if (discountObj != null) {
                        discountAmount = Integer.parseInt(discountObj.toString());
                    }

                    if (discountAmount != null && discountAmount > 0) {
                        builder.couponDiscount(discountAmount);
                        log.info("쿠폰 할인 금액: {}", discountAmount);
                    }
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

        // customData에서 쿠폰 정보 추출
        if (paymentInfo.get("customData") != null) {
            try {
                Object customDataObj = paymentInfo.get("customData");
                Map<String, Object> customData = null;

                // customData가 String인 경우 JSON 파싱
                if (customDataObj instanceof String) {
                    String customDataStr = (String) customDataObj;
                    log.info("customData를 String에서 파싱: {}", customDataStr);
                    customData = objectMapper.readValue(customDataStr, new TypeReference<Map<String, Object>>() {});
                } else if (customDataObj instanceof Map) {
                    // 이미 Map인 경우
                    customData = (Map<String, Object>) customDataObj;
                }

                if (customData != null) {
                    log.info("customData 파싱 완료: {}", customData);

                    if (customData.get("reservationData") != null) {
                        Object reservationDataObj = customData.get("reservationData");
                        Map<String, Object> reservationData = null;

                        // reservationData도 String일 수 있으므로 체크
                        if (reservationDataObj instanceof String) {
                            reservationData = objectMapper.readValue((String) reservationDataObj, new TypeReference<Map<String, Object>>() {});
                        } else if (reservationDataObj instanceof Map) {
                            reservationData = (Map<String, Object>) reservationDataObj;
                        }

                        if (reservationData != null) {
                            log.info("reservationData 파싱 완료: {}", reservationData);

                            // 쿠폰 관련 필드 디버깅
                            Object couponCodeValue = reservationData.get("couponCode");
                            Object couponNameValue = reservationData.get("couponName");
                            Object couponDiscountValue = reservationData.get("couponDiscount");

                            log.info("쿠폰 필드 확인 - couponCode: {} (타입: {}), couponName: {} (타입: {}), couponDiscount: {} (타입: {})",
                                couponCodeValue,
                                couponCodeValue != null ? couponCodeValue.getClass().getName() : "null",
                                couponNameValue,
                                couponNameValue != null ? couponNameValue.getClass().getName() : "null",
                                couponDiscountValue,
                                couponDiscountValue != null ? couponDiscountValue.getClass().getName() : "null");

                            // 쿠폰 코드
                            if (couponCodeValue != null) {
                                String couponCodeStr = couponCodeValue.toString();
                                builder.couponCode(couponCodeStr);
                                log.info("쿠폰 코드 추출 성공: {}", couponCodeStr);
                            } else {
                                log.warn("쿠폰 코드가 null입니다");
                            }

                            // 쿠폰 이름
                            if (couponNameValue != null) {
                                String couponNameStr = couponNameValue.toString();
                                builder.couponName(couponNameStr);
                                log.info("쿠폰 이름 추출 성공: {}", couponNameStr);
                            } else {
                                log.warn("쿠폰 이름이 null입니다");
                            }

                            // 쿠폰 할인 금액
                            if (couponDiscountValue != null) {
                                Integer discountAmount = null;

                                if (couponDiscountValue instanceof Integer) {
                                    discountAmount = (Integer) couponDiscountValue;
                                } else if (couponDiscountValue instanceof Long) {
                                    discountAmount = ((Long) couponDiscountValue).intValue();
                                } else if (couponDiscountValue instanceof Double) {
                                    discountAmount = ((Double) couponDiscountValue).intValue();
                                } else {
                                    try {
                                        discountAmount = Integer.parseInt(couponDiscountValue.toString());
                                    } catch (NumberFormatException e) {
                                        log.error("쿠폰 할인 금액 파싱 실패: {}", couponDiscountValue, e);
                                    }
                                }

                                if (discountAmount != null && discountAmount > 0) {
                                    builder.couponDiscount(discountAmount);
                                    log.info("쿠폰 할인 금액 추출 성공: {}원", discountAmount);
                                } else {
                                    log.warn("쿠폰 할인 금액이 0이거나 유효하지 않습니다: {}", discountAmount);
                                }
                            } else {
                                log.warn("쿠폰 할인 금액이 null입니다");
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.error("customData 파싱 중 오류 발생", e);
            }
        }

        // 최상위 레벨에서도 쿠폰 정보 확인 (PortOne이 어떤 구조로 보내는지 확실하지 않으므로)
        if (paymentInfo.get("promotionId") != null) {
            builder.couponCode((String) paymentInfo.get("promotionId"));
            log.info("최상위에서 쿠폰 코드 추출: {}", paymentInfo.get("promotionId"));
        }
        if (paymentInfo.get("couponCode") != null) {
            builder.couponCode((String) paymentInfo.get("couponCode"));
            log.info("최상위에서 쿠폰 코드 추출: {}", paymentInfo.get("couponCode"));
        }
        if (paymentInfo.get("couponName") != null) {
            builder.couponName((String) paymentInfo.get("couponName"));
            log.info("최상위에서 쿠폰 이름 추출: {}", paymentInfo.get("couponName"));
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
