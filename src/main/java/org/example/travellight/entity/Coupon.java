package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "discount_type")
    private DiscountType discountType;

    @Column(nullable = false, name = "discount_value")
    private Integer discountValue;

    @Column(nullable = false, name = "min_purchase_amount")
    private Integer minPurchaseAmount;

    @Column(name = "max_discount_amount")
    private Integer maxDiscountAmount;

    @Column(nullable = false, name = "start_date")
    private LocalDateTime startDate;

    @Column(nullable = false, name = "end_date")
    private LocalDateTime endDate;

    @Column(nullable = false, name = "usage_limit")
    private Integer usageLimit;

    @Column(nullable = false, name = "used_count")
    @Builder.Default
    private Integer usedCount = 0;

    @Column(nullable = false, name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(length = 500)
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (usedCount == null) {
            usedCount = 0;
        }
        if (isActive == null) {
            isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // 할인 타입 Enum
    public enum DiscountType {
        PERCENTAGE,      // 퍼센트 할인
        FIXED_AMOUNT     // 고정 금액 할인
    }

    // 비즈니스 로직 메서드

    /**
     * 쿠폰 사용 가능 여부 확인
     */
    public boolean isAvailable() {
        LocalDateTime now = LocalDateTime.now();
        return isActive
            && usedCount < usageLimit
            && !now.isBefore(startDate)
            && !now.isAfter(endDate);
    }

    /**
     * 쿠폰 사용 처리
     */
    public void use() {
        if (!isAvailable()) {
            throw new IllegalStateException("사용할 수 없는 쿠폰입니다.");
        }
        usedCount++;
    }

    /**
     * 할인 금액 계산
     */
    public int calculateDiscountAmount(int purchaseAmount) {
        if (purchaseAmount < minPurchaseAmount) {
            throw new IllegalArgumentException("최소 구매 금액을 충족하지 못했습니다.");
        }

        int discountAmount;
        if (discountType == DiscountType.PERCENTAGE) {
            discountAmount = (int) (purchaseAmount * discountValue / 100.0);
            if (maxDiscountAmount != null && discountAmount > maxDiscountAmount) {
                discountAmount = maxDiscountAmount;
            }
        } else {
            discountAmount = discountValue;
        }

        return discountAmount;
    }
}
