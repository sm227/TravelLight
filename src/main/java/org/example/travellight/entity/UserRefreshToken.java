package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_refresh_tokens",
        indexes = {
                @Index(name = "idx_user_id", columnList = "userId"),
                @Index(name = "idx_token", columnList = "token"),
                @Index(name = "idx_expire_at", columnList = "expireAt")
        })
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class UserRefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("토큰 ID")
    private Long id;

    @Column(nullable = false)
    @Comment("회원 ID")
    private Long userId;

    @Column(nullable = false, length = 512)
    @Comment("리프레시 토큰")
    private String token;

    @Column(nullable = false)
    @Comment("토큰 만료 일시")
    private LocalDateTime expireAt;

    @CreatedDate
    @Comment("토큰 생성 일시")
    private LocalDateTime createdAt;

    @Column(length = 45)
    @Comment("토큰 생성 IP")
    private String createdIp;

}
