package org.example.travellight.service.sso;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.SsoUserInfoDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class KakaoSsoProviderService implements AbstractSsoProviderService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${oauth.kakao.client-id}")
    private String clientId;

    @Value("${oauth.kakao.client-secret}")
    private String clientSecret;

    @Value("${oauth.kakao.token-uri}")
    private String tokenUri;

    @Value("${oauth.kakao.user-info-uri}")
    private String userInfoUri;

    @Override
    public String getAccessToken(String authorizationCode, String redirectUri) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "authorization_code");
            params.add("client_id", clientId);
            params.add("redirect_uri", redirectUri);
            params.add("code", authorizationCode);
            if (clientSecret != null && !clientSecret.isEmpty()) {
                params.add("client_secret", clientSecret);
            }

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUri, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                return jsonNode.get("access_token").asText();
            } else {
                throw new RuntimeException("카카오 액세스 토큰 획득 실패");
            }
        } catch (Exception e) {
            log.error("카카오 액세스 토큰 획득 중 오류 발생", e);
            throw new RuntimeException("카카오 액세스 토큰 획득 실패", e);
        }
    }

    @Override
    public SsoUserInfoDto getUserInfo(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);

            HttpEntity<?> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(userInfoUri, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                JsonNode kakaoAccount = jsonNode.get("kakao_account");
                JsonNode profile = kakaoAccount.get("profile");

                return SsoUserInfoDto.builder()
                        .id(jsonNode.get("id").asText())
                        .name(profile.get("nickname").asText())
                        .email(kakaoAccount.has("email") ? kakaoAccount.get("email").asText() : null)
                        .picture(profile.has("profile_image_url") ? profile.get("profile_image_url").asText() : null)
                        .build();
            } else {
                throw new RuntimeException("카카오 사용자 정보 조회 실패");
            }
        } catch (Exception e) {
            log.error("카카오 사용자 정보 조회 중 오류 발생", e);
            throw new RuntimeException("카카오 사용자 정보 조회 실패", e);
        }
    }
}