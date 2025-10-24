package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import org.example.travellight.dto.CouponDto;
import org.example.travellight.entity.Coupon;
import org.example.travellight.exception.CustomException;
import org.example.travellight.repository.CouponRepository;
import org.example.travellight.repository.UserCouponRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final UserCouponRepository userCouponRepository;

    /**
     * 모든 쿠폰 조회
     */
    @Transactional(readOnly = true)
    public List<CouponDto.Response> getAllCoupons() {
        return couponRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 쿠폰 ID로 조회
     */
    @Transactional(readOnly = true)
    public CouponDto.Response getCouponById(Long id) {
        Coupon coupon = findCouponById(id);
        return convertToResponse(coupon);
    }

    /**
     * 쿠폰 코드로 조회
     */
    @Transactional(readOnly = true)
    public CouponDto.Response getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new CustomException("해당 쿠폰을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        return convertToResponse(coupon);
    }

    /**
     * 사용 가능한 쿠폰 조회
     */
    @Transactional(readOnly = true)
    public List<CouponDto.Response> getAvailableCoupons() {
        return couponRepository.findAvailableCoupons(LocalDateTime.now())
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 쿠폰 생성
     */
    @Transactional
    public CouponDto.Response createCoupon(CouponDto.CreateRequest request) {
        // 쿠폰 코드 중복 확인
        if (couponRepository.existsByCode(request.getCode())) {
            throw new CustomException("이미 존재하는 쿠폰 코드입니다.", HttpStatus.BAD_REQUEST);
        }

        // 날짜 유효성 검증
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new CustomException("종료 날짜는 시작 날짜보다 이후여야 합니다.", HttpStatus.BAD_REQUEST);
        }

        // 퍼센트 할인인 경우 값 검증
        if (request.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            if (request.getDiscountValue() > 100) {
                throw new CustomException("할인율은 100%를 초과할 수 없습니다.", HttpStatus.BAD_REQUEST);
            }
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode())
                .name(request.getName())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minPurchaseAmount(request.getMinPurchaseAmount())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .usageLimit(request.getUsageLimit())
                .description(request.getDescription())
                .build();

        coupon = couponRepository.save(coupon);
        return convertToResponse(coupon);
    }

    /**
     * 쿠폰 수정
     */
    @Transactional
    public CouponDto.Response updateCoupon(Long id, CouponDto.UpdateRequest request) {
        Coupon coupon = findCouponById(id);

        // 날짜 유효성 검증
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new CustomException("종료 날짜는 시작 날짜보다 이후여야 합니다.", HttpStatus.BAD_REQUEST);
        }

        // 퍼센트 할인인 경우 값 검증
        if (request.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            if (request.getDiscountValue() > 100) {
                throw new CustomException("할인율은 100%를 초과할 수 없습니다.", HttpStatus.BAD_REQUEST);
            }
        }

        // 사용 제한이 이미 사용된 수량보다 작은 경우 검증
        if (request.getUsageLimit() < coupon.getUsedCount()) {
            throw new CustomException(
                    String.format("사용 제한 수량은 이미 사용된 수량(%d)보다 작을 수 없습니다.", coupon.getUsedCount()),
                    HttpStatus.BAD_REQUEST
            );
        }

        coupon.setName(request.getName());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinPurchaseAmount(request.getMinPurchaseAmount());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setStartDate(request.getStartDate());
        coupon.setEndDate(request.getEndDate());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setIsActive(request.getIsActive());
        coupon.setDescription(request.getDescription());

        coupon = couponRepository.save(coupon);
        return convertToResponse(coupon);
    }

    /**
     * 쿠폰 삭제
     */
    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = findCouponById(id);

        // 사용자가 발급받은 쿠폰이 있는 경우 삭제 불가
        Long issuedCount = userCouponRepository.countByCouponId(id);
        if (issuedCount != null && issuedCount > 0) {
            throw new CustomException(
                    String.format("사용자가 이미 발급받은 쿠폰입니다. (%d명 발급) 삭제 대신 비활성화를 사용하세요.", issuedCount),
                    HttpStatus.BAD_REQUEST
            );
        }

        couponRepository.delete(coupon);
    }

    /**
     * 쿠폰 활성화/비활성화
     */
    @Transactional
    public CouponDto.Response toggleCouponStatus(Long id) {
        Coupon coupon = findCouponById(id);
        coupon.setIsActive(!coupon.getIsActive());
        coupon = couponRepository.save(coupon);
        return convertToResponse(coupon);
    }

    /**
     * 쿠폰 적용 (할인 금액 계산)
     */
    @Transactional
    public CouponDto.ApplyResponse applyCoupon(CouponDto.ApplyRequest request) {
        Coupon coupon = couponRepository.findByCode(request.getCode())
                .orElseThrow(() -> new CustomException("유효하지 않은 쿠폰 코드입니다.", HttpStatus.NOT_FOUND));

        // 쿠폰 사용 가능 여부 확인
        if (!coupon.isAvailable()) {
            throw new CustomException("사용할 수 없는 쿠폰입니다.", HttpStatus.BAD_REQUEST);
        }

        // 최소 구매 금액 확인
        if (request.getPurchaseAmount() < coupon.getMinPurchaseAmount()) {
            throw new CustomException(
                    String.format("최소 구매 금액(%d원)을 충족하지 못했습니다.", coupon.getMinPurchaseAmount()),
                    HttpStatus.BAD_REQUEST
            );
        }

        // 할인 금액 계산
        int discountAmount = coupon.calculateDiscountAmount(request.getPurchaseAmount());
        int finalAmount = request.getPurchaseAmount() - discountAmount;

        // 쿠폰 사용 처리
        coupon.use();
        couponRepository.save(coupon);

        return CouponDto.ApplyResponse.builder()
                .couponId(coupon.getId())
                .couponCode(coupon.getCode())
                .couponName(coupon.getName())
                .originalAmount(request.getPurchaseAmount())
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .message("쿠폰이 성공적으로 적용되었습니다.")
                .build();
    }

    /**
     * 쿠폰 통계 조회
     */
    @Transactional(readOnly = true)
    public CouponDto.Statistics getCouponStatistics() {
        List<Coupon> allCoupons = couponRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        long activeCoupons = allCoupons.stream().filter(Coupon::getIsActive).count();
        long inactiveCoupons = allCoupons.stream().filter(c -> !c.getIsActive()).count();
        long expiredCoupons = allCoupons.stream().filter(c -> c.getEndDate().isBefore(now)).count();
        long fullyUsedCoupons = allCoupons.stream().filter(c -> c.getUsedCount() >= c.getUsageLimit()).count();

        int totalUsageCount = allCoupons.stream().mapToInt(Coupon::getUsedCount).sum();
        int totalUsageLimit = allCoupons.stream().mapToInt(Coupon::getUsageLimit).sum();
        double averageUsageRate = totalUsageLimit > 0 ? (double) totalUsageCount / totalUsageLimit * 100 : 0;

        return CouponDto.Statistics.builder()
                .totalCoupons((long) allCoupons.size())
                .activeCoupons(activeCoupons)
                .inactiveCoupons(inactiveCoupons)
                .expiredCoupons(expiredCoupons)
                .fullyUsedCoupons(fullyUsedCoupons)
                .totalUsageCount(totalUsageCount)
                .totalUsageLimit(totalUsageLimit)
                .averageUsageRate(Math.round(averageUsageRate * 10) / 10.0)
                .build();
    }

    // Private helper methods

    private Coupon findCouponById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new CustomException("해당 쿠폰을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
    }

    private CouponDto.Response convertToResponse(Coupon coupon) {
        return CouponDto.Response.builder()
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
                .build();
    }
}
