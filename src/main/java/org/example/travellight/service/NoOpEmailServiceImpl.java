package org.example.travellight.service;

import org.example.travellight.dto.ReservationDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

/**
 * 이메일을 실제로 전송하지 않는 EmailService 구현체입니다.
 * spring.mail.enabled=false일 때 사용됩니다.
 */
@Service
@ConditionalOnProperty(name = "spring.mail.enabled", havingValue = "false")
@Primary
public class NoOpEmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(NoOpEmailServiceImpl.class);

    public NoOpEmailServiceImpl() {
        logger.info("NoOpEmailServiceImpl initialized. 이메일이 비활성화되었습니다.");
    }

    @Override
    public boolean sendReservationConfirmationEmail(ReservationDto reservationDto) {
        logger.info("이메일 전송이 비활성화되어 있습니다. 예약 확인 이메일을 전송하지 않습니다. (사용자: {}, 예약번호: {})",
                reservationDto.getUserEmail(), reservationDto.getReservationNumber());
        return true;
    }

    @Override
    public boolean sendPasswordResetVerificationEmail(String email, String verificationCode) {
        logger.info("이메일 전송이 비활성화되어 있습니다. 비밀번호 재설정 인증 코드 이메일을 전송하지 않습니다. (사용자: {}, 인증코드: {})",
                email, verificationCode);
        return true;
    }
} 