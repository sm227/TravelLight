package org.example.travellight.service;

import org.example.travellight.dto.ReviewDto;
import org.example.travellight.entity.ReportReason;
import org.example.travellight.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ReviewService {
    
    // 리뷰 작성
    ReviewDto.ReviewResponse createReview(ReviewDto.ReviewRequest request, User user);
    
    // 리뷰 수정
    ReviewDto.ReviewResponse updateReview(Long reviewId, ReviewDto.ReviewUpdateRequest request, User user);
    
    // 리뷰 삭제
    void deleteReview(Long reviewId, User user);
    
    // 리뷰 상세 조회
    ReviewDto.ReviewResponse getReview(Long reviewId, User currentUser);
    
    // 특정 제휴점의 리뷰 목록 조회
    Page<ReviewDto.ReviewResponse> getPlaceReviews(String placeName, String placeAddress, 
                                                  String sortBy, Pageable pageable, User currentUser);
    
    // 사용자의 리뷰 목록 조회
    Page<ReviewDto.ReviewResponse> getUserReviews(User user, Pageable pageable);
    
    // 특정 제휴점의 리뷰 요약 정보
    ReviewDto.ReviewSummary getPlaceReviewSummary(String placeName, String placeAddress);
    
    // 리뷰 도움이 됨 토글
    boolean toggleHelpful(Long reviewId, User user);
    
    // 리뷰 신고
    void reportReview(Long reviewId, ReviewDto.ReviewReportRequest request, User user);
    
    // 관리자 답변 추가/수정
    ReviewDto.ReviewResponse addAdminReply(Long reviewId, ReviewDto.AdminReplyRequest request, User admin);
    
    // 리뷰 상태 변경 (관리자용)
    ReviewDto.ReviewResponse updateReviewStatus(Long reviewId, String status, User admin);
    
    // 리뷰 사진 업로드
    List<String> uploadReviewPhotos(List<MultipartFile> files);
    
    // 리뷰 사진 삭제
    void deleteReviewPhoto(Long photoId, User user);
    
    // 예약에 대한 리뷰 작성 가능 여부 확인
    boolean canWriteReview(Long reservationId, User user);
    
    // 예약에 활성 리뷰가 있는지 확인
    boolean hasActiveReview(Long reservationId);
    
    // 예약 ID로 리뷰 삭제 (테스트용)
    boolean deleteReviewByReservationId(Long reservationId);
    
    // 예약 ID로 리뷰 조회
    ReviewDto.ReviewResponse getReviewByReservationId(Long reservationId);
    
    // 상위 평점 제휴점 조회 (추천 시스템용)
    List<ReviewDto.PlaceReviewSummary> getTopRatedPlaces(int limit);
    
    // 최근 리뷰 조회 (관리자용)
    Page<ReviewDto.ReviewResponse> getRecentReviews(Pageable pageable);
    
    // 신고가 많은 리뷰 조회 (관리자용)
    List<ReviewDto.ReviewResponse> getReviewsWithHighReports(int threshold);
    
    // 특정 사용자의 모든 리뷰 조회 (관리자용)
    Page<ReviewDto.ReviewResponse> getAdminUserReviews(Long userId, Pageable pageable);
}
