package org.example.travellight.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.ApiResponse;
import org.example.travellight.dto.DriverDto;
import org.example.travellight.dto.DeliveryManagementDto;
import org.example.travellight.dto.CallLogDto;
import org.example.travellight.entity.DriverStatus;
import org.example.travellight.service.DriverService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Tag(name = "배달원 관리", description = "배달원 관련 API")
@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @Operation(summary = "배달원 로그인", description = "배달원 로그인을 수행합니다.")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<DriverDto.DriverResponse>> login(
            @RequestBody DriverDto.DriverLoginRequest request) {
        log.info("배달원 로그인 요청 - 이메일: {}", request.getEmail());

        DriverDto.DriverResponse response = driverService.login(request);

        log.info("배달원 로그인 완료 - 배달원 ID: {}", response.getId());
        return ResponseEntity.ok(ApiResponse.success("로그인 성공", response));
    }

    @Operation(summary = "배달원 프로필 조회", description = "배달원 프로필 정보를 조회합니다.")
    @GetMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<DriverDto.DriverResponse>> getDriverProfile(
            @Parameter(description = "배달원 ID", required = true)
            @PathVariable Long id) {
        log.info("배달원 프로필 조회 요청 - 배달원 ID: {}", id);

        DriverDto.DriverResponse response = driverService.getDriverProfile(id);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "배달원 상태 변경", description = "배달원 상태를 변경합니다.")
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateDriverStatus(
            @Parameter(description = "배달원 ID", required = true)
            @PathVariable Long id,
            @RequestBody DriverDto.DriverStatusUpdateRequest request) {
        log.info("배달원 상태 변경 요청 - 배달원 ID: {}, 상태: {}", id, request.getStatus());

        driverService.updateDriverStatus(id, request.getStatus());

        log.info("배달원 상태 변경 완료 - 배달원 ID: {}", id);
        return ResponseEntity.ok(ApiResponse.success("상태가 변경되었습니다."));
    }

    @Operation(summary = "배달원 위치 업데이트", description = "배달원의 실시간 위치를 업데이트합니다.")
    @PutMapping("/{id}/location")
    public ResponseEntity<ApiResponse<String>> updateDriverLocation(
            @Parameter(description = "배달원 ID", required = true)
            @PathVariable Long id,
            @RequestBody DriverDto.DriverLocationUpdateRequest request) {
        log.debug("배달원 위치 업데이트 - 배달원 ID: {}, 위도: {}, 경도: {}",
                id, request.getLatitude(), request.getLongitude());

        driverService.updateDriverLocation(id, request);

        return ResponseEntity.ok(ApiResponse.success("위치가 업데이트되었습니다."));
    }

    @Operation(summary = "배달원 통계 조회", description = "배달원의 통계 정보를 조회합니다.")
    @GetMapping("/{id}/stats")
    public ResponseEntity<ApiResponse<DriverDto.DriverStatsResponse>> getDriverStats(
            @Parameter(description = "배달원 ID", required = true)
            @PathVariable Long id) {
        log.info("배달원 통계 조회 요청 - 배달원 ID: {}", id);

        DriverDto.DriverStatsResponse response = driverService.getDriverStats(id);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "온라인 배달원 목록 조회", description = "현재 온라인 상태인 배달원 목록을 조회합니다.")
    @GetMapping("/online")
    public ResponseEntity<ApiResponse<List<DriverDto.DriverListResponse>>> getOnlineDrivers() {
        log.info("온라인 배달원 목록 조회 요청");

        List<DriverDto.DriverListResponse> response = driverService.getOnlineDrivers();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "모든 배달원 목록 조회", description = "모든 배달원 목록을 조회합니다. (관리자용)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DriverDto.DriverListResponse>>> getAllDrivers() {
        log.info("모든 배달원 목록 조회 요청");

        List<DriverDto.DriverListResponse> response = driverService.getAllDrivers();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}