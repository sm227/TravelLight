package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.travellight.entity.ReportReason;
import org.example.travellight.entity.ReviewStatus;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

public class ReviewDto {
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewRequest {
        @NotNull(message = "예약 ID는 필수입니다")
        private Long reservationId;
        
        @NotNull(message = "평점은 필수입니다")
        @Min(value = 1, message = "평점은 1점 이상이어야 합니다")
        @Max(value = 5, message = "평점은 5점 이하여야 합니다")
        private Integer rating;
        
        @Size(max = 200, message = "제목은 200자 이하여야 합니다")
        private String title;
        
        @Size(max = 2000, message = "내용은 2000자 이하여야 합니다")
        private String content;
        
        // 업로드된 사진 파일명들 (실제 파일 업로드는 별도 API)
        private List<String> photoFilenames;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewResponse {
        private Long id;
        private Long reservationId;
        private String reservationNumber;
        private String placeName;
        private String placeAddress;
        private Integer rating;
        private String title;
        private String content;
        private ReviewStatus status;
        private Integer reportCount;
        private Integer helpfulCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        // 작성자 정보
        private UserInfo user;
        
        // 사진 정보
        private List<ReviewPhotoResponse> photos;
        
        // 관리자 답변
        private String adminReply;
        private UserInfo adminUser;
        private LocalDateTime adminReplyAt;
        
        // 현재 사용자 관련 정보 (로그인한 사용자 기준)
        private Boolean isHelpfulByCurrentUser;
        private Boolean isReportedByCurrentUser;
        private Boolean canEdit; // 작성자 본인 여부
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo {
        private Long id;
        private String name;
        // 보안상 이메일 등 민감한 정보는 제외
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewPhotoResponse {
        private Long id;
        private String filename;
        private String originalFilename;
        private String filePath;
        private Long fileSize;
        private String mimeType;
        private Integer sortOrder;
        private LocalDateTime uploadedAt;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewUpdateRequest {
        @NotNull(message = "평점은 필수입니다")
        @Min(value = 1, message = "평점은 1점 이상이어야 합니다")
        @Max(value = 5, message = "평점은 5점 이하여야 합니다")
        private Integer rating;
        
        @Size(max = 200, message = "제목은 200자 이하여야 합니다")
        private String title;
        
        @Size(max = 2000, message = "내용은 2000자 이하여야 합니다")
        private String content;
        
        // 유지할 기존 사진 ID들
        private List<Long> keepPhotoIds;
        
        // 새로 추가할 사진 파일명들
        private List<String> newPhotoFilenames;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewSummary {
        private String placeName;
        private String placeAddress;
        private Double averageRating;
        private Long totalReviews;
        private RatingDistribution ratingDistribution;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RatingDistribution {
        private Long rating5Count;
        private Long rating4Count;
        private Long rating3Count;
        private Long rating2Count;
        private Long rating1Count;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewReportRequest {
        @NotNull(message = "신고 사유는 필수입니다")
        private ReportReason reason;
        
        @Size(max = 500, message = "신고 상세 내용은 500자 이하여야 합니다")
        private String description;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminReplyRequest {
        @NotBlank(message = "관리자 답변은 필수입니다")
        @Size(max = 1000, message = "관리자 답변은 1000자 이하여야 합니다")
        private String adminReply;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlaceReviewSummary {
        private String placeName;
        private String placeAddress;
        private Double averageRating;
        private Long reviewCount;
        private Double recommendationScore; // 추천 점수 (평점 + 리뷰 수 가중치)
    }
}
