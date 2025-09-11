package org.example.travellight.repository;

import org.example.travellight.entity.ReviewPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewPhotoRepository extends JpaRepository<ReviewPhoto, Long> {
    
    // 특정 리뷰의 사진 조회 (순서대로)
    List<ReviewPhoto> findByReviewIdOrderBySortOrderAsc(Long reviewId);
    
    // 특정 리뷰의 사진 조회 (간단 버전)
    List<ReviewPhoto> findByReviewId(Long reviewId);
    
    // 특정 리뷰의 사진 삭제
    void deleteByReviewId(Long reviewId);
}
