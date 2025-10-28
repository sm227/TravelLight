package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(name = "payment_id", nullable = false, unique = true)
    private String paymentId; // 포트원 결제 ID

    @Column(name = "transaction_id")
    private String transactionId; // 거래 ID

    @Column(name = "merchant_id")
    private String merchantId; // 가맹점 ID

    @Column(name = "store_id")
    private String storeId; // 스토어 ID

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod; // 결제 방법 (card, paypal, easypay 등)

    @Column(name = "payment_provider")
    private String paymentProvider; // 결제 제공자/PG사 (KCP_V2, TOSSPAYMENTS, PayPal 등)

    @Column(name = "easy_pay_provider")
    private String easyPayProvider; // 간편결제 제공자 (TOSSPAY, NAVERPAY, KAKAOPAY 등)

    @Column(name = "card_company")
    private String cardCompany; // 카드사 (HANA_CARD, SHINHAN_CARD 등)

    @Column(name = "card_type")
    private String cardType; // 카드 타입 (CREDIT, DEBIT 등)

    @Column(name = "card_number")
    private String cardNumber; // 마스킹된 카드번호 (532750******0970)

    @Column(name = "card_name")
    private String cardName; // 카드명 (토스뱅크카드)

    @Column(name = "installment_month")
    private Integer installmentMonth; // 할부 개월 (0이면 일시불)

    @Column(name = "is_interest_free")
    private Boolean isInterestFree; // 무이자 할부 여부

    @Column(name = "approval_number")
    private String approvalNumber; // 승인번호

    @Column(name = "payment_amount")
    private Integer paymentAmount; // 결제 금액

    @Column(name = "payment_status", nullable = false)
    @Builder.Default
    private String paymentStatus = "PENDING"; // 결제 상태 (PENDING, PAID, FAILED, CANCELLED, REFUNDED)

    @Column(name = "payment_time")
    private LocalDateTime paymentTime; // 결제 시간

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt; // 취소 시간

    @Column(name = "cancel_reason")
    private String cancelReason; // 취소 사유

    @Column(name = "refund_amount")
    private Integer refundAmount; // 환불 금액

    @Column(name = "channel_type")
    private String channelType; // 채널 타입 (TEST, LIVE)

    @Column(name = "channel_id")
    private String channelId; // 채널 ID

    @Column(name = "channel_key")
    private String channelKey; // 채널 키

    @Column(name = "channel_name")
    private String channelName; // 채널명

    @Column(name = "pg_merchant_id")
    private String pgMerchantId; // PG사 가맹점 ID

    @Column(name = "pg_transaction_id")
    private String pgTransactionId; // PG사 거래 ID

    @Column(name = "coupon_code")
    private String couponCode; // 사용한 쿠폰 코드

    @Column(name = "coupon_name")
    private String couponName; // 쿠폰명

    @Column(name = "coupon_discount")
    private Integer couponDiscount; // 쿠폰 할인 금액

    @Column(name = "currency")
    private String currency; // 통화 단위 (KRW, USD 등)

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (paymentStatus == null) {
            paymentStatus = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
