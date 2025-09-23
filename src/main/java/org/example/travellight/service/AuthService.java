package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import org.example.travellight.dto.CustomUserDetails;
import org.example.travellight.dto.TokenResponse;
import org.example.travellight.dto.UserDto;
import org.example.travellight.entity.Role;
import org.example.travellight.entity.User;
import org.example.travellight.exception.CustomException;
import org.example.travellight.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserJwtService userJwtService;
    private final PasswordEncoder passwordEncoder;

    /**
     * 현재 인증된 사용자 정보 조회
     *
     * @return CustomUserDetails 현재 사용자 정보, 인증되지 않은 경우 null
     */
    public CustomUserDetails getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            return null;
        }

        return (CustomUserDetails) authentication.getPrincipal();
    }

    /**
     * 현재 사용자가 인증되었는지 확인
     *
     * @return boolean 인증 여부
     */
    public boolean isAuthenticated() {
        return getCurrentUser() != null;
    }

    /**
     * 사용자 회원가입
     *
     * @param request 회원가입 요청 정보
     * @return UserLoginResponse 회원가입 결과 (JWT 토큰 포함)
     */
    public UserDto.UserLoginResponse register(UserDto.RegisterRequest request) {
        // 이메일 중복 확인
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("이미 사용 중인 이메일입니다.", HttpStatus.BAD_REQUEST);
        }

        // 비밀번호 암호화
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .build();

        // 저장
        user = userRepository.save(user);

        // JWT 토큰 생성
        TokenResponse tokens = userJwtService.generateTokens(user.getId());

        return UserDto.UserLoginResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .accessToken(tokens.getAccessToken())
                .refreshToken(tokens.getRefreshToken())
                .build();
    }

    /**
     * 사용자 로그인
     *
     * @param request 로그인 요청 정보
     * @return UserLoginResponse 로그인 결과 (JWT 토큰 포함)
     */
    public UserDto.UserLoginResponse login(UserDto.LoginRequest request) {
        // 이메일로 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("이메일 또는 비밀번호가 일치하지 않습니다.", HttpStatus.UNAUTHORIZED));

        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException("이메일 또는 비밀번호가 일치하지 않습니다.", HttpStatus.UNAUTHORIZED);
        }

        // JWT 토큰 생성
        TokenResponse tokens = userJwtService.generateTokens(user.getId());

        return UserDto.UserLoginResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .accessToken(tokens.getAccessToken())
                .refreshToken(tokens.getRefreshToken())
                .build();
    }

}