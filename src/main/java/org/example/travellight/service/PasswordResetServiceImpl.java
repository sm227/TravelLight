package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.UserDto;
import org.example.travellight.entity.User;
import org.example.travellight.exception.CustomException;
import org.example.travellight.repository.UserRepository;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    // Redis 대신 메모리 기반 저장소 사용 (개발용)
    private final ConcurrentHashMap<String, String> verificationCodes = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    private static final String PASSWORD_RESET_PREFIX = "password_reset:";
    private static final int CODE_LENGTH = 6;
    private static final Duration CODE_EXPIRATION = Duration.ofMinutes(5); // 5분 유효

    @Override
    public void sendPasswordResetCode(UserDto.PasswordResetSendCodeRequest request) {
        log.info("비밀번호 재설정 인증 코드 전송 요청: {}", request.getEmail());
        
        // 사용자 존재 확인
        userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("등록되지 않은 이메일입니다.", HttpStatus.NOT_FOUND));
        
        // 인증 코드 생성
        String verificationCode = generateVerificationCode();
        
        // 메모리에 인증 코드 저장 (5분 유효)
        String codeKey = PASSWORD_RESET_PREFIX + request.getEmail();
        verificationCodes.put(codeKey, verificationCode);
        
        // 5분 후 자동 삭제
        scheduler.schedule(() -> verificationCodes.remove(codeKey), CODE_EXPIRATION.toMinutes(), TimeUnit.MINUTES);
        
        // 이메일 전송
        boolean emailSent = emailService.sendPasswordResetVerificationEmail(request.getEmail(), verificationCode);
        
        if (!emailSent) {
            // 메모리에서 코드 삭제 (이메일 전송 실패 시)
            verificationCodes.remove(codeKey);
            throw new CustomException("이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        log.info("비밀번호 재설정 인증 코드가 {}에게 성공적으로 전송되었습니다.", request.getEmail());
    }

    @Override
    public void verifyPasswordResetCode(UserDto.PasswordResetVerifyCodeRequest request) {
        log.info("비밀번호 재설정 인증 코드 검증 요청: {}", request.getEmail());
        
        String codeKey = PASSWORD_RESET_PREFIX + request.getEmail();
        String storedCode = verificationCodes.get(codeKey);
        
        if (storedCode == null) {
            throw new CustomException("인증 코드가 만료되었습니다. 다시 요청해주세요.", HttpStatus.BAD_REQUEST);
        }
        
        if (!storedCode.equals(request.getCode())) {
            throw new CustomException("인증 코드가 일치하지 않습니다.", HttpStatus.BAD_REQUEST);
        }
        
        log.info("비밀번호 재설정 인증 코드 검증 성공: {}", request.getEmail());
    }

    @Override
    public void resetPassword(UserDto.PasswordResetConfirmRequest request) {
        log.info("비밀번호 재설정 요청: {}", request.getEmail());
        
        // 인증 코드 재검증
        String codeKey = PASSWORD_RESET_PREFIX + request.getEmail();
        String storedCode = verificationCodes.get(codeKey);
        
        if (storedCode == null) {
            throw new CustomException("인증 코드가 만료되었습니다. 다시 요청해주세요.", HttpStatus.BAD_REQUEST);
        }
        
        if (!storedCode.equals(request.getCode())) {
            throw new CustomException("인증 코드가 일치하지 않습니다.", HttpStatus.BAD_REQUEST);
        }
        
        // 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        // 비밀번호 변경
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        // 메모리에서 인증 코드 삭제 (사용 완료)
        verificationCodes.remove(codeKey);
        
        log.info("비밀번호 재설정 완료: {}", request.getEmail());
    }

    /**
     * 6자리 숫자 인증 코드 생성
     */
    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder code = new StringBuilder();
        
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }
        
        return code.toString();
    }
}
