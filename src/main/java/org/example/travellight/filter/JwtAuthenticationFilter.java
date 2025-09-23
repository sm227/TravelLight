package org.example.travellight.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.CustomUserDetails;
import org.example.travellight.entity.User;
import org.example.travellight.provider.JwtTokenProvider;
import org.example.travellight.service.UserService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // Authorization 헤더에서 토큰 추출
            String bearerToken = request.getHeader("Authorization");
            String accessToken = null;

            if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
                accessToken = bearerToken.substring(7);
            }

            if (accessToken != null && jwtTokenProvider.validateToken(accessToken)) {
                Long userId = jwtTokenProvider.getUserIdFromToken(accessToken);

                // 사용자 정보 조회 및 CustomUserDetails 생성
                User user = userService.getUserByIdEntity(userId);
                CustomUserDetails userDetails = new CustomUserDetails(
                        user.getId(),
                        user.getEmail(),
                        user.getName(),
                        user.getRole()
                );

                // 인증 객체 생성 및 SecurityContext에 설정
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("JWT authentication successful - User: {}", user.getEmail());
            }
        } catch (Exception e) {
            log.warn("JWT token processing failed: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}