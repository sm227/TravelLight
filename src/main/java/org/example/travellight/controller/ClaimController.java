package org.example.travellight.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.ApiResponse;
import org.example.travellight.dto.ClaimDto;
import org.example.travellight.entity.User;
import org.example.travellight.service.ClaimService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Slf4j
@Tag(name = "클레임 관리", description = "사용자 클레임 관리 API")
@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {
    
    private final ClaimService claimService;
    
    @Operation(summary = "클레임 생성", description = "새로운 클레임을 생성합니다.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "클레임 생성 성공", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 필요", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @PostMapping
    public ResponseEntity<ApiResponse<ClaimDto.ClaimResponse>> createClaim(
            @Parameter(description = "클레임 생성 정보", required = true)
            @Valid @RequestBody ClaimDto.ClaimRequest request,
            Principal principal) {
        
        User adminUser = getCurrentUser(principal);
        ClaimDto.ClaimResponse response = claimService.createClaim(request, adminUser);
        
        return ResponseEntity.ok(ApiResponse.success("클레임이 성공적으로 생성되었습니다.", response));
    }
    
    @Operation(summary = "사용자별 클레임 목록 조회", description = "특정 사용자의 클레임 목록을 조회합니다.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "클레임 목록 조회 성공", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 필요", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ClaimDto.ClaimResponse>>> getClaimsByUserId(
            @Parameter(description = "사용자 ID", required = true)
            @PathVariable Long userId) {
        
        List<ClaimDto.ClaimResponse> response = claimService.getClaimsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("클레임 목록을 성공적으로 조회했습니다.", response));
    }
    
    @Operation(summary = "전체 클레임 목록 조회", description = "모든 클레임 목록을 조회합니다.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "클레임 목록 조회 성공", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 필요", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<ClaimDto.ClaimResponse>>> getAllClaims() {
        List<ClaimDto.ClaimResponse> response = claimService.getAllClaims();
        return ResponseEntity.ok(ApiResponse.success("클레임 목록을 성공적으로 조회했습니다.", response));
    }
    
    @Operation(summary = "클레임 상세 조회", description = "특정 클레임의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "클레임 상세 조회 성공", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "클레임을 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 필요", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @GetMapping("/{claimId}")
    public ResponseEntity<ApiResponse<ClaimDto.ClaimResponse>> getClaimById(
            @Parameter(description = "클레임 ID", required = true)
            @PathVariable Long claimId) {
        
        ClaimDto.ClaimResponse response = claimService.getClaimById(claimId);
        return ResponseEntity.ok(ApiResponse.success("클레임 상세 정보를 성공적으로 조회했습니다.", response));
    }
    
    @Operation(summary = "클레임 수정", description = "클레임 정보를 수정합니다.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "클레임 수정 성공", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "클레임을 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 필요", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @PutMapping("/{claimId}")
    public ResponseEntity<ApiResponse<ClaimDto.ClaimResponse>> updateClaim(
            @Parameter(description = "클레임 ID", required = true)
            @PathVariable Long claimId,
            @Parameter(description = "클레임 수정 정보", required = true)
            @Valid @RequestBody ClaimDto.ClaimUpdateRequest request) {
        
        ClaimDto.ClaimResponse response = claimService.updateClaim(claimId, request);
        return ResponseEntity.ok(ApiResponse.success("클레임이 성공적으로 수정되었습니다.", response));
    }
    
    @Operation(summary = "클레임 삭제", description = "클레임을 삭제합니다.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "클레임 삭제 성공", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "클레임을 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 필요", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @DeleteMapping("/{claimId}")
    public ResponseEntity<ApiResponse<Void>> deleteClaim(
            @Parameter(description = "클레임 ID", required = true)
            @PathVariable Long claimId) {
        
        claimService.deleteClaim(claimId);
        return ResponseEntity.ok(ApiResponse.success("클레임이 성공적으로 삭제되었습니다.", null));
    }
    
    @Operation(summary = "클레임 해결 처리", description = "클레임을 해결 상태로 변경합니다.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "클레임 해결 성공", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "클레임을 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 필요", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @PostMapping("/{claimId}/resolve")
    public ResponseEntity<ApiResponse<ClaimDto.ClaimResponse>> resolveClaim(
            @Parameter(description = "클레임 ID", required = true)
            @PathVariable Long claimId,
            @Parameter(description = "해결 내용", required = true)
            @RequestBody String resolution) {
        
        ClaimDto.ClaimResponse response = claimService.resolveClaim(claimId, resolution);
        return ResponseEntity.ok(ApiResponse.success("클레임이 성공적으로 해결되었습니다.", response));
    }
    
    // 현재 사용자 정보 가져오기 (임시 구현)
    private User getCurrentUser(Principal principal) {
        // TODO: 실제 인증 시스템과 연동
        // 현재는 임시로 더미 사용자 반환
        return User.builder()
            .id(1L)
            .name("관리자")
            .email("admin@example.com")
            .build();
    }
}
