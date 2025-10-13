package org.example.travellight.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
// @EnableCaching  // Redis 없이도 작동하도록 임시 비활성화
@Slf4j
public class RedisConfig {

    @Bean
    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // 키와 값 모두 String으로 직렬화
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new StringRedisSerializer());

        template.setDefaultSerializer(new StringRedisSerializer());
        template.afterPropertiesSet();

        log.info("Redis 템플릿 설정 완료");
        return template;
    }

    // Redis 캐시 매니저 - Redis 서버가 필요할 때만 활성화
    // @Bean
    // public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
    //     // ObjectMapper 설정
    //     ObjectMapper objectMapper = new ObjectMapper();
    //     objectMapper.registerModule(new JavaTimeModule());
    //     objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    //     objectMapper.activateDefaultTyping(
    //         objectMapper.getPolymorphicTypeValidator(),
    //         ObjectMapper.DefaultTyping.NON_FINAL
    //     );
    //
    //     // Redis Serializer 설정
    //     GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(objectMapper);
    //
    //     // 기본 캐시 설정
    //     RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
    //             .entryTtl(Duration.ofMinutes(10))  // 기본 TTL 10분
    //             .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
    //             .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer))
    //             .disableCachingNullValues();
    //
    //     // 캐시별 상세 설정
    //     Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
    //     
    //     // FAQ 목록 - 30분 캐시 (자주 변경되지 않음)
    //     cacheConfigurations.put("faqs", defaultConfig.entryTtl(Duration.ofMinutes(30)));
    //     
    //     // FAQ 검색 결과 - 10분 캐시 (검색 결과가 많을 수 있음)
    //     cacheConfigurations.put("faqSearch", defaultConfig.entryTtl(Duration.ofMinutes(10)));
    //     
    //     // 인기 FAQ - 5분 캐시 (조회수가 자주 변경됨)
    //     cacheConfigurations.put("popularFaqs", defaultConfig.entryTtl(Duration.ofMinutes(5)));
    //
    //     RedisCacheManager cacheManager = RedisCacheManager.builder(connectionFactory)
    //             .cacheDefaults(defaultConfig)
    //             .withInitialCacheConfigurations(cacheConfigurations)
    //             .transactionAware()
    //             .build();
    //
    //     log.info("Redis 캐시 매니저 설정 완료");
    //     return cacheManager;
    // }
}