package org.example.travellight.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class JwtConfig {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.secure}")
    private boolean secure;

    @Value("${jwt.access-token.cookie-name}")
    private String accessTokenCookieName;

    @Value("${jwt.access-token.expiration}")
    private Integer accessTokenExpiration;

    @Value("${jwt.refresh-token.cookie-name}")
    private String refreshTokenCookieName;

    @Value("${jwt.refresh-token.expiration}")
    private Integer refreshTokenExpiration;

}