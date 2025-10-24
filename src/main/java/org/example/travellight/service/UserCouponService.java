package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.CouponDto;
import org.example.travellight.entity.Coupon;
import org.example.travellight.entity.User;
import org.example.travellight.entity.UserCoupon;
import org.example.travellight.exception.CustomException;
import org.example.travellight.repository.CouponRepository;
import org.example.travellight.repository.UserCouponRepository;
import org.example.travellight.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserCouponService {

    private final UserCouponRepository userCouponRepository;
    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    public static final String WELCOME_COUPON_CODE = "WELCOME20";

    /**
     * 사용자에게 웰컴 쿠폰 발급
     */
    @Transactional
    public CouponDto.UserCouponResponse issueWelcomeCoupon(Long userId) {
        User user = findUserById(userId);

        // 이미 웰컴 쿠폰을 받았는지 확인
        if (userCouponRepository.existsByUserIdAndCouponCode(userId, WELCOME_COUPON_CODE)) {
            log.info("사용자 {}는 이미 웰컴 쿠폰을 받았습니다.", userId);
            throw new CustomException("이미 웰컴 쿠폰을 받으셨습니다.", HttpStatus.BAD_REQUEST);
        }

        // 웰컴 쿠폰 조회
        Coupon welcomeCoupon = couponRepository.findByCode(WELCOME_COUPON_CODE)
                .orElseThrow(() -> new CustomException("웰컴 쿠폰이 존재하지 않습니다.", HttpStatus.NOT_FOUND));

        // 쿠폰이 사용 가능한지 확인
        if (!welcomeCoupon.isAvailable()) {
            throw new CustomException("웰컴 쿠폰이 현재 사용할 수 없습니다.", HttpStatus.BAD_REQUEST);
        }

        // UserCoupon 생성
        UserCoupon userCoupon = UserCoupon.builder()
                .user(user)
                .coupon(welcomeCoupon)
                .isUsed(false)
                .issuedAt(LocalDateTime.now())
                .build();

        userCoupon = userCouponRepository.save(userCoupon);
        log.info("사용자 {}에게 웰컴 쿠폰 발급 완료", userId);

        return convertToUserCouponResponse(userCoupon);
    }

    /**
     * 특정 쿠폰을 사용자에게 발급
     */
    @Transactional
    public CouponDto.UserCouponResponse issueCoupon(Long userId, String couponCode) {
        User user = findUserById(userId);

        // 이미 해당 쿠폰을 받았는지 확인
        if (userCouponRepository.existsByUserIdAndCouponCode(userId, couponCode)) {
            throw new CustomException("이미 해당 쿠폰을 보유하고 있습니다.", HttpStatus.BAD_REQUEST);
        }

        // 쿠폰 조회
        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new CustomException("유효하지 않은 쿠폰 코드입니다.", HttpStatus.NOT_FOUND));

        // 쿠폰이 사용 가능한지 확인
        if (!coupon.isAvailable()) {
            throw new CustomException("해당 쿠폰은 현재 사용할 수 없습니다.", HttpStatus.BAD_REQUEST);
        }

        // UserCoupon 생성
        UserCoupon userCoupon = UserCoupon.builder()
                .user(user)
                .coupon(coupon)
                .isUsed(false)
                .issuedAt(LocalDateTime.now())
                .build();

        userCoupon = userCouponRepository.save(userCoupon);
        log.info("사용자 {}에게 쿠폰 {} 발급 완료", userId, couponCode);

        return convertToUserCouponResponse(userCoupon);
    }

    /**
     * 사용자의 모든 쿠폰 조회
     */
    @Transactional(readOnly = true)
    public List<CouponDto.UserCouponResponse> getUserCoupons(Long userId) {
        return userCouponRepository.findByUserIdOrderByIssuedAtDesc(userId)
                .stream()
                .map(this::convertToUserCouponResponse)
                .collect(Collectors.toList());
    }

    /**
     * 사용자의 사용 가능한 쿠폰 조회
     */
    @Transactional(readOnly = true)
    public List<CouponDto.UserCouponResponse> getAvailableUserCoupons(Long userId) {
        return userCouponRepository.findAvailableByUserId(userId)
                .stream()
                .map(this::convertToUserCouponResponse)
                .collect(Collectors.toList());
    }

    /**
     * 쿠폰 검증 및 할인 금액 계산 (실제 사용하지 않음)
     */
    @Transactional(readOnly = true)
    public CouponDto.ApplyResponse validateCoupon(Long userId, String couponCode, Integer purchaseAmount) {
        // 사용자의 해당 쿠폰 조회
        UserCoupon userCoupon = userCouponRepository.findByUserIdAndCouponCode(userId, couponCode)
                .orElseThrow(() -> new CustomException("보유하지 않은 쿠폰입니다.", HttpStatus.NOT_FOUND));

        // 쿠폰 사용 가능 여부 확인
        if (!userCoupon.canUse()) {
            throw new CustomException("사용할 수 없는 쿠폰입니다.", HttpStatus.BAD_REQUEST);
        }

        Coupon coupon = userCoupon.getCoupon();

        // 최소 구매 금액 확인
        if (purchaseAmount < coupon.getMinPurchaseAmount()) {
            throw new CustomException(
                    String.format("최소 구매 금액(%d원)을 충족하지 못했습니다.", coupon.getMinPurchaseAmount()),
                    HttpStatus.BAD_REQUEST
            );
        }

        // 할인 금액 계산
        int discountAmount = coupon.calculateDiscountAmount(purchaseAmount);
        int finalAmount = purchaseAmount - discountAmount;

        log.info("사용자 {}의 쿠폰 {} 검증 완료. 할인금액: {}", userId, couponCode, discountAmount);

        return CouponDto.ApplyResponse.builder()
                .couponId(coupon.getId())
                .couponCode(coupon.getCode())
                .couponName(coupon.getName())
                .originalAmount(purchaseAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .message("쿠폰이 확인되었습니다.")
                .build();
    }

    /**
     * 쿠폰 사용 및 할인 금액 계산
     */
    @Transactional
    public CouponDto.ApplyResponse useCoupon(Long userId, String couponCode, Integer purchaseAmount, String orderId) {
        // 사용자의 해당 쿠폰 조회
        UserCoupon userCoupon = userCouponRepository.findByUserIdAndCouponCode(userId, couponCode)
                .orElseThrow(() -> new CustomException("보유하지 않은 쿠폰입니다.", HttpStatus.NOT_FOUND));

        // 쿠폰 사용 가능 여부 확인
        if (!userCoupon.canUse()) {
            throw new CustomException("사용할 수 없는 쿠폰입니다.", HttpStatus.BAD_REQUEST);
        }

        Coupon coupon = userCoupon.getCoupon();

        // 최소 구매 금액 확인
        if (purchaseAmount < coupon.getMinPurchaseAmount()) {
            throw new CustomException(
                    String.format("최소 구매 금액(%d원)을 충족하지 못했습니다.", coupon.getMinPurchaseAmount()),
                    HttpStatus.BAD_REQUEST
            );
        }

        // 할인 금액 계산
        int discountAmount = coupon.calculateDiscountAmount(purchaseAmount);
        int finalAmount = purchaseAmount - discountAmount;

        // 쿠폰 사용 처리
        userCoupon.use(orderId);
        userCouponRepository.save(userCoupon);

        log.info("사용자 {}가 쿠폰 {} 사용 완료. 주문ID: {}", userId, couponCode, orderId);

        return CouponDto.ApplyResponse.builder()
                .couponId(coupon.getId())
                .couponCode(coupon.getCode())
                .couponName(coupon.getName())
                .originalAmount(purchaseAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .message("쿠폰이 성공적으로 적용되었습니다.")
                .build();
    }

    /**
     * 웰컴 쿠폰 생성 (시스템 초기화용)
     */
    @Transactional
    public Coupon createWelcomeCouponIfNotExists() {
        return couponRepository.findByCode(WELCOME_COUPON_CODE)
                .orElseGet(() -> {
                    Coupon welcomeCoupon = Coupon.builder()
                            .code(WELCOME_COUPON_CODE)
                            .name("웰컴 쿠폰")
                            .discountType(Coupon.DiscountType.PERCENTAGE)
                            .discountValue(20)
                            .minPurchaseAmount(0)
                            .maxDiscountAmount(50000) // 최대 5만원 할인
                            .startDate(LocalDateTime.now())
                            .endDate(LocalDateTime.now().plusYears(10)) // 10년간 유효
                            .usageLimit(999999) // 거의 무제한
                            .description("회원가입 축하 쿠폰! 첫 결제 시 20% 할인")
                            .build();

                    welcomeCoupon = couponRepository.save(welcomeCoupon);
                    log.info("웰컴 쿠폰 생성 완료: {}", WELCOME_COUPON_CODE);
                    return welcomeCoupon;
                });
    }

    /**
     * 사용자가 특정 쿠폰을 보유하고 있는지 확인
     */
    @Transactional(readOnly = true)
    public boolean hasUserCoupon(Long userId, String couponCode) {
        return userCouponRepository.existsByUserIdAndCouponCode(userId, couponCode);
    }

    /**
     * 사용자에게 알림으로 보여줄 쿠폰 목록 조회
     * (아직 받지 않은 사용 가능한 쿠폰)
     */
    @Transactional(readOnly = true)
    public List<Coupon> getNotificationCoupons(Long userId) {
        // 현재 사용 가능한 모든 쿠폰 조회
        List<Coupon> availableCoupons = couponRepository.findAvailableCoupons(LocalDateTime.now());

        // 사용자가 아직 받지 않은 쿠폰만 필터링
        return availableCoupons.stream()
                .filter(coupon -> !userCouponRepository.existsByUserIdAndCouponId(userId, coupon.getId()))
                .collect(Collectors.toList());
    }

    /**
     * 사용자의 웰컴 쿠폰 사용 여부 확인
     */
    @Transactional(readOnly = true)
    public boolean hasUsedWelcomeCoupon(Long userId) {
        return userCouponRepository.findByUserIdAndCouponCode(userId, WELCOME_COUPON_CODE)
                .map(UserCoupon::getIsUsed)
                .orElse(false);
    }

    // Private helper methods

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
    }

    private CouponDto.UserCouponResponse convertToUserCouponResponse(UserCoupon userCoupon) {
        Coupon coupon = userCoupon.getCoupon();
        return CouponDto.UserCouponResponse.builder()
                .userCouponId(userCoupon.getId())
                .couponId(coupon.getId())
                .code(coupon.getCode())
                .name(coupon.getName())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minPurchaseAmount(coupon.getMinPurchaseAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .startDate(coupon.getStartDate())
                .endDate(coupon.getEndDate())
                .description(coupon.getDescription())
                .isUsed(userCoupon.getIsUsed())
                .issuedAt(userCoupon.getIssuedAt())
                .usedAt(userCoupon.getUsedAt())
                .orderId(userCoupon.getOrderId())
                .canUse(userCoupon.canUse())
                .build();
    }
}
