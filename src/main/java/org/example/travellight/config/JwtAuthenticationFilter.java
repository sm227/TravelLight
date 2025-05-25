package org.example.travellight.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.travellight.entity.User;
import org.example.travellight.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            // 간단한 토큰 검증 (실제로는 JWT 라이브러리 사용 권장)
            // 여기서는 토큰이 "user-{userId}" 형태라고 가정
            if (token.startsWith("user-")) {
                try {
                    Long userId = Long.parseLong(token.substring(5));
                    Optional<User> userOpt = userRepository.findById(userId);
                    
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        
                        // 권한 설정
                        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole());
                        UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(user, null, Collections.singletonList(authority));
                        
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                } catch (NumberFormatException e) {
                    // 잘못된 토큰 형식
                }
            }
        }
        
        filterChain.doFilter(request, response);
    }
} 