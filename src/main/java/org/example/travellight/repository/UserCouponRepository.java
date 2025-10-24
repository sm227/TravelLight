package org.example.travellight.repository;

import org.example.travellight.entity.UserCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {

    /**
     * 사용자의 모든 쿠폰 조회
     */
    List<UserCoupon> findByUserIdOrderByIssuedAtDesc(Long userId);

    /**
     * 사용자의 사용 가능한 쿠폰 조회
     */
    @Query("SELECT uc FROM UserCoupon uc " +
           "JOIN FETCH uc.coupon c " +
           "WHERE uc.user.id = :userId " +
           "AND uc.isUsed = false " +
           "AND c.isActive = true " +
           "AND c.usedCount < c.usageLimit " +
           "AND c.startDate <= CURRENT_TIMESTAMP " +
           "AND c.endDate >= CURRENT_TIMESTAMP " +
           "ORDER BY uc.issuedAt DESC")
    List<UserCoupon> findAvailableByUserId(@Param("userId") Long userId);

    /**
     * 사용자의 특정 쿠폰 조회
     */
    Optional<UserCoupon> findByUserIdAndCouponId(Long userId, Long couponId);

    /**
     * 사용자의 특정 쿠폰 코드 조회
     */
    @Query("SELECT uc FROM UserCoupon uc " +
           "JOIN FETCH uc.coupon c " +
           "WHERE uc.user.id = :userId AND c.code = :couponCode")
    Optional<UserCoupon> findByUserIdAndCouponCode(@Param("userId") Long userId,
                                                     @Param("couponCode") String couponCode);

    /**
     * 사용자가 이미 해당 쿠폰을 가지고 있는지 확인
     */
    boolean existsByUserIdAndCouponId(Long userId, Long couponId);

    /**
     * 사용자가 이미 해당 쿠폰 코드를 가지고 있는지 확인
     */
    @Query("SELECT CASE WHEN COUNT(uc) > 0 THEN true ELSE false END " +
           "FROM UserCoupon uc " +
           "JOIN uc.coupon c " +
           "WHERE uc.user.id = :userId AND c.code = :couponCode")
    boolean existsByUserIdAndCouponCode(@Param("userId") Long userId,
                                        @Param("couponCode") String couponCode);

    /**
     * 사용자의 사용된 쿠폰 조회
     */
    List<UserCoupon> findByUserIdAndIsUsedTrueOrderByUsedAtDesc(Long userId);

    /**
     * 사용자의 미사용 쿠폰 조회
     */
    List<UserCoupon> findByUserIdAndIsUsedFalseOrderByIssuedAtDesc(Long userId);

    /**
     * 특정 쿠폰의 발급 횟수 조회
     */
    Long countByCouponId(Long couponId);

    /**
     * 특정 쿠폰의 사용 횟수 조회
     */
    Long countByCouponIdAndIsUsedTrue(Long couponId);
}
