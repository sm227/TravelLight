package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 리뷰 작성자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // 리뷰 대상 예약
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;
    
    // 제휴점 정보 (검색 및 집계를 위해 비정규화)
    @Column(name = "place_name", nullable = false)
    private String placeName;
    
    @Column(name = "place_address", nullable = false)
    private String placeAddress;
    
    // 평점 (1-5점)
    @Column(name = "rating", nullable = false)
    private Integer rating;
    
    // 리뷰 제목
    @Column(name = "title", length = 200)
    private String title;
    
    // 리뷰 내용
    @Column(name = "content", length = 2000)
    private String content;
    
    // 리뷰 사진들
    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReviewPhoto> photos = new ArrayList<>();
    
    // 관리자 답변
    @Column(name = "admin_reply", length = 1000)
    private String adminReply;
    
    // 관리자 답변 작성자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_user_id")
    private User adminUser;
    
    // 관리자 답변 작성 시간
    @Column(name = "admin_reply_at")
    private LocalDateTime adminReplyAt;
    
    // 리뷰 상태
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.ACTIVE;
    
    // 신고 횟수
    @Column(name = "report_count")
    @Builder.Default
    private Integer reportCount = 0;
    
    // 도움이 됨 카운트
    @Column(name = "helpful_count")
    @Builder.Default
    private Integer helpfulCount = 0;
    
    // 생성 및 수정 시간
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ReviewStatus.ACTIVE;
        }
        if (reportCount == null) {
            reportCount = 0;
        }
        if (helpfulCount == null) {
            helpfulCount = 0;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // 연관관계 편의 메서드
    public void addPhoto(ReviewPhoto photo) {
        photos.add(photo);
        photo.setReview(this);
    }
    
    public void removePhoto(ReviewPhoto photo) {
        photos.remove(photo);
        photo.setReview(null);
    }
    
    // 관리자 답변 추가
    public void addAdminReply(String reply, User admin) {
        this.adminReply = reply;
        this.adminUser = admin;
        this.adminReplyAt = LocalDateTime.now();
    }
    
    // 도움이 됨 증가
    public void incrementHelpfulCount() {
        this.helpfulCount++;
    }
    
    // 신고 증가
    public void incrementReportCount() {
        this.reportCount++;
    }
}
