package org.example.travellight.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.config.JwtConfig;
import org.example.travellight.dto.ApiResponse;
import org.example.travellight.dto.TokenResponse;
import org.example.travellight.dto.UserDto;
import org.example.travellight.service.AuthService;
import org.example.travellight.service.UserSsoService;
import org.example.travellight.service.UserJwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.example.travellight.dto.CustomUserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Slf4j
@Tag(name = "인증 관리", description = "사용자 회원가입, 로그인, 현재 사용자 정보 조회, 토큰 갱신 및 로그아웃 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserSsoService userSsoService;
    private final UserJwtService userJwtService;
    private final JwtConfig jwtConfig;

    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "회원가입 성공",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "이미 존재하는 사용자",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto.UserLoginResponse>> register(
            @Parameter(description = "회원가입 정보", required = true)
            @RequestBody UserDto.RegisterRequest request,
            HttpServletResponse response) {
        UserDto.UserLoginResponse userResponse = authService.register(request);

        // Refresh Token 쿠키 설정
        setRefreshTokenCookie(response, userResponse.getRefreshToken());

        return ResponseEntity.ok(ApiResponse.success("회원가입이 완료되었습니다.", userResponse));
    }

    @Operation(summary = "로그인", description = "사용자 로그인을 처리합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "로그인 성공",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserDto.UserLoginResponse>> login(
            @Parameter(description = "로그인 정보", required = true)
            @RequestBody UserDto.LoginRequest request,
            HttpServletResponse response) {
        UserDto.UserLoginResponse userResponse = authService.login(request);

        // Refresh Token 쿠키 설정
        setRefreshTokenCookie(response, userResponse.getRefreshToken());

        return ResponseEntity.ok(ApiResponse.success("로그인이 완료되었습니다.", userResponse));
    }

    @Operation(summary = "로그아웃", description = "Refresh Token을 무효화하고 로그아웃 처리합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "로그아웃 성공",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            String refreshToken = userJwtService.extractRefreshToken(request);

            if (refreshToken != null) {
                userJwtService.revokeToken(refreshToken);
            }

            // 쿠키 삭제
            clearRefreshTokenCookie(response);

            return ResponseEntity.ok(ApiResponse.success("로그아웃이 완료되었습니다.", null));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("로그아웃 처리 중 오류가 발생했습니다."));
        }
    }

    @Operation(summary = "현재 사용자 정보 조회", description = "현재 인증된 사용자의 정보를 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증되지 않은 사용자",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> me() {
        CustomUserDetails userDetails = authService.getCurrentUser();

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("인증되지 않은 사용자입니다."));
        }

        UserDto.UserResponse userResponse = UserDto.UserResponse.builder()
                .id(userDetails.getUserId())
                .name(userDetails.getName())
                .email(userDetails.getEmail())
                .role(userDetails.getRole())
                .build();

        return ResponseEntity.ok(ApiResponse.success("사용자 정보를 조회했습니다.", userResponse));
    }

    @Operation(summary = "Access Token 갱신", description = "Refresh Token을 사용하여 새로운 Access Token을 발급합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "토큰 갱신 성공",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "유효하지 않은 Refresh Token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(HttpServletRequest request, HttpServletResponse response) {
        try {
            // 요청에서 Refresh Token 추출
            String refreshToken = userJwtService.extractRefreshToken(request);

            if (refreshToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Refresh Token이 없습니다."));
            }

            // 새로운 Access Token 발급
            TokenResponse tokens = userJwtService.refreshTokens(refreshToken);

            // 항상 쿠키 설정 (앱에서는 무시됨)
            setRefreshTokenCookie(response, tokens.getRefreshToken());

            return ResponseEntity.ok(ApiResponse.success("토큰이 갱신되었습니다.", tokens));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("유효하지 않은 Refresh Token입니다."));
        }
    }

    @Operation(summary = "소셜 로그인", description = "소셜 로그인을 처리합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "로그인 성공",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @PostMapping("/sso/login")
    public ResponseEntity<ApiResponse<UserDto.UserLoginResponse>> ssoLogin(
            @Parameter(description = "소셜 로그인 정보", required = true)
            @RequestBody UserDto.SsoLoginRequest request,
            HttpServletResponse response) {
        UserDto.UserLoginResponse userResponse = userSsoService.login(request);

        // Refresh Token 쿠키 설정
        setRefreshTokenCookie(response, userResponse.getRefreshToken());

        return ResponseEntity.ok(ApiResponse.success("소셜 로그인이 완료되었습니다.", userResponse));
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
}