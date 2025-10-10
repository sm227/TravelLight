package org.example.travellight.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.config.JwtConfig;
import org.example.travellight.dto.CommonApiResponse;
import org.example.travellight.dto.CustomUserDetails;
import org.example.travellight.dto.TokenResponse;
import org.example.travellight.dto.UserDto;
import org.example.travellight.exception.CustomException;
import org.example.travellight.service.AuthService;
import org.example.travellight.service.PasswordResetService;
import org.example.travellight.service.UserJwtService;
import org.example.travellight.service.UserSsoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Tag(name = "인증 관리", description = "사용자 회원가입, 로그인, 현재 사용자 정보 조회, 토큰 갱신 및 로그아웃 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserSsoService userSsoService;
    private final UserJwtService userJwtService;
    private final PasswordResetService passwordResetService;
    private final JwtConfig jwtConfig;

    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "회원가입 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "409", description = "이미 존재하는 사용자",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PostMapping("/register")
    public ResponseEntity<CommonApiResponse<UserDto.UserLoginResponse>> register(
            @Parameter(description = "회원가입 정보", required = true)
            @RequestBody UserDto.RegisterRequest request,
            HttpServletResponse response) {
        UserDto.UserLoginResponse userResponse = authService.register(request);

        // Refresh Token 쿠키 설정
        setRefreshTokenCookie(response, userResponse.getRefreshToken());

        return ResponseEntity.ok(CommonApiResponse.success("회원가입이 완료되었습니다.", userResponse));
    }

    @Operation(summary = "로그인", description = "사용자 로그인을 처리합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "로그인 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 실패",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<CommonApiResponse<UserDto.UserLoginResponse>> login(
            @Parameter(description = "로그인 정보", required = true)
            @RequestBody UserDto.LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        try {
            UserDto.UserLoginResponse userResponse = authService.login(request);

            // 로그인 성공 로그 (ELK 전용 - DB 저장 안 함)
            org.slf4j.MDC.put("action", "LOGIN_SUCCESS");
            org.slf4j.MDC.put("userId", userResponse.getId().toString());
            org.slf4j.MDC.put("email", userResponse.getEmail());
            org.slf4j.MDC.put("userName", userResponse.getName());
            org.slf4j.MDC.put("clientIp", getClientIP(httpRequest));
            org.slf4j.MDC.put("userAgent", httpRequest.getHeader("User-Agent"));
            log.info("LOGIN_SUCCESS - User: {}, IP: {}", userResponse.getEmail(), getClientIP(httpRequest));
            org.slf4j.MDC.clear();

            // Refresh Token 쿠키 설정
            setRefreshTokenCookie(response, userResponse.getRefreshToken());

            return ResponseEntity.ok(CommonApiResponse.success("로그인이 완료되었습니다.", userResponse));
        } catch (Exception e) {
            // 로그인 실패 로그
            org.slf4j.MDC.put("action", "LOGIN_FAIL");
            org.slf4j.MDC.put("attemptedEmail", request.getEmail());
            org.slf4j.MDC.put("clientIp", getClientIP(httpRequest));
            org.slf4j.MDC.put("reason", e.getMessage());
            log.warn("LOGIN_FAIL - Email: {}, IP: {}, Reason: {}",
                request.getEmail(), getClientIP(httpRequest), e.getMessage());
            org.slf4j.MDC.clear();
            throw e;
        }
    }

    @Operation(summary = "로그아웃", description = "Refresh Token을 무효화하고 로그아웃 처리합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "로그아웃 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "500", description = "서버 오류",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PostMapping("/logout")
    public ResponseEntity<CommonApiResponse<Void>> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            String refreshToken = userJwtService.extractRefreshToken(request);

            if (refreshToken != null) {
                userJwtService.revokeToken(refreshToken);
            }

            // 로그아웃 로그 (ELK 전용)
            org.slf4j.MDC.put("action", "LOGOUT");
            log.info("LOGOUT - Session ended");

            // 쿠키 삭제
            clearRefreshTokenCookie(response);

            return ResponseEntity.ok(CommonApiResponse.success("로그아웃이 완료되었습니다.", null));

        } catch (Exception e) {
            log.error("LOGOUT_ERROR - Error during logout: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("로그아웃 처리 중 오류가 발생했습니다."));
        }
    }

    @Operation(summary = "현재 사용자 정보 조회", description = "현재 인증된 사용자의 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @GetMapping("/me")
    public ResponseEntity<CommonApiResponse<UserDto.UserResponse>> me() {
        CustomUserDetails userDetails = authService.getCurrentUser();

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(CommonApiResponse.error("인증되지 않은 사용자입니다."));
        }

        UserDto.UserResponse userResponse = UserDto.UserResponse.builder()
                .id(userDetails.getUserId())
                .name(userDetails.getName())
                .email(userDetails.getEmail())
                .role(userDetails.getRole())
                .build();

        return ResponseEntity.ok(CommonApiResponse.success("사용자 정보를 조회했습니다.", userResponse));
    }

    @Operation(summary = "Access Token 갱신", description = "Refresh Token을 사용하여 새로운 Access Token을 발급합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "토큰 갱신 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "유효하지 않은 Refresh Token",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PostMapping("/refresh")
    public ResponseEntity<CommonApiResponse<TokenResponse>> refresh(HttpServletRequest request, HttpServletResponse response) {
        try {
            // 요청에서 Refresh Token 추출
            String refreshToken = userJwtService.extractRefreshToken(request);

            if (refreshToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(CommonApiResponse.error("Refresh Token이 없습니다."));
            }

            // 새로운 Access Token 발급
            TokenResponse tokens = userJwtService.refreshTokens(refreshToken);

            // 항상 쿠키 설정 (앱에서는 무시됨)
            setRefreshTokenCookie(response, tokens.getRefreshToken());

            return ResponseEntity.ok(CommonApiResponse.success("토큰이 갱신되었습니다.", tokens));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(CommonApiResponse.error("유효하지 않은 Refresh Token입니다."));
        }
    }

    @Operation(summary = "소셜 로그인", description = "소셜 로그인을 처리합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "로그인 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 실패",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PostMapping("/sso/login")
    public ResponseEntity<CommonApiResponse<UserDto.UserLoginResponse>> ssoLogin(
            @Parameter(description = "소셜 로그인 정보", required = true)
            @RequestBody UserDto.SsoLoginRequest request,
            HttpServletResponse response) {
        UserDto.UserLoginResponse userResponse = userSsoService.login(request);

        // Refresh Token 쿠키 설정
        setRefreshTokenCookie(response, userResponse.getRefreshToken());

        return ResponseEntity.ok(CommonApiResponse.success("소셜 로그인이 완료되었습니다.", userResponse));
    }

    @Operation(summary = "비밀번호 재설정 인증 코드 전송", description = "이메일로 비밀번호 재설정 인증 코드를 전송합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "인증 코드 전송 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "등록되지 않은 이메일",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "500", description = "이메일 전송 실패",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PostMapping("/password-reset/send-code")
    public ResponseEntity<CommonApiResponse<Void>> sendPasswordResetCode(
            @Parameter(description = "인증 코드 전송 요청", required = true)
            @RequestBody UserDto.PasswordResetSendCodeRequest request) {
        try {
            passwordResetService.sendPasswordResetCode(request);
            return ResponseEntity.ok(CommonApiResponse.success("인증 코드가 이메일로 전송되었습니다.", null));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getStatus())
                    .body(CommonApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("비밀번호 재설정 인증 코드 전송 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("서버 오류가 발생했습니다."));
        }
    }

    @Operation(summary = "비밀번호 재설정 인증 코드 검증", description = "비밀번호 재설정 인증 코드를 검증합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "인증 코드 검증 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "인증 코드 불일치 또는 만료",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PostMapping("/password-reset/verify-code")
    public ResponseEntity<CommonApiResponse<Void>> verifyPasswordResetCode(
            @Parameter(description = "인증 코드 검증 요청", required = true)
            @RequestBody UserDto.PasswordResetVerifyCodeRequest request) {
        try {
            passwordResetService.verifyPasswordResetCode(request);
            return ResponseEntity.ok(CommonApiResponse.success("인증 코드가 확인되었습니다.", null));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getStatus())
                    .body(CommonApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("비밀번호 재설정 인증 코드 검증 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("서버 오류가 발생했습니다."));
        }
    }

    @Operation(summary = "비밀번호 재설정", description = "새로운 비밀번호로 재설정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "비밀번호 재설정 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "인증 코드 불일치 또는 만료",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PostMapping("/password-reset/confirm")
    public ResponseEntity<CommonApiResponse<Void>> resetPassword(
            @Parameter(description = "비밀번호 재설정 요청", required = true)
            @RequestBody UserDto.PasswordResetConfirmRequest request) {
        try {
            passwordResetService.resetPassword(request);
            return ResponseEntity.ok(CommonApiResponse.success("비밀번호가 성공적으로 재설정되었습니다.", null));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getStatus())
                    .body(CommonApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("비밀번호 재설정 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("서버 오류가 발생했습니다."));
        }
    }

    /**
     * Refresh Token 쿠키 설정
     */
    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie(jwtConfig.getRefreshTokenCookieName(), refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(jwtConfig.isSecure()); // 설정값에 따라 결정 (로컬에선 HTTP로 테스트하기 때문)
        cookie.setPath("/");
        cookie.setMaxAge((int) jwtConfig.getRefreshTokenExpiration());
        cookie.setAttribute("SameSite", "Strict");

        response.addCookie(cookie);
    }

    /**
     * Refresh Token 쿠키 삭제
     */
    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(jwtConfig.getRefreshTokenCookieName(), "");
        cookie.setHttpOnly(true);
        cookie.setSecure(jwtConfig.isSecure()); // 설정값에 따라 결정 (로컬에선 HTTP로 테스트하기 때문)
        cookie.setPath("/");
        cookie.setMaxAge(0); // 즉시 만료

        response.addCookie(cookie);
    }

    /**
     * Client IP 주소 추출 (Proxy 고려)
     */
    private String getClientIP(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");

        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        // 여러 IP가 있을 경우 첫 번째 IP 사용
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }

        return ip;
    }
}