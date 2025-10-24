package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.travellight.entity.Coupon.DiscountType;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class CouponDto {

    /**
     * 쿠폰 생성 요청 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "쿠폰 코드는 필수입니다.")
        @Size(max = 50, message = "쿠폰 코드는 50자를 초과할 수 없습니다.")
        private String code;

        @NotBlank(message = "쿠폰명은 필수입니다.")
        @Size(max = 100, message = "쿠폰명은 100자를 초과할 수 없습니다.")
        private String name;

        @NotNull(message = "할인 타입은 필수입니다.")
        private DiscountType discountType;

        @NotNull(message = "할인 값은 필수입니다.")
        @Min(value = 1, message = "할인 값은 1 이상이어야 합니다.")
        private Integer discountValue;

        @NotNull(message = "최소 구매 금액은 필수입니다.")
        @Min(value = 0, message = "최소 구매 금액은 0 이상이어야 합니다.")
        private Integer minPurchaseAmount;

        private Integer maxDiscountAmount;

        @NotNull(message = "시작 날짜는 필수입니다.")
        private LocalDateTime startDate;

        @NotNull(message = "종료 날짜는 필수입니다.")
        private LocalDateTime endDate;

        @NotNull(message = "사용 제한 수량은 필수입니다.")
        @Min(value = 1, message = "사용 제한 수량은 1 이상이어야 합니다.")
        private Integer usageLimit;

        @Size(max = 500, message = "설명은 500자를 초과할 수 없습니다.")
        private String description;
    }

    /**
     * 쿠폰 수정 요청 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        @NotBlank(message = "쿠폰명은 필수입니다.")
        @Size(max = 100, message = "쿠폰명은 100자를 초과할 수 없습니다.")
        private String name;

        @NotNull(message = "할인 타입은 필수입니다.")
        private DiscountType discountType;

        @NotNull(message = "할인 값은 필수입니다.")
        @Min(value = 1, message = "할인 값은 1 이상이어야 합니다.")
        private Integer discountValue;

        @NotNull(message = "최소 구매 금액은 필수입니다.")
        @Min(value = 0, message = "최소 구매 금액은 0 이상이어야 합니다.")
        private Integer minPurchaseAmount;

        private Integer maxDiscountAmount;

        @NotNull(message = "시작 날짜는 필수입니다.")
        private LocalDateTime startDate;

        @NotNull(message = "종료 날짜는 필수입니다.")
        private LocalDateTime endDate;

        @NotNull(message = "사용 제한 수량은 필수입니다.")
        @Min(value = 1, message = "사용 제한 수량은 1 이상이어야 합니다.")
        private Integer usageLimit;

        @NotNull(message = "활성 상태는 필수입니다.")
        private Boolean isActive;

        @Size(max = 500, message = "설명은 500자를 초과할 수 없습니다.")
        private String description;
    }

    /**
     * 쿠폰 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String code;
        private String name;
        private DiscountType discountType;
        private Integer discountValue;
        private Integer minPurchaseAmount;
        private Integer maxDiscountAmount;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private Integer usageLimit;
        private Integer usedCount;
        private Boolean isActive;
        private String description;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    /**
     * 쿠폰 적용 요청 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplyRequest {
        @NotBlank(message = "쿠폰 코드는 필수입니다.")
        private String code;

        @NotNull(message = "구매 금액은 필수입니다.")
        @Min(value = 1, message = "구매 금액은 1 이상이어야 합니다.")
        private Integer purchaseAmount;
    }

    /**
     * 쿠폰 적용 결과 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplyResponse {
        private Long couponId;
        private String couponCode;
        private String couponName;
        private Integer originalAmount;
        private Integer discountAmount;
        private Integer finalAmount;
        private String message;
    }

    /**
     * 쿠폰 통계 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Statistics {
        private Long totalCoupons;
        private Long activeCoupons;
        private Long inactiveCoupons;
        private Long expiredCoupons;
        private Long fullyUsedCoupons;
        private Integer totalUsageCount;
        private Integer totalUsageLimit;
        private Double averageUsageRate;
    }

    /**
     * 사용자 쿠폰 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserCouponResponse {
        private Long userCouponId;
        private Long couponId;
        private String code;
        private String name;
        private DiscountType discountType;
        private Integer discountValue;
        private Integer minPurchaseAmount;
        private Integer maxDiscountAmount;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private String description;
        private Boolean isUsed;
        private LocalDateTime issuedAt;
        private LocalDateTime usedAt;
        private String orderId;
        private Boolean canUse;
    }

    /**
     * 쿠폰 발급 요청 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IssueCouponRequest {
        @NotNull(message = "사용자 ID는 필수입니다.")
        private Long userId;

        @NotBlank(message = "쿠폰 코드는 필수입니다.")
        private String couponCode;
    }

    /**
     * 쿠폰 사용 요청 DTO (UserCoupon 기반)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UseCouponRequest {
        @NotNull(message = "사용자 ID는 필수입니다.")
        private Long userId;

        @NotBlank(message = "쿠폰 코드는 필수입니다.")
        private String couponCode;

        @NotNull(message = "구매 금액은 필수입니다.")
        @Min(value = 1, message = "구매 금액은 1 이상이어야 합니다.")
        private Integer purchaseAmount;

        private String orderId; // 주문 ID
    }
}
