package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "faqs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Faq {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // FAQ 카테고리
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private FaqCategory category;
    
    // 질문
    @Column(name = "question", nullable = false, length = 500)
    private String question;
    
    // 답변
    @Column(name = "answer", nullable = false, length = 2000)
    private String answer;
    
    // 정렬 순서 (낮은 숫자가 먼저 표시)
    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
    
    // 활성화 여부
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    // 조회수
    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;
    
    // 생성자 정보
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    // 수정자 정보
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;
    
    // 생성 및 수정 시간
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
        if (viewCount == null) {
            viewCount = 0;
        }
        if (sortOrder == null) {
            sortOrder = 0;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // 조회수 증가
    public void incrementViewCount() {
        this.viewCount++;
    }
}

