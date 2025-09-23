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
@Table(name = "user_sso_attributes",
        indexes = {
                @Index(name = "idx_user_id", columnList = "userId"),
                @Index(name = "idx_provider_type", columnList = "providerType"),
                @Index(name = "idx_user_provider", columnList = "userId,providerType", unique = true)
        })
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class UserSsoAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("SSO 속성 정보 ID")
    private Long id;

    @Column(nullable = false)
    @Comment("회원 ID")
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Comment("소셜 로그인 제공자")
    private SsoProviderType providerType;

    @Column(length = 100)
    @Comment("이름")
    private String name;

    @Column(length = 200)
    @Comment("이메일")
    private String email;

    @Column(length = 10)
    @Comment("성별")
    private String gender;

    @Column(length = 20)
    @Comment("나이대")
    private String ageRange;

    @Column(length = 20)
    @Comment("휴대폰 번호")
    private String phoneNumber;

    @Column(length = 100)
    @Comment("생일")
    private String birthday;

    @CreatedDate
    @Comment("속성 수집 일시")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Comment("속성 수정 일시")
    private LocalDateTime updatedAt;

}