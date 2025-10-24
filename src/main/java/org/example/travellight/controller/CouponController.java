package org.example.travellight.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.CommonApiResponse;
import org.example.travellight.dto.CouponDto;
import org.example.travellight.service.CouponService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 쿠폰 관리 API 컨트롤러
 * - 관리자 쿠폰 생성, 수정, 삭제
 * - 사용자 쿠폰 조회 및 적용
 */
@Slf4j
@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Coupon", description = "쿠폰 관리 API")
public class CouponController {

    private final CouponService couponService;

    /**
     * 모든 쿠폰 조회
     */
    @GetMapping
    @Operation(summary = "모든 쿠폰 조회", description = "모든 쿠폰 목록을 조회합니다.")
    public ResponseEntity<CommonApiResponse<List<CouponDto.Response>>> getAllCoupons() {
        try {
            log.info("쿠폰 목록 조회 요청");
            List<CouponDto.Response> coupons = couponService.getAllCoupons();
            return ResponseEntity.ok(CommonApiResponse.success("쿠폰 목록 조회 성공", coupons));
        } catch (Exception e) {
            log.error("쿠폰 목록 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("쿠폰 목록 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 쿠폰 ID로 조회
     */
    @GetMapping("/{id}")
    @Operation(summary = "쿠폰 조회", description = "ID로 특정 쿠폰을 조회합니다.")
    public ResponseEntity<CommonApiResponse<CouponDto.Response>> getCouponById(@PathVariable Long id) {
        try {
            log.info("쿠폰 조회 요청: id={}", id);
            CouponDto.Response coupon = couponService.getCouponById(id);
            return ResponseEntity.ok(CommonApiResponse.success("쿠폰 조회 성공", coupon));
        } catch (Exception e) {
            log.error("쿠폰 조회 중 오류 발생: id={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(CommonApiResponse.error("쿠폰 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 쿠폰 코드로 조회
     */
    @GetMapping("/code/{code}")
    @Operation(summary = "쿠폰 코드로 조회", description = "쿠폰 코드로 특정 쿠폰을 조회합니다.")
    public ResponseEntity<CommonApiResponse<CouponDto.Response>> getCouponByCode(@PathVariable String code) {
        try {
            log.info("쿠폰 코드 조회 요청: code={}", code);
            CouponDto.Response coupon = couponService.getCouponByCode(code);
            return ResponseEntity.ok(CommonApiResponse.success("쿠폰 조회 성공", coupon));
        } catch (Exception e) {
            log.error("쿠폰 코드 조회 중 오류 발생: code={}", code, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(CommonApiResponse.error("쿠폰 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사용 가능한 쿠폰 조회
     */
    @GetMapping("/available")
    @Operation(summary = "사용 가능한 쿠폰 조회", description = "현재 사용 가능한 쿠폰 목록을 조회합니다.")
    public ResponseEntity<CommonApiResponse<List<CouponDto.Response>>> getAvailableCoupons() {
        try {
            log.info("사용 가능한 쿠폰 조회 요청");
            List<CouponDto.Response> coupons = couponService.getAvailableCoupons();
            return ResponseEntity.ok(CommonApiResponse.success("사용 가능한 쿠폰 조회 성공", coupons));
        } catch (Exception e) {
            log.error("사용 가능한 쿠폰 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("사용 가능한 쿠폰 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 쿠폰 생성 (관리자 전용)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "쿠폰 생성", description = "새로운 쿠폰을 생성합니다. (관리자 전용)")
    public ResponseEntity<CommonApiResponse<CouponDto.Response>> createCoupon(
            @Valid @RequestBody CouponDto.CreateRequest request
    ) {
        try {
            log.info("쿠폰 생성 요청: code={}, name={}", request.getCode(), request.getName());
            CouponDto.Response coupon = couponService.createCoupon(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(CommonApiResponse.success("쿠폰이 성공적으로 생성되었습니다.", coupon));
        } catch (Exception e) {
            log.error("쿠폰 생성 중 오류 발생", e);
            return ResponseEntity.badRequest()
                    .body(CommonApiResponse.error("쿠폰 생성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 쿠폰 수정 (관리자 전용)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "쿠폰 수정", description = "기존 쿠폰을 수정합니다. (관리자 전용)")
    public ResponseEntity<CommonApiResponse<CouponDto.Response>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponDto.UpdateRequest request
    ) {
        try {
            log.info("쿠폰 수정 요청: id={}", id);
            CouponDto.Response coupon = couponService.updateCoupon(id, request);
            return ResponseEntity.ok(CommonApiResponse.success("쿠폰이 성공적으로 수정되었습니다.", coupon));
        } catch (Exception e) {
            log.error("쿠폰 수정 중 오류 발생: id={}", id, e);
            return ResponseEntity.badRequest()
                    .body(CommonApiResponse.error("쿠폰 수정 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 쿠폰 삭제 (관리자 전용)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "쿠폰 삭제", description = "쿠폰을 삭제합니다. (관리자 전용)")
    public ResponseEntity<CommonApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        try {
            log.info("쿠폰 삭제 요청: id={}", id);
            couponService.deleteCoupon(id);
            return ResponseEntity.ok(CommonApiResponse.success("쿠폰이 성공적으로 삭제되었습니다.", null));
        } catch (Exception e) {
            log.error("쿠폰 삭제 중 오류 발생: id={}", id, e);
            return ResponseEntity.badRequest()
                    .body(CommonApiResponse.error("쿠폰 삭제 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 쿠폰 활성화/비활성화 토글 (관리자 전용)
     */
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "쿠폰 활성화/비활성화", description = "쿠폰의 활성화 상태를 토글합니다. (관리자 전용)")
    public ResponseEntity<CommonApiResponse<CouponDto.Response>> toggleCouponStatus(@PathVariable Long id) {
        try {
            log.info("쿠폰 상태 토글 요청: id={}", id);
            CouponDto.Response coupon = couponService.toggleCouponStatus(id);
            return ResponseEntity.ok(CommonApiResponse.success("쿠폰 상태가 변경되었습니다.", coupon));
        } catch (Exception e) {
            log.error("쿠폰 상태 토글 중 오류 발생: id={}", id, e);
            return ResponseEntity.badRequest()
                    .body(CommonApiResponse.error("쿠폰 상태 변경 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 쿠폰 적용
     */
    @PostMapping("/apply")
    @Operation(summary = "쿠폰 적용", description = "쿠폰을 적용하고 할인 금액을 계산합니다.")
    public ResponseEntity<CommonApiResponse<CouponDto.ApplyResponse>> applyCoupon(
            @Valid @RequestBody CouponDto.ApplyRequest request
    ) {
        try {
            log.info("쿠폰 적용 요청: code={}, amount={}", request.getCode(), request.getPurchaseAmount());
            CouponDto.ApplyResponse result = couponService.applyCoupon(request);
            return ResponseEntity.ok(CommonApiResponse.success("쿠폰이 성공적으로 적용되었습니다.", result));
        } catch (Exception e) {
            log.error("쿠폰 적용 중 오류 발생", e);
            return ResponseEntity.badRequest()
                    .body(CommonApiResponse.error("쿠폰 적용 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 쿠폰 통계 조회 (관리자 전용)
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "쿠폰 통계 조회", description = "쿠폰 통계 정보를 조회합니다. (관리자 전용)")
    public ResponseEntity<CommonApiResponse<CouponDto.Statistics>> getCouponStatistics() {
        try {
            log.info("쿠폰 통계 조회 요청");
            CouponDto.Statistics statistics = couponService.getCouponStatistics();
            return ResponseEntity.ok(CommonApiResponse.success("쿠폰 통계 조회 성공", statistics));
        } catch (Exception e) {
            log.error("쿠폰 통계 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(CommonApiResponse.error("쿠폰 통계 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}
