package org.example.travellight.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.CommonApiResponse;
import org.example.travellight.dto.CouponDto;
import org.example.travellight.service.UserCouponService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 사용자 쿠폰 API 컨트롤러
 * - 사용자의 쿠폰 조회 및 사용
 */
@Slf4j
@RestController
@RequestMapping("/api/user-coupons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "User Coupon", description = "사용자 쿠폰 API")
public class UserCouponController {

    private final UserCouponService userCouponService;

    /**
     * 사용자의 모든 쿠폰 조회
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "사용자 쿠폰 조회", description = "특정 사용자의 모든 쿠폰을 조회합니다.")
    public ResponseEntity<CommonApiResponse<List<CouponDto.UserCouponResponse>>> getUserCoupons(
            @PathVariable Long userId
    ) {
        try {
            log.info("사용자 쿠폰 조회 요청: userId={}", userId);
            List<CouponDto.UserCouponResponse> coupons = userCouponService.getUserCoupons(userId);
            return ResponseEntity.ok(CommonApiResponse.success("쿠폰 조회 성공", coupons));
        } catch (Exception e) {
            log.error("사용자 쿠폰 조회 중 오류 발생: userId={}", userId, e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("쿠폰 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사용자의 사용 가능한 쿠폰 조회
     */
    @GetMapping("/user/{userId}/available")
    @Operation(summary = "사용 가능한 쿠폰 조회", description = "사용자가 사용할 수 있는 쿠폰 목록을 조회합니다.")
    public ResponseEntity<CommonApiResponse<List<CouponDto.UserCouponResponse>>> getAvailableUserCoupons(
            @PathVariable Long userId
    ) {
        try {
            log.info("사용 가능한 쿠폰 조회 요청: userId={}", userId);
            List<CouponDto.UserCouponResponse> coupons = userCouponService.getAvailableUserCoupons(userId);
            return ResponseEntity.ok(CommonApiResponse.success("사용 가능한 쿠폰 조회 성공", coupons));
        } catch (Exception e) {
            log.error("사용 가능한 쿠폰 조회 중 오류 발생: userId={}", userId, e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("쿠폰 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 쿠폰 발급 (관리자가 특정 사용자에게 쿠폰 지급)
     */
    @PostMapping("/issue")
    @Operation(summary = "쿠폰 발급", description = "특정 사용자에게 쿠폰을 발급합니다.")
    public ResponseEntity<CommonApiResponse<CouponDto.UserCouponResponse>> issueCoupon(
            @Valid @RequestBody CouponDto.IssueCouponRequest request
    ) {
        try {
            log.info("쿠폰 발급 요청: userId={}, couponCode={}", request.getUserId(), request.getCouponCode());
            CouponDto.UserCouponResponse response = userCouponService.issueCoupon(
                    request.getUserId(),
                    request.getCouponCode()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(CommonApiResponse.success("쿠폰이 성공적으로 발급되었습니다.", response));
        } catch (Exception e) {
            log.error("쿠폰 발급 중 오류 발생", e);
            return ResponseEntity.badRequest()
                    .body(CommonApiResponse.error("쿠폰 발급 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 쿠폰 검증 (실제 사용하지 않고 검증만 수행)
     */
    @PostMapping("/validate")
    @Operation(summary = "쿠폰 검증", description = "쿠폰을 검증하고 할인 금액을 미리 계산합니다. 실제로 사용하지는 않습니다.")
    public ResponseEntity<CommonApiResponse<CouponDto.ApplyResponse>> validateCoupon(
            @Valid @RequestBody CouponDto.UseCouponRequest request
    ) {
        try {
            log.info("쿠폰 검증 요청: userId={}, couponCode={}, amount={}",
                    request.getUserId(), request.getCouponCode(), request.getPurchaseAmount());
            CouponDto.ApplyResponse response = userCouponService.validateCoupon(
                    request.getUserId(),
                    request.getCouponCode(),
                    request.getPurchaseAmount()
            );
            return ResponseEntity.ok(CommonApiResponse.success("쿠폰이 확인되었습니다.", response));
        } catch (Exception e) {
            log.error("쿠폰 검증 중 오류 발생", e);
            return ResponseEntity.badRequest()
                    .body(CommonApiResponse.error("쿠폰 검증 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 쿠폰 사용
     */
    @PostMapping("/use")
    @Operation(summary = "쿠폰 사용", description = "쿠폰을 사용하고 할인 금액을 계산합니다.")
    public ResponseEntity<CommonApiResponse<CouponDto.ApplyResponse>> useCoupon(
            @Valid @RequestBody CouponDto.UseCouponRequest request
    ) {
        try {
            log.info("쿠폰 사용 요청: userId={}, couponCode={}, amount={}",
                    request.getUserId(), request.getCouponCode(), request.getPurchaseAmount());
            CouponDto.ApplyResponse response = userCouponService.useCoupon(
                    request.getUserId(),
                    request.getCouponCode(),
                    request.getPurchaseAmount(),
                    request.getOrderId()
            );
            return ResponseEntity.ok(CommonApiResponse.success("쿠폰이 성공적으로 사용되었습니다.", response));
        } catch (Exception e) {
            log.error("쿠폰 사용 중 오류 발생", e);
            return ResponseEntity.badRequest()
                    .body(CommonApiResponse.error("쿠폰 사용 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 웰컴 쿠폰 발급 (수동 발급용)
     */
    @PostMapping("/user/{userId}/welcome")
    @Operation(summary = "웰컴 쿠폰 발급", description = "사용자에게 웰컴 쿠폰을 발급합니다.")
    public ResponseEntity<CommonApiResponse<CouponDto.UserCouponResponse>> issueWelcomeCoupon(
            @PathVariable Long userId
    ) {
        try {
            log.info("웰컴 쿠폰 발급 요청: userId={}", userId);
            CouponDto.UserCouponResponse response = userCouponService.issueWelcomeCoupon(userId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(CommonApiResponse.success("웰컴 쿠폰이 성공적으로 발급되었습니다.", response));
        } catch (Exception e) {
            log.error("웰컴 쿠폰 발급 중 오류 발생: userId={}", userId, e);
            return ResponseEntity.badRequest()
                    .body(CommonApiResponse.error("웰컴 쿠폰 발급 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사용자가 특정 쿠폰을 보유하고 있는지 확인
     */
    @GetMapping("/user/{userId}/has/{couponCode}")
    @Operation(summary = "쿠폰 보유 확인", description = "사용자가 특정 쿠폰을 보유하고 있는지 확인합니다.")
    public ResponseEntity<CommonApiResponse<Boolean>> hasUserCoupon(
            @PathVariable Long userId,
            @PathVariable String couponCode
    ) {
        try {
            log.info("쿠폰 보유 확인 요청: userId={}, couponCode={}", userId, couponCode);
            boolean hasCoupon = userCouponService.hasUserCoupon(userId, couponCode);
            return ResponseEntity.ok(CommonApiResponse.success("조회 성공", hasCoupon));
        } catch (Exception e) {
            log.error("쿠폰 보유 확인 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("확인 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사용자에게 알림으로 보여줄 쿠폰 목록 조회
     * (아직 받지 않은 사용 가능한 쿠폰)
     */
    @GetMapping("/user/{userId}/notifications")
    @Operation(summary = "알림 쿠폰 조회", description = "사용자에게 알림으로 보여줄 쿠폰 목록을 조회합니다.")
    public ResponseEntity<CommonApiResponse<List<CouponDto.Response>>> getNotificationCoupons(
            @PathVariable Long userId
    ) {
        try {
            log.info("알림 쿠폰 조회 요청: userId={}", userId);
            List<org.example.travellight.entity.Coupon> coupons = userCouponService.getNotificationCoupons(userId);

            // Coupon 엔티티를 DTO로 변환
            List<CouponDto.Response> response = coupons.stream()
                    .map(coupon -> CouponDto.Response.builder()
                            .id(coupon.getId())
                            .code(coupon.getCode())
                            .name(coupon.getName())
                            .discountType(coupon.getDiscountType())
                            .discountValue(coupon.getDiscountValue())
                            .minPurchaseAmount(coupon.getMinPurchaseAmount())
                            .maxDiscountAmount(coupon.getMaxDiscountAmount())
                            .startDate(coupon.getStartDate())
                            .endDate(coupon.getEndDate())
                            .usageLimit(coupon.getUsageLimit())
                            .usedCount(coupon.getUsedCount())
                            .isActive(coupon.getIsActive())
                            .description(coupon.getDescription())
                            .createdAt(coupon.getCreatedAt())
                            .updatedAt(coupon.getUpdatedAt())
                            .build())
                    .collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(CommonApiResponse.success("알림 쿠폰 조회 성공", response));
        } catch (Exception e) {
            log.error("알림 쿠폰 조회 중 오류 발생: userId={}", userId, e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("알림 쿠폰 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 웰컴 쿠폰 사용 여부 확인
     */
    @GetMapping("/user/{userId}/welcome-used")
    @Operation(summary = "웰컴 쿠폰 사용 여부", description = "사용자가 웰컴 쿠폰을 사용했는지 확인합니다.")
    public ResponseEntity<CommonApiResponse<Boolean>> hasUsedWelcomeCoupon(
            @PathVariable Long userId
    ) {
        try {
            log.info("웰컴 쿠폰 사용 여부 확인: userId={}", userId);
            boolean hasUsed = userCouponService.hasUsedWelcomeCoupon(userId);
            return ResponseEntity.ok(CommonApiResponse.success("조회 성공", hasUsed));
        } catch (Exception e) {
            log.error("웰컴 쿠폰 사용 여부 확인 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("확인 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}
