package org.example.travellight.repository;

import org.example.travellight.entity.Review;
import org.example.travellight.entity.ReviewHelpful;
import org.example.travellight.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewHelpfulRepository extends JpaRepository<ReviewHelpful, Long> {
    
    // 특정 사용자가 특정 리뷰에 도움이 됨을 눌렀는지 확인
    boolean existsByReviewAndUser(Review review, User user);
    
    // 특정 사용자가 특정 리뷰에 누른 도움이 됨 조회
    Optional<ReviewHelpful> findByReviewAndUser(Review review, User user);
    
    // 특정 리뷰의 도움이 됨 수 계산
    long countByReview(Review review);
    
    // 특정 리뷰의 모든 도움이 됨 기록 삭제
    void deleteByReview(Review review);
}
