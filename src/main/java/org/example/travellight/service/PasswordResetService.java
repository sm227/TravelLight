package org.example.travellight.service;

import org.example.travellight.dto.UserDto;

public interface PasswordResetService {
    
    /**
     * 비밀번호 재설정 인증 코드를 이메일로 전송합니다.
     * 
     * @param request 인증 코드 전송 요청
     */
    void sendPasswordResetCode(UserDto.PasswordResetSendCodeRequest request);
    
    /**
     * 비밀번호 재설정 인증 코드를 검증합니다.
     * 
     * @param request 인증 코드 검증 요청
     */
    void verifyPasswordResetCode(UserDto.PasswordResetVerifyCodeRequest request);
    
    /**
     * 비밀번호를 재설정합니다.
     * 
     * @param request 비밀번호 재설정 요청
     */
    void resetPassword(UserDto.PasswordResetConfirmRequest request);
}
