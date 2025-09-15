package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class QueryCacheService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String CACHE_PREFIX = "gemini_query:";
    private static final Duration DEFAULT_TTL = Duration.ofHours(2);

    public Optional<String> getCachedQuery(String naturalQuery) {
        try {
            String cacheKey = generateCacheKey(naturalQuery);
            String cachedResult = redisTemplate.opsForValue().get(cacheKey);

            if (cachedResult != null) {
                log.info("캐시 히트: {}", naturalQuery);
                return Optional.of(cachedResult);
            }

            log.debug("캐시 미스: {}", naturalQuery);
            return Optional.empty();

        } catch (Exception e) {
            log.warn("캐시 조회 중 오류 발생: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public void cacheQuery(String naturalQuery, String geminiResponse) {
        try {
            String cacheKey = generateCacheKey(naturalQuery);
            redisTemplate.opsForValue().set(cacheKey, geminiResponse, DEFAULT_TTL);
            log.info("쿼리 캐싱 완료: {}", naturalQuery);

        } catch (Exception e) {
            log.warn("캐시 저장 중 오류 발생: {}", e.getMessage());
        }
    }

    public void invalidateCache(String naturalQuery) {
        try {
            String cacheKey = generateCacheKey(naturalQuery);
            redisTemplate.delete(cacheKey);
            log.info("캐시 무효화: {}", naturalQuery);

        } catch (Exception e) {
            log.warn("캐시 무효화 중 오류 발생: {}", e.getMessage());
        }
    }

    public void clearAllCache() {
        try {
            redisTemplate.delete(redisTemplate.keys(CACHE_PREFIX + "*"));
            log.info("모든 쿼리 캐시 삭제 완료");

        } catch (Exception e) {
            log.warn("전체 캐시 삭제 중 오류 발생: {}", e.getMessage());
        }
    }

    private String generateCacheKey(String naturalQuery) {
        try {
            // 질의를 정규화 (공백, 대소문자 통일)
            String normalizedQuery = normalizeQuery(naturalQuery);

            // MD5 해시로 캐시 키 생성
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(normalizedQuery.getBytes());

            StringBuilder hashString = new StringBuilder();
            for (byte b : hashBytes) {
                hashString.append(String.format("%02x", b));
            }

            return CACHE_PREFIX + hashString.toString();

        } catch (NoSuchAlgorithmException e) {
            // MD5가 없을 수 없지만, 만약을 위해 단순 키 사용
            log.warn("MD5 해시 생성 실패, 단순 키 사용");
            return CACHE_PREFIX + naturalQuery.replaceAll("\\s+", "_").toLowerCase();
        }
    }

    private String normalizeQuery(String query) {
        return query.trim()
                   .toLowerCase()
                   .replaceAll("\\s+", " ");  // 여러 공백을 하나로
    }

    public long getCacheSize() {
        try {
            return redisTemplate.countExistingKeys(redisTemplate.keys(CACHE_PREFIX + "*"));
        } catch (Exception e) {
            log.warn("캐시 크기 조회 중 오류 발생: {}", e.getMessage());
            return -1;
        }
    }
}