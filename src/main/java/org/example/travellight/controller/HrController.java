package org.example.travellight.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.CommonApiResponse;
import org.example.travellight.dto.HrDto;
import org.example.travellight.service.HrService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Tag(name = "HR 관리", description = "채용 지원서 및 인재풀 관리 API")
@RestController
@RequestMapping("/api/hr")
@RequiredArgsConstructor
public class HrController {

    private final HrService hrService;

    @Operation(summary = "채용 지원서 제출", description = "새로운 채용 지원서를 제출합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "지원서 제출 성공",
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PostMapping("/applications")
    public ResponseEntity<CommonApiResponse<HrDto.JobApplicationResponse>> submitJobApplication(
            @Parameter(description = "채용 지원서 정보", required = true)
            @RequestBody HrDto.JobApplicationRequest request) {
        log.info("채용 지원서 제출 요청 - 포지션: {}, 지원자: {}", request.getPositionTitle(), request.getApplicantName());
        HrDto.JobApplicationResponse response = hrService.submitJobApplication(request);
        return ResponseEntity.ok(CommonApiResponse.success("지원서가 성공적으로 제출되었습니다.", response));
    }

    @Operation(summary = "인재풀 등록", description = "인재풀에 등록합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "인재풀 등록 성공", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PostMapping("/talent-pool")
    public ResponseEntity<CommonApiResponse<HrDto.TalentPoolResponse>> submitTalentPoolApplication(
            @Parameter(description = "인재풀 등록 정보", required = true)
            @RequestBody HrDto.TalentPoolRequest request) {
        log.info("인재풀 등록 요청 - 이름: {}, 분야: {}", request.getName(), request.getField());
        HrDto.TalentPoolResponse response = hrService.submitTalentPoolApplication(request);
        return ResponseEntity.ok(CommonApiResponse.success("인재풀에 성공적으로 등록되었습니다.", response));
    }

    @Operation(summary = "모든 채용 지원서 조회", description = "관리자가 모든 채용 지원서를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "403", description = "권한 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @GetMapping("/admin/applications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<Page<HrDto.JobApplicationResponse>>> getAllJobApplications(
            @PageableDefault(size = 10) Pageable pageable) {
        log.info("모든 채용 지원서 조회 요청");
        Page<HrDto.JobApplicationResponse> applications = hrService.getAllJobApplications(pageable);
        return ResponseEntity.ok(CommonApiResponse.success("채용 지원서 목록을 조회했습니다.", applications));
    }

    @Operation(summary = "모든 인재풀 조회", description = "관리자가 모든 인재풀을 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "403", description = "권한 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @GetMapping("/admin/talent-pool")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<Page<HrDto.TalentPoolResponse>>> getAllTalentPool(
            @PageableDefault(size = 10) Pageable pageable) {
        log.info("모든 인재풀 조회 요청");
        Page<HrDto.TalentPoolResponse> talentPool = hrService.getAllTalentPool(pageable);
        return ResponseEntity.ok(CommonApiResponse.success("인재풀 목록을 조회했습니다.", talentPool));
    }

    @Operation(summary = "지원서 상태 변경", description = "관리자가 지원서 상태를 변경합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "상태 변경 성공", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "403", description = "권한 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "404", description = "지원서를 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PutMapping("/admin/applications/{applicationId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<HrDto.JobApplicationResponse>> updateApplicationStatus(
            @Parameter(description = "지원서 ID", required = true)
            @PathVariable Long applicationId,
            @Parameter(description = "상태 정보", required = true)
            @RequestBody HrDto.StatusUpdateRequest request) {
        log.info("지원서 상태 변경 요청 - ID: {}, 상태: {}", applicationId, request.getStatus());
        HrDto.JobApplicationResponse response = hrService.updateApplicationStatus(applicationId, request.getStatus());
        return ResponseEntity.ok(CommonApiResponse.success("지원서 상태가 변경되었습니다.", response));
    }

    @Operation(summary = "인재풀 상태 변경", description = "관리자가 인재풀 상태를 변경합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "상태 변경 성공", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "403", description = "권한 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "404", description = "인재풀 정보를 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PutMapping("/admin/talent-pool/{talentId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<HrDto.TalentPoolResponse>> updateTalentStatus(
            @Parameter(description = "인재풀 ID", required = true)
            @PathVariable Long talentId,
            @Parameter(description = "상태 정보", required = true)
            @RequestBody HrDto.StatusUpdateRequest request) {
        log.info("인재풀 상태 변경 요청 - ID: {}, 상태: {}", talentId, request.getStatus());
        HrDto.TalentPoolResponse response = hrService.updateTalentStatus(talentId, request.getStatus());
        return ResponseEntity.ok(CommonApiResponse.success("인재풀 상태가 변경되었습니다.", response));
    }

    @Operation(summary = "지원서 삭제", description = "관리자가 지원서를 삭제합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "삭제 성공", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "403", description = "권한 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "404", description = "지원서를 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @DeleteMapping("/admin/applications/{applicationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<Void>> deleteJobApplication(
            @Parameter(description = "지원서 ID", required = true)
            @PathVariable Long applicationId) {
        log.info("지원서 삭제 요청 - ID: {}", applicationId);
        hrService.deleteJobApplication(applicationId);
        return ResponseEntity.ok(CommonApiResponse.success("지원서가 삭제되었습니다.", null));
    }

    @Operation(summary = "인재풀 삭제", description = "관리자가 인재풀 정보를 삭제합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "삭제 성공", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "403", description = "권한 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "404", description = "인재풀 정보를 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @DeleteMapping("/admin/talent-pool/{talentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<Void>> deleteTalentPoolEntry(
            @Parameter(description = "인재풀 ID", required = true)
            @PathVariable Long talentId) {
        log.info("인재풀 삭제 요청 - ID: {}", talentId);
        hrService.deleteTalentPoolEntry(talentId);
        return ResponseEntity.ok(CommonApiResponse.success("인재풀 정보가 삭제되었습니다.", null));
    }

    @Operation(summary = "HR 통계 조회", description = "관리자가 HR 관련 통계를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "403", description = "권한 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<HrDto.HrStatsResponse>> getHrStats() {
        log.info("HR 통계 조회 요청");
        HrDto.HrStatsResponse stats = hrService.getHrStats();
        return ResponseEntity.ok(CommonApiResponse.success("HR 통계를 조회했습니다.", stats));
    }
}