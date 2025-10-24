package org.example.travellight.repository;

import org.example.travellight.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    /**
     * 쿠폰 코드로 조회
     */
    Optional<Coupon> findByCode(String code);

    /**
     * 쿠폰 코드 존재 여부 확인
     */
    boolean existsByCode(String code);

    /**
     * 활성 상태로 필터링
     */
    List<Coupon> findByIsActiveOrderByCreatedAtDesc(Boolean isActive);

    /**
     * 모든 쿠폰 최신순 조회
     */
    List<Coupon> findAllByOrderByCreatedAtDesc();

    /**
     * 현재 사용 가능한 쿠폰 조회
     */
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true " +
           "AND c.usedCount < c.usageLimit " +
           "AND c.startDate <= :now " +
           "AND c.endDate >= :now " +
           "ORDER BY c.createdAt DESC")
    List<Coupon> findAvailableCoupons(@Param("now") LocalDateTime now);

    /**
     * 만료된 쿠폰 조회
     */
    @Query("SELECT c FROM Coupon c WHERE c.endDate < :now " +
           "ORDER BY c.endDate DESC")
    List<Coupon> findExpiredCoupons(@Param("now") LocalDateTime now);

    /**
     * 사용 완료된 쿠폰 조회 (선착순 마감)
     */
    @Query("SELECT c FROM Coupon c WHERE c.usedCount >= c.usageLimit " +
           "ORDER BY c.createdAt DESC")
    List<Coupon> findFullyUsedCoupons();
}
