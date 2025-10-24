package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "inquiries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inquiry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 문의자 정보
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // 문의 유형
    @Enumerated(EnumType.STRING)
    @Column(name = "inquiry_type", nullable = false)
    private InquiryType inquiryType;
    
    // 제목
    @Column(name = "subject", nullable = false, length = 200)
    private String subject;
    
    // 문의 내용
    @Column(name = "content", nullable = false, length = 2000)
    private String content;
    
    // 연락처
    @Column(name = "email", nullable = false)
    private String email;
    
    @Column(name = "phone")
    private String phone;
    
    // 상태
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private InquiryStatus status = InquiryStatus.PENDING;
    
    // 관리자 답변
    @Column(name = "admin_reply", length = 2000)
    private String adminReply;
    
    // 답변한 관리자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_user_id")
    private User adminUser;
    
    // 답변 시간
    @Column(name = "replied_at")
    private LocalDateTime repliedAt;
    
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
            status = InquiryStatus.PENDING;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // 답변 추가 메서드
    public void addReply(String reply, User admin) {
        this.adminReply = reply;
        this.adminUser = admin;
        this.repliedAt = LocalDateTime.now();
        this.status = InquiryStatus.ANSWERED;
    }
}





