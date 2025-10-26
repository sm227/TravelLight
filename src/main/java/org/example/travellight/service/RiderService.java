package org.example.travellight.service;

import org.example.travellight.dto.RiderDto;
import org.example.travellight.entity.DriverStatus;
import org.example.travellight.entity.RiderApplicationStatus;

import java.util.List;

public interface RiderService {

    /**
     * 라이더 회원가입
     * User를 WAIT 상태로 생성하고 RiderApplication을 저장
     */
    RiderDto.RiderApplicationResponse register(RiderDto.RiderRegisterRequest request);

    /**
     * 라이더 로그인
     * 승인된 라이더만 로그인 가능 (Driver 레코드 존재 여부 확인)
     */
    RiderDto.RiderLoginResponse login(RiderDto.RiderLoginRequest request);

    /**
     * 현재 사용자의 신청 상태 조회
     */
    RiderDto.RiderApplicationResponse getApplicationStatus(Long userId);

    /**
     * 모든 라이더 신청 목록 조회 (관리자용)
     */
    List<RiderDto.RiderApplicationResponse> getAllApplications();

    /**
     * 특정 상태의 라이더 신청 목록 조회
     */
    List<RiderDto.RiderApplicationResponse> getApplicationsByStatus(RiderApplicationStatus status);

    /**
     * 라이더 신청 승인
     * Driver 레코드 생성 및 User Role을 WAIT에서 USER로 변경
     */
    RiderDto.RiderApplicationResponse approveApplication(Long applicationId);

    /**
     * 라이더 신청 거절
     */
    RiderDto.RiderApplicationResponse rejectApplication(Long applicationId, String rejectionReason);

    /**
     * 라이더 신청 상세 조회
     */
    RiderDto.RiderApplicationResponse getApplicationById(Long applicationId);

    /**
     * 승인된 라이더 목록 조회 (관리자용)
     */
    List<RiderDto.RiderResponse> getApprovedRiders();

    /**
     * 라이더 통계 조회 (관리자용)
     */
    RiderDto.RiderStats getRiderStats();

    /**
     * 라이더 출퇴근 상태 변경 (관리자용)
     */
    RiderDto.RiderResponse updateDriverStatus(Long driverId, DriverStatus status);

    /**
     * 라이더 비활성화 (관리자용)
     */
    RiderDto.RiderResponse deactivateDriver(Long driverId);

    /**
     * 라이더 활성화 (관리자용)
     */
    RiderDto.RiderResponse activateDriver(Long driverId);
}
