package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_sso_providers",
        indexes = {
                @Index(name = "idx_user_id", columnList = "userId"),
                @Index(name = "idx_provider_type", columnList = "providerType"),
                @Index(name = "idx_provider_user_id", columnList = "providerUserId"),
                @Index(name = "idx_user_provider", columnList = "userId,providerType", unique = true)
        })
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class UserSsoProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("SSO 제공자 정보 ID")
    private Long id;

    @Column(nullable = false)
    @Comment("회원 ID")
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Comment("소셜 로그인 제공자")
    private SsoProviderType providerType;

    @Column(nullable = false, length = 200)
    @Comment("제공자에서의 사용자 고유 ID")
    private String providerUserId;

    @Column(length = 1000)
    @Comment("소셜 로그인 액세스 토큰")
    private String accessToken;

    @Column(length = 1000)
    @Comment("소셜 로그인 리프레시 토큰")
    private String refreshToken;

    @Comment("액세스 토큰 만료 일시")
    private LocalDateTime accessTokenExpireAt;

    @Comment("리프레시 토큰 만료 일시")
    private LocalDateTime refreshTokenExpireAt;

    @CreatedDate
    @Comment("연동 생성 일시")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Comment("연동 수정 일시")
    private LocalDateTime updatedAt;

    @Column(length = 45)
    @Comment("연동 생성 IP")
    private String createdIp;

    @Column(length = 45)
    @Comment("연동 수정 IP")
    private String updatedIp;

}