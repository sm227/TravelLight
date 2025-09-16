package org.example.travellight.repository;

import org.example.travellight.entity.Review;
import org.example.travellight.entity.ReviewReport;
import org.example.travellight.entity.ReportStatus;
import org.example.travellight.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewReportRepository extends JpaRepository<ReviewReport, Long> {
    
    // 특정 사용자가 특정 리뷰를 신고했는지 확인
    boolean existsByReviewAndUser(Review review, User user);
    
    // 특정 사용자가 특정 리뷰에 한 신고 조회
    Optional<ReviewReport> findByReviewAndUser(Review review, User user);
    
    // 특정 리뷰의 신고 수 계산
    long countByReview(Review review);
    
    // 상태별 신고 조회 (관리자용)
    Page<ReviewReport> findByStatusOrderByCreatedAtDesc(ReportStatus status, Pageable pageable);
    
    // 특정 리뷰의 모든 신고 조회
    Page<ReviewReport> findByReviewOrderByCreatedAtDesc(Review review, Pageable pageable);
    
    // 특정 리뷰의 모든 신고 기록 삭제
    void deleteByReview(Review review);
}
