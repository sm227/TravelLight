package org.example.travellight.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.CommonApiResponse;
import org.example.travellight.dto.RiderDto;
import org.example.travellight.entity.DriverStatus;
import org.example.travellight.entity.RiderApplicationStatus;
import org.example.travellight.service.RiderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Tag(name = "라이더 관리", description = "라이더 회원가입, 로그인, 신청 관리 API")
@RestController
@RequestMapping("/api/riders")
@RequiredArgsConstructor
public class RiderController {

    private final RiderService riderService;

    @Operation(summary = "라이더 회원가입", description = "라이더가 회원가입을 신청합니다. 관리자 승인 후 로그인 가능합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "회원가입 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 또는 이메일 중복",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PostMapping("/register")
    public ResponseEntity<CommonApiResponse<RiderDto.RiderApplicationResponse>> register(
            @Parameter(description = "라이더 회원가입 정보", required = true)
            @RequestBody RiderDto.RiderRegisterRequest request,
            HttpServletResponse response) {
        log.info("라이더 회원가입 요청 - 이메일: {}", request.getEmail());
        RiderDto.RiderApplicationResponse applicationResponse = riderService.register(request);
        return ResponseEntity.ok(CommonApiResponse.success("회원가입 신청이 완료되었습니다. 관리자의 승인을 기다려주세요.", applicationResponse));
    }

    @Operation(summary = "라이더 로그인", description = "승인된 라이더가 로그인합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "로그인 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 실패",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "403", description = "승인되지 않은 라이더",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<CommonApiResponse<RiderDto.RiderLoginResponse>> login(
            @Parameter(description = "로그인 정보", required = true)
            @RequestBody RiderDto.RiderLoginRequest request) {
        log.info("라이더 로그인 요청 - 이메일: {}", request.getEmail());
        RiderDto.RiderLoginResponse loginResponse = riderService.login(request);
        return ResponseEntity.ok(CommonApiResponse.success("로그인이 완료되었습니다.", loginResponse));
    }

    @Operation(summary = "내 신청 상태 조회", description = "현재 로그인한 사용자의 라이더 신청 상태를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "신청 내역을 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @GetMapping("/application/status")
    public ResponseEntity<CommonApiResponse<RiderDto.RiderApplicationResponse>> getApplicationStatus(
            @Parameter(description = "사용자 ID", required = true)
            @RequestParam Long userId) {
        log.info("라이더 신청 상태 조회 - 사용자 ID: {}", userId);
        RiderDto.RiderApplicationResponse response = riderService.getApplicationStatus(userId);
        return ResponseEntity.ok(CommonApiResponse.success("신청 상태를 조회했습니다.", response));
    }

    @Operation(summary = "모든 라이더 신청 목록 조회 (관리자용)", description = "모든 라이더 신청 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @GetMapping("/admin/applications")
    public ResponseEntity<CommonApiResponse<List<RiderDto.RiderApplicationResponse>>> getAllApplications() {
        log.info("모든 라이더 신청 목록 조회 요청");
        List<RiderDto.RiderApplicationResponse> applications = riderService.getAllApplications();
        return ResponseEntity.ok(CommonApiResponse.success("신청 목록을 조회했습니다.", applications));
    }

    @Operation(summary = "특정 상태의 라이더 신청 목록 조회 (관리자용)", description = "특정 상태의 라이더 신청 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @GetMapping("/admin/applications/status/{status}")
    public ResponseEntity<CommonApiResponse<List<RiderDto.RiderApplicationResponse>>> getApplicationsByStatus(
            @Parameter(description = "신청 상태 (PENDING, APPROVED, REJECTED)", required = true)
            @PathVariable RiderApplicationStatus status) {
        log.info("상태별 라이더 신청 목록 조회 요청 - 상태: {}", status);
        List<RiderDto.RiderApplicationResponse> applications = riderService.getApplicationsByStatus(status);
        return ResponseEntity.ok(CommonApiResponse.success("신청 목록을 조회했습니다.", applications));
    }

    @Operation(summary = "라이더 신청 상세 조회 (관리자용)", description = "라이더 신청 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "신청 내역을 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @GetMapping("/admin/applications/{applicationId}")
    public ResponseEntity<CommonApiResponse<RiderDto.RiderApplicationResponse>> getApplicationById(
            @Parameter(description = "신청 ID", required = true)
            @PathVariable Long applicationId) {
        log.info("라이더 신청 상세 조회 - 신청 ID: {}", applicationId);
        RiderDto.RiderApplicationResponse response = riderService.getApplicationById(applicationId);
        return ResponseEntity.ok(CommonApiResponse.success("신청 정보를 조회했습니다.", response));
    }

    @Operation(summary = "라이더 신청 승인 (관리자용)", description = "라이더 신청을 승인하고 Driver 레코드를 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "승인 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "신청 내역을 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "이미 승인된 신청",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PostMapping("/admin/applications/{applicationId}/approve")
    public ResponseEntity<CommonApiResponse<RiderDto.RiderApplicationResponse>> approveApplication(
            @Parameter(description = "신청 ID", required = true)
            @PathVariable Long applicationId) {
        log.info("라이더 신청 승인 요청 - 신청 ID: {}", applicationId);
        RiderDto.RiderApplicationResponse response = riderService.approveApplication(applicationId);
        return ResponseEntity.ok(CommonApiResponse.success("라이더 신청이 승인되었습니다.", response));
    }

    @Operation(summary = "라이더 신청 거절 (관리자용)", description = "라이더 신청을 거절합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "거절 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "신청 내역을 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "이미 거절된 신청",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PostMapping("/admin/applications/{applicationId}/reject")
    public ResponseEntity<CommonApiResponse<RiderDto.RiderApplicationResponse>> rejectApplication(
            @Parameter(description = "신청 ID", required = true)
            @PathVariable Long applicationId,
            @Parameter(description = "거절 사유", required = true)
            @RequestBody RiderDto.RejectRequest request) {
        log.info("라이더 신청 거절 요청 - 신청 ID: {}, 사유: {}", applicationId, request.getRejectionReason());
        RiderDto.RiderApplicationResponse response = riderService.rejectApplication(applicationId, request.getRejectionReason());
        return ResponseEntity.ok(CommonApiResponse.success("라이더 신청이 거절되었습니다.", response));
    }

    @Operation(summary = "승인된 라이더 목록 조회 (관리자용)", description = "승인된 모든 라이더 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @GetMapping("/admin/approved")
    public ResponseEntity<CommonApiResponse<List<RiderDto.RiderResponse>>> getApprovedRiders() {
        log.info("승인된 라이더 목록 조회 요청");
        List<RiderDto.RiderResponse> riders = riderService.getApprovedRiders();
        return ResponseEntity.ok(CommonApiResponse.success("승인된 라이더 목록을 조회했습니다.", riders));
    }

    @Operation(summary = "라이더 통계 조회 (관리자용)", description = "라이더 통계를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @GetMapping("/admin/stats")
    public ResponseEntity<CommonApiResponse<RiderDto.RiderStats>> getRiderStats() {
        log.info("라이더 통계 조회 요청");
        RiderDto.RiderStats stats = riderService.getRiderStats();
        return ResponseEntity.ok(CommonApiResponse.success("라이더 통계를 조회했습니다.", stats));
    }

    @Operation(summary = "라이더 출퇴근 상태 변경 (관리자용)", description = "라이더의 출퇴근 상태를 변경합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "변경 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "라이더를 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (승인되지 않음 또는 비활성)",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PutMapping("/admin/{driverId}/status")
    public ResponseEntity<CommonApiResponse<RiderDto.RiderResponse>> updateDriverStatus(
            @Parameter(description = "드라이버 ID", required = true)
            @PathVariable Long driverId,
            @Parameter(description = "출퇴근 상태 (ONLINE, OFFLINE, BUSY, BREAK)", required = true)
            @RequestBody RiderDto.UpdateStatusRequest request) {
        log.info("라이더 출퇴근 상태 변경 요청 - 드라이버 ID: {}, 상태: {}", driverId, request.getStatus());
        RiderDto.RiderResponse response = riderService.updateDriverStatus(driverId, request.getStatus());
        return ResponseEntity.ok(CommonApiResponse.success("출퇴근 상태가 변경되었습니다.", response));
    }

    @Operation(summary = "라이더 비활성화 (관리자용)", description = "라이더를 비활성화합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "비활성화 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "라이더를 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (이미 비활성화됨)",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PutMapping("/admin/{driverId}/deactivate")
    public ResponseEntity<CommonApiResponse<RiderDto.RiderResponse>> deactivateDriver(
            @Parameter(description = "드라이버 ID", required = true)
            @PathVariable Long driverId) {
        log.info("라이더 비활성화 요청 - 드라이버 ID: {}", driverId);
        RiderDto.RiderResponse response = riderService.deactivateDriver(driverId);
        return ResponseEntity.ok(CommonApiResponse.success("라이더가 비활성화되었습니다.", response));
    }

    @Operation(summary = "라이더 활성화 (관리자용)", description = "라이더를 활성화합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "활성화 성공",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "라이더를 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (이미 활성화됨)",
                    content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PutMapping("/admin/{driverId}/activate")
    public ResponseEntity<CommonApiResponse<RiderDto.RiderResponse>> activateDriver(
            @Parameter(description = "드라이버 ID", required = true)
            @PathVariable Long driverId) {
        log.info("라이더 활성화 요청 - 드라이버 ID: {}", driverId);
        RiderDto.RiderResponse response = riderService.activateDriver(driverId);
        return ResponseEntity.ok(CommonApiResponse.success("라이더가 활성화되었습니다.", response));
    }
}
