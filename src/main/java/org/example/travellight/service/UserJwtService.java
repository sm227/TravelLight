package org.example.travellight.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.travellight.config.JwtConfig;
import org.example.travellight.dto.TokenResponse;
import org.example.travellight.entity.UserRefreshToken;
import org.example.travellight.provider.JwtTokenProvider;
import org.example.travellight.repository.UserRefreshTokenRepository;
import org.example.travellight.util.RequestUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserJwtService {

    private final JwtTokenProvider jwtTokenProvider;
    private final JwtConfig jwtConfig;
    private final UserRefreshTokenRepository userRefreshTokenRepository;

    /**
     * 사용자 토큰 생성 및 Refresh Token DB 저장
     */
    @Transactional
    public TokenResponse generateTokens(Long userId) {
        // JWT Access Token 생성
        String accessToken = jwtTokenProvider.createToken(userId, jwtConfig.getAccessTokenExpiration());

        // JWT Refresh Token 생성
        String refreshToken = jwtTokenProvider.createToken(userId, jwtConfig.getRefreshTokenExpiration());

        // Refresh Token DB에 저장
        UserRefreshToken refreshTokenEntity = UserRefreshToken.builder()
                .userId(userId)
                .token(refreshToken)
                .expireAt(LocalDateTime.now().plusSeconds(jwtConfig.getRefreshTokenExpiration()))
                .createdIp(RequestUtils.getClientIp())
                .build();
        userRefreshTokenRepository.save(refreshTokenEntity);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    /**
     * Refresh Token으로 새로운 Access Token 발급
     */
    @Transactional
    public TokenResponse refreshTokens(String refreshToken) {
        // Refresh Token 검증 및 조회
        UserRefreshToken refreshTokenEntity = userRefreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("유효하지 않은 리프레시 토큰입니다."));

        // 만료 확인
        if (refreshTokenEntity.getExpireAt().isBefore(LocalDateTime.now())) {
            userRefreshTokenRepository.delete(refreshTokenEntity);
            throw new RuntimeException("만료된 리프레시 토큰입니다.");
        }

        Long userId = refreshTokenEntity.getUserId();

        // 새로운 Access Token 생성
        String newAccessToken = jwtTokenProvider.createToken(userId, jwtConfig.getAccessTokenExpiration());

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // 기존 refresh token 유지
                .build();
    }

    /**
     * 사용자의 모든 토큰 무효화
     */
    @Transactional
    public void revokeAllUserTokens(Long userId) {
        userRefreshTokenRepository.deleteAllByUserId(userId);
    }

    /**
     * 특정 토큰 무효화
     */
    @Transactional
    public void revokeToken(String refreshToken) {
        userRefreshTokenRepository.findByToken(refreshToken)
                .ifPresent(userRefreshTokenRepository::delete);
    }

    /**
     * 만료된 토큰 정리
     */
    @Transactional
    public void cleanExpiredTokens() {
        List<UserRefreshToken> expiredTokens = userRefreshTokenRepository.findByExpireAtBefore(LocalDateTime.now());

        if (!expiredTokens.isEmpty()) {
            userRefreshTokenRepository.deleteAll(expiredTokens);
            log.info("Deleted {} expired refresh tokens from database", expiredTokens.size());
        } else {
            log.debug("No expired refresh tokens found for cleanup");
        }
    }

    /**
     * HTTP 요청에서 Refresh Token 추출 (쿠키 우선, 없으면 헤더)
     */
    public String extractRefreshToken(HttpServletRequest request) {
        // 1. 쿠키에서 RT 추출 (웹 브라우저용)
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (jwtConfig.getRefreshTokenCookieName().equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        // 2. Authorization 헤더에서 RT 추출 (모바일 앱용)
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }
}