package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_coupons",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "coupon_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCoupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @Column(nullable = false, name = "is_used")
    @Builder.Default
    private Boolean isUsed = false;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @Column(name = "order_id")
    private String orderId; // 사용된 주문 ID

    @PrePersist
    protected void onCreate() {
        if (issuedAt == null) {
            issuedAt = LocalDateTime.now();
        }
        if (isUsed == null) {
            isUsed = false;
        }
    }

    /**
     * 쿠폰 사용 가능 여부 확인
     */
    public boolean canUse() {
        return !isUsed && coupon.isAvailable();
    }

    /**
     * 쿠폰 사용 처리
     */
    public void use(String orderId) {
        if (!canUse()) {
            throw new IllegalStateException("사용할 수 없는 쿠폰입니다.");
        }
        this.isUsed = true;
        this.usedAt = LocalDateTime.now();
        this.orderId = orderId;

        // Coupon의 사용 횟수도 증가
        coupon.use();
    }
}
