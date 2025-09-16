package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "review_photos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewPhoto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 소속 리뷰
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;
    
    // 파일명
    @Column(name = "filename", nullable = false)
    private String filename;
    
    // 원본 파일명
    @Column(name = "original_filename", nullable = false)
    private String originalFilename;
    
    // 파일 경로 (S3 URL 또는 로컬 경로)
    @Column(name = "file_path", nullable = false)
    private String filePath;
    
    // 파일 크기 (bytes)
    @Column(name = "file_size")
    private Long fileSize;
    
    // MIME 타입
    @Column(name = "mime_type")
    private String mimeType;
    
    // 사진 순서
    @Column(name = "sort_order")
    private Integer sortOrder;
    
    // 업로드 시간
    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;
    
    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
    
    // 연관관계 편의 메서드
    public void setReview(Review review) {
        this.review = review;
        if (review != null && !review.getPhotos().contains(this)) {
            review.getPhotos().add(this);
        }
    }
}
