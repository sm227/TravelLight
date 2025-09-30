package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Claim {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 클레임 대상 사용자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // 담당자 이름
    @Column(name = "assignee", nullable = false)
    private String assignee;
    
    // 클레임 내용
    @Column(name = "content", length = 2000, nullable = false)
    private String content;
    
    // 클레임 상태
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ClaimStatus status = ClaimStatus.OPEN;
    
    // 클레임 작성자 (관리자)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_admin_id")
    private User createdByAdmin;
    
    // 클레임 작성 시간
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    // 클레임 수정 시간
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 클레임 해결 시간
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    // 해결 내용
    @Column(name = "resolution", length = 1000)
    private String resolution;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // 클레임 해결 처리
    public void resolve(String resolution) {
        this.status = ClaimStatus.RESOLVED;
        this.resolution = resolution;
        this.resolvedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // 클레임 재오픈 처리
    public void reopen() {
        this.status = ClaimStatus.OPEN;
        this.resolution = null;
        this.resolvedAt = null;
        this.updatedAt = LocalDateTime.now();
    }
}
