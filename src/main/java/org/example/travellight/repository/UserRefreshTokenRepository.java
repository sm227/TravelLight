package org.example.travellight.repository;

import org.example.travellight.entity.UserRefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRefreshTokenRepository extends JpaRepository<UserRefreshToken, Long> {

    // 토큰으로 조회
    Optional<UserRefreshToken> findByToken(String token);

    // 사용자의 모든 토큰 삭제
    void deleteAllByUserId(Long userId);

    // 만료된 토큰 조회
    List<UserRefreshToken> findByExpireAtBefore(LocalDateTime expireAt);

}