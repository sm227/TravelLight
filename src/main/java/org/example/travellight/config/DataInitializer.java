package org.example.travellight.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.service.UserCouponService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * 애플리케이션 시작 시 초기 데이터를 생성하는 컴포넌트
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserCouponService userCouponService;

    @Override
    public void run(ApplicationArguments args) {
        log.info("데이터 초기화 시작...");

        try {
            // 웰컴 쿠폰 생성 (없으면 생성, 있으면 스킵)
            userCouponService.createWelcomeCouponIfNotExists();
            log.info("웰컴 쿠폰 초기화 완료");
        } catch (Exception e) {
            log.error("웰컴 쿠폰 초기화 실패", e);
        }

        log.info("데이터 초기화 완료");
    }
}
