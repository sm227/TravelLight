package org.example.travellight.service;

import org.example.travellight.dto.DriverDto;
import org.example.travellight.entity.Driver;
import org.example.travellight.entity.DriverStatus;

import java.util.List;

public interface DriverService {

    // 배달원 인증
    DriverDto.DriverResponse login(DriverDto.DriverLoginRequest request);

    // 배달원 프로필 조회
    DriverDto.DriverResponse getDriverProfile(Long driverId);

    DriverDto.DriverResponse getDriverByUserId(Long userId);

    // 배달원 상태 변경
    void updateDriverStatus(Long driverId, DriverStatus status);

    // 배달원 위치 업데이트
    void updateDriverLocation(Long driverId, DriverDto.DriverLocationUpdateRequest request);

    // 배달원 통계 조회
    DriverDto.DriverStatsResponse getDriverStats(Long driverId);

    // 배달원 목록 조회 (관리자용)
    List<DriverDto.DriverListResponse> getAllDrivers();

    // 상태별 배달원 조회
    List<DriverDto.DriverListResponse> getDriversByStatus(DriverStatus status);

    // 온라인 배달원 조회
    List<DriverDto.DriverListResponse> getOnlineDrivers();

    // 근처 배달원 조회
    List<DriverDto.DriverListResponse> getNearbyDrivers(Double latitude, Double longitude, Double radiusKm);

    // 배달원 등록
    Driver createDriver(Long userId, String licenseNumber, String vehicleType, String vehicleNumber, String phoneNumber);

    // 배달원 엔티티 조회
    Driver getDriverById(Long driverId);

    // 사용자 ID로 배달원 엔티티 조회
    Driver getDriverByUserIdEntity(Long userId);

    // 배달원 상태 통계
    Long getDriverCountByStatus(DriverStatus status);

    // 활성화된 배달원 조회 (최근 활동 기준)
    List<Driver> getActiveDrivers();

    // 배달 중인 배달원 조회
    List<Driver> getDriversWithActiveDeliveries();
}