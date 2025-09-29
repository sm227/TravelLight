package org.example.travellight.repository;

import org.example.travellight.entity.Review;
import org.example.travellight.entity.ReviewStatus;
import org.example.travellight.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // 특정 제휴점의 활성화된 리뷰 조회 (평점 순)
    Page<Review> findByPlaceNameAndPlaceAddressAndStatusOrderByRatingDescCreatedAtDesc(
            String placeName, String placeAddress, ReviewStatus status, Pageable pageable);
    
    // 특정 제휴점의 활성화된 리뷰 조회 (최신순)
    Page<Review> findByPlaceNameAndPlaceAddressAndStatusOrderByCreatedAtDesc(
            String placeName, String placeAddress, ReviewStatus status, Pageable pageable);
    
    // 사용자의 리뷰 조회
    Page<Review> findByUserAndStatusOrderByCreatedAtDesc(User user, ReviewStatus status, Pageable pageable);
    
    // 예약에 대한 리뷰 존재 여부 확인
    boolean existsByReservationIdAndStatus(Long reservationId, ReviewStatus status);
    
    // 예약에 대한 활성화된 리뷰 조회
    Optional<Review> findByReservationIdAndStatus(Long reservationId, ReviewStatus status);
    
    // 특정 제휴점의 평균 평점 계산
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.placeName = :placeName AND r.placeAddress = :placeAddress AND r.status = :status")
    Double getAverageRatingByPlace(@Param("placeName") String placeName, 
                                  @Param("placeAddress") String placeAddress,
                                  @Param("status") ReviewStatus status);
    
    // 특정 제휴점의 평점별 리뷰 수 집계
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.placeName = :placeName AND r.placeAddress = :placeAddress AND r.status = :status GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getRatingDistributionByPlace(@Param("placeName") String placeName, 
                                               @Param("placeAddress") String placeAddress,
                                               @Param("status") ReviewStatus status);
    
    // 특정 제휴점의 총 리뷰 수
    long countByPlaceNameAndPlaceAddressAndStatus(String placeName, String placeAddress, ReviewStatus status);
    
    // 최근 리뷰 조회 (관리자용)
    Page<Review> findByStatusOrderByCreatedAtDesc(ReviewStatus status, Pageable pageable);
    
    // 신고가 많은 리뷰 조회 (관리자용)
    @Query("SELECT r FROM Review r WHERE r.reportCount >= :threshold AND r.status = :status ORDER BY r.reportCount DESC, r.createdAt DESC")
    List<Review> findReviewsWithHighReports(@Param("threshold") int threshold, @Param("status") ReviewStatus status);
    
    // 특정 사용자가 특정 예약에 대해 작성한 리뷰 조회
    Optional<Review> findByUserAndReservationIdAndStatus(User user, Long reservationId, ReviewStatus status);
    
    // 모든 제휴점의 평점별 집계 (상위 평점 제휴점 조회용)
    @Query("SELECT r.placeName, r.placeAddress, AVG(r.rating) as avgRating, COUNT(r) as reviewCount, " +
           "(AVG(r.rating) * 0.8 + LEAST(COUNT(r) / 5.0, 1.0) * 5 * 0.2) as recommendationScore " +
           "FROM Review r WHERE r.status = :status " +
           "GROUP BY r.placeName, r.placeAddress " +
           "HAVING COUNT(r) >= :minReviewCount " +
           "ORDER BY recommendationScore DESC, avgRating DESC, reviewCount DESC")
    List<Object[]> findTopRatedPlaces(@Param("status") ReviewStatus status, 
                                     @Param("minReviewCount") long minReviewCount);
}
