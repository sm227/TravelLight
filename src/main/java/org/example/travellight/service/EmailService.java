package org.example.travellight.service;

import org.example.travellight.dto.ReservationDto;

public interface EmailService {
    
    /**
     * 예약 확인 이메일을 보냅니다.
     * 
     * @param reservationDto 예약 정보가 담긴 DTO
     * @return 이메일 전송 성공 여부
     */
    boolean sendReservationConfirmationEmail(ReservationDto reservationDto);
    
    /**
     * 비밀번호 재설정 인증 코드 이메일을 보냅니다.
     * 
     * @param email 수신자 이메일
     * @param verificationCode 인증 코드
     * @return 이메일 전송 성공 여부
     */
    boolean sendPasswordResetVerificationEmail(String email, String verificationCode);
} 