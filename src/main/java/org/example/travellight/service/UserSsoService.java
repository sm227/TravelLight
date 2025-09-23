package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.SsoUserInfoDto;
import org.example.travellight.dto.TokenResponse;
import org.example.travellight.dto.UserDto;
import org.example.travellight.entity.*;
import org.example.travellight.repository.UserRepository;
import org.example.travellight.repository.UserSsoAttributeRepository;
import org.example.travellight.repository.UserSsoProviderRepository;
import org.example.travellight.service.sso.GoogleSsoProviderService;
import org.example.travellight.service.sso.KakaoSsoProviderService;
import org.example.travellight.service.sso.AbstractSsoProviderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserSsoService {

    private final GoogleSsoProviderService googleSsoProvider;
    private final KakaoSsoProviderService kakaoSsoProvider;
    private final UserRepository userRepository;
    private final UserSsoProviderRepository userSsoProviderRepository;
    private final UserSsoAttributeRepository userSsoAttributeRepository;
    private final UserJwtService userJwtService;

    private AbstractSsoProviderService getSsoProvider(SsoProviderType providerType) {
        return switch (providerType) {
            case GOOGLE -> googleSsoProvider;
            case KAKAO -> kakaoSsoProvider;
        };
    }

    /**
     * 소셜 로그인
     *
     * @param request 소셜 로그인 요청 정보
     * @return UserLoginResponse 로그인 결과 (JWT 토큰 포함)
     */
    @Transactional
    public UserDto.UserLoginResponse login(UserDto.SsoLoginRequest request) {
        try {
            AbstractSsoProviderService provider = getSsoProvider(request.getProviderType());

            // OAuth 통신
            String accessToken = provider.getAccessToken(request.getAuthorizationCode(), request.getRedirectUri());
            SsoUserInfoDto ssoUserInfoDto = provider.getUserInfo(accessToken);

            // 사용자 생성/연동 처리
            User user = processUserLogin(request.getProviderType(), ssoUserInfoDto, accessToken);

            // JWT 토큰 발급
            TokenResponse tokenResponse = userJwtService.generateTokens(user.getId());

            return UserDto.UserLoginResponse.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .accessToken(tokenResponse.getAccessToken())
                    .refreshToken(tokenResponse.getRefreshToken())
                    .build();
        } catch (Exception e) {
            log.error("소셜 로그인 처리 중 오류 발생: provider={}, error={}",
                    request.getProviderType(), e.getMessage(), e);
            throw new RuntimeException("소셜 로그인 처리 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    private User processUserLogin(SsoProviderType providerType, SsoUserInfoDto ssoUserInfoDto, String accessToken) {
        Optional<UserSsoProvider> existingSsoProvider = userSsoProviderRepository
                .findByProviderTypeAndProviderUserId(providerType, ssoUserInfoDto.getId());

        User user;
        if (existingSsoProvider.isPresent()) {
            user = userRepository.findById(existingSsoProvider.get().getUserId())
                    .orElseThrow(() -> new RuntimeException("연동된 사용자를 찾을 수 없습니다"));

            updateSsoProvider(existingSsoProvider.get(), accessToken);
            updateSsoAttributes(user.getId(), providerType, ssoUserInfoDto);
        } else {
            user = createOrLinkUser(ssoUserInfoDto);
            createSsoProvider(user.getId(), providerType, ssoUserInfoDto.getId(), accessToken);
            createSsoAttributes(user.getId(), providerType, ssoUserInfoDto);
        }

        return user;
    }

    private User createOrLinkUser(SsoUserInfoDto ssoUserInfoDto) {
        Optional<User> existingUser = userRepository.findByEmail(ssoUserInfoDto.getEmail());

        if (existingUser.isPresent()) {
            return existingUser.get();
        } else {
            User newUser = User.builder()
                    .name(ssoUserInfoDto.getName())
                    .email(ssoUserInfoDto.getEmail())
                    .password("") // SSO 사용자는 비밀번호가 없으므로 빈 문자열 설정
                    .role(Role.USER)
                    .build();
            return userRepository.save(newUser);
        }
    }

    private void createSsoProvider(Long userId, SsoProviderType providerType, String providerUserId, String accessToken) {
        UserSsoProvider ssoProvider = UserSsoProvider.builder()
                .userId(userId)
                .providerType(providerType)
                .providerUserId(providerUserId)
                .accessToken(accessToken)
                .accessTokenExpireAt(LocalDateTime.now().plusHours(1))
                .build();
        userSsoProviderRepository.save(ssoProvider);
    }

    private void updateSsoProvider(UserSsoProvider ssoProvider, String accessToken) {
        ssoProvider.setAccessToken(accessToken);
        ssoProvider.setAccessTokenExpireAt(LocalDateTime.now().plusHours(1));
        userSsoProviderRepository.save(ssoProvider);
    }

    private void createSsoAttributes(Long userId, SsoProviderType providerType, SsoUserInfoDto ssoUserInfoDto) {
        UserSsoAttribute ssoAttribute = UserSsoAttribute.builder()
                .userId(userId)
                .providerType(providerType)
                .name(ssoUserInfoDto.getName())
                .email(ssoUserInfoDto.getEmail())
                .build();
        userSsoAttributeRepository.save(ssoAttribute);
    }

    private void updateSsoAttributes(Long userId, SsoProviderType providerType, SsoUserInfoDto ssoUserInfoDto) {
        Optional<UserSsoAttribute> existingAttribute = userSsoAttributeRepository
                .findByUserIdAndProviderType(userId, providerType);

        if (existingAttribute.isPresent()) {
            UserSsoAttribute attribute = existingAttribute.get();
            attribute.setName(ssoUserInfoDto.getName());
            attribute.setEmail(ssoUserInfoDto.getEmail());
            userSsoAttributeRepository.save(attribute);
        } else {
            createSsoAttributes(userId, providerType, ssoUserInfoDto);
        }
    }

}