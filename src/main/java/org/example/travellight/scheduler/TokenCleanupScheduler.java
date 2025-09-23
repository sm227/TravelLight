package org.example.travellight.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.service.UserJwtService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 만료된 Refresh Token을 정기적으로 정리하는 스케줄러
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TokenCleanupScheduler {

    private final UserJwtService userJwtService;

    /**
     * 매일 새벽 1시에 만료된 토큰들을 정리
     */
    @Scheduled(cron = "0 0 1 * * *")
    public void cleanupExpiredTokens() {
        try {
            log.info("Starting expired refresh token cleanup task");

            long startTime = System.currentTimeMillis();
            userJwtService.cleanExpiredTokens();
            long endTime = System.currentTimeMillis();

            log.info("Expired refresh token cleanup task completed successfully. ({}ms)", endTime - startTime);
        } catch (Exception e) {
            log.error("Failed to execute expired refresh token cleanup task", e);
        }
    }

}
