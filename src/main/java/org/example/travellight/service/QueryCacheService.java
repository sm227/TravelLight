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
    private static final String STATS_PREFIX = "cache_stats:";
    private static final Duration DEFAULT_TTL = Duration.ofHours(2);

    // 통계 카운터 키들
    private static final String HIT_COUNT_KEY = STATS_PREFIX + "hits";
    private static final String MISS_COUNT_KEY = STATS_PREFIX + "misses";
    private static final String TOTAL_REQUESTS_KEY = STATS_PREFIX + "total_requests";

    public Optional<String> getCachedQuery(String naturalQuery) {
        try {
            String cacheKey = generateCacheKey(naturalQuery);
            String cachedResult = redisTemplate.opsForValue().get(cacheKey);

            // 총 요청 수 증가
            incrementCounter(TOTAL_REQUESTS_KEY);

            if (cachedResult != null) {
                log.info("캐시 히트: {}", naturalQuery);
                // 히트 카운터 증가
                incrementCounter(HIT_COUNT_KEY);
                return Optional.of(cachedResult);
            }

            log.debug("캐시 미스: {}", naturalQuery);
            // 미스 카운터 증가
            incrementCounter(MISS_COUNT_KEY);
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

    // 카운터 증가
    private void incrementCounter(String key) {
        try {
            redisTemplate.opsForValue().increment(key);
        } catch (Exception e) {
            log.warn("카운터 증가 실패: {}", e.getMessage());
        }
    }

    // 카운터 값 조회
    private long getCounter(String key) {
        try {
            String value = redisTemplate.opsForValue().get(key);
            return value != null ? Long.parseLong(value) : 0;
        } catch (Exception e) {
            log.warn("카운터 조회 실패: {}", e.getMessage());
            return 0;
        }
    }

    // 상세 캐시 통계 조회
    public CacheStats getDetailedCacheStats() {
        long totalRequests = getCounter(TOTAL_REQUESTS_KEY);
        long hits = getCounter(HIT_COUNT_KEY);
        long misses = getCounter(MISS_COUNT_KEY);
        long cacheSize = getCacheSize();

        double hitRate = totalRequests > 0 ? ((double) hits / totalRequests) * 100 : 0.0;

        return new CacheStats(cacheSize, totalRequests, hits, misses, hitRate);
    }

    // 통계 초기화
    public void resetStats() {
        try {
            redisTemplate.delete(HIT_COUNT_KEY);
            redisTemplate.delete(MISS_COUNT_KEY);
            redisTemplate.delete(TOTAL_REQUESTS_KEY);
            log.info("캐시 통계 초기화 완료");
        } catch (Exception e) {
            log.warn("캐시 통계 초기화 중 오류 발생: {}", e.getMessage());
        }
    }

    // 캐시 통계 DTO
    public static class CacheStats {
        private final long cacheSize;
        private final long totalRequests;
        private final long hits;
        private final long misses;
        private final double hitRate;

        public CacheStats(long cacheSize, long totalRequests, long hits, long misses, double hitRate) {
            this.cacheSize = cacheSize;
            this.totalRequests = totalRequests;
            this.hits = hits;
            this.misses = misses;
            this.hitRate = hitRate;
        }

        public long getCacheSize() { return cacheSize; }
        public long getTotalRequests() { return totalRequests; }
        public long getHits() { return hits; }
        public long getMisses() { return misses; }
        public double getHitRate() { return hitRate; }
    }
}