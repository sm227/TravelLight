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
import org.example.travellight.dto.InquiryDto;
import org.example.travellight.entity.InquiryStatus;
import org.example.travellight.entity.User;
import org.example.travellight.exception.CustomException;
import org.example.travellight.service.InquiryService;
import org.example.travellight.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;

@Slf4j
@Tag(name = "문의 관리", description = "1:1 문의 생성, 조회 및 관리 API")
@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {
    
    private final InquiryService inquiryService;
    private final UserService userService;
    
    // 사용자용 API
    
    @Operation(summary = "문의 생성", description = "새로운 1:1 문의를 생성합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "문의 생성 성공",
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    @PostMapping
    public ResponseEntity<CommonApiResponse<InquiryDto.InquiryResponse>> createInquiry(
            @Parameter(description = "문의 작성 정보", required = true)
            @Valid @RequestBody InquiryDto.InquiryRequest request,
            Principal principal) {
        
        User user = getCurrentUser(principal);
        InquiryDto.InquiryResponse response = inquiryService.createInquiry(request, user);
        
        return ResponseEntity.ok(CommonApiResponse.success("문의가 성공적으로 접수되었습니다.", response));
    }
    
    @Operation(summary = "내 문의 목록 조회", description = "로그인한 사용자의 문의 목록을 조회합니다.")
    @GetMapping("/my")
    public ResponseEntity<CommonApiResponse<List<InquiryDto.InquiryResponse>>> getMyInquiries(
            Principal principal) {
        
        User user = getCurrentUser(principal);
        List<InquiryDto.InquiryResponse> inquiries = inquiryService.getMyInquiries(user);
        
        return ResponseEntity.ok(CommonApiResponse.success("내 문의 목록을 조회했습니다.", inquiries));
    }
    
    @Operation(summary = "문의 상세 조회", description = "특정 문의의 상세 정보를 조회합니다.")
    @GetMapping("/{inquiryId}")
    public ResponseEntity<CommonApiResponse<InquiryDto.InquiryResponse>> getInquiry(
            @Parameter(description = "문의 ID", required = true)
            @PathVariable Long inquiryId,
            Principal principal) {
        
        User user = getCurrentUser(principal);
        InquiryDto.InquiryResponse inquiry = inquiryService.getInquiry(inquiryId, user);
        
        return ResponseEntity.ok(CommonApiResponse.success("문의 정보를 조회했습니다.", inquiry));
    }
    
    @Operation(summary = "내 답변 대기 중인 문의 개수", description = "로그인한 사용자의 답변 대기 중인 문의 개수를 조회합니다.")
    @GetMapping("/my/pending-count")
    public ResponseEntity<CommonApiResponse<Long>> getMyPendingCount(
            Principal principal) {
        
        User user = getCurrentUser(principal);
        Long count = inquiryService.getMyPendingCount(user);
        
        return ResponseEntity.ok(CommonApiResponse.success("답변 대기 중인 문의 개수를 조회했습니다.", count));
    }
    
    // 관리자용 API
    
    @Operation(summary = "모든 문의 조회", description = "관리자가 모든 문의를 조회합니다.")
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<Page<InquiryDto.InquiryResponse>>> getAllInquiries(
            @PageableDefault(size = 20) Pageable pageable) {
        
        Page<InquiryDto.InquiryResponse> inquiries = inquiryService.getAllInquiries(pageable);
        return ResponseEntity.ok(CommonApiResponse.success("모든 문의 목록을 조회했습니다.", inquiries));
    }
    
    @Operation(summary = "상태별 문의 조회", description = "관리자가 상태별 문의를 조회합니다.")
    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<Page<InquiryDto.InquiryResponse>>> getInquiriesByStatus(
            @Parameter(description = "문의 상태", required = true)
            @PathVariable String status,
            @PageableDefault(size = 20) Pageable pageable) {
        
        InquiryStatus inquiryStatus = InquiryStatus.valueOf(status);
        Page<InquiryDto.InquiryResponse> inquiries = inquiryService.getInquiriesByStatus(inquiryStatus, pageable);
        
        return ResponseEntity.ok(CommonApiResponse.success("상태별 문의 목록을 조회했습니다.", inquiries));
    }
    
    @Operation(summary = "관리자 답변 추가", description = "관리자가 문의에 답변을 추가합니다.")
    @PostMapping("/{inquiryId}/admin-reply")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<InquiryDto.InquiryResponse>> addAdminReply(
            @Parameter(description = "문의 ID", required = true)
            @PathVariable Long inquiryId,
            @Parameter(description = "관리자 답변", required = true)
            @Valid @RequestBody InquiryDto.AdminReplyRequest request,
            Principal principal) {
        
        User admin = getCurrentUser(principal);
        InquiryDto.InquiryResponse response = inquiryService.addAdminReply(inquiryId, request, admin);
        
        return ResponseEntity.ok(CommonApiResponse.success("답변이 성공적으로 추가되었습니다.", response));
    }
    
    @Operation(summary = "문의 상태 변경", description = "관리자가 문의 상태를 변경합니다.")
    @PutMapping("/{inquiryId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<InquiryDto.InquiryResponse>> updateInquiryStatus(
            @Parameter(description = "문의 ID", required = true)
            @PathVariable Long inquiryId,
            @Parameter(description = "새 상태", required = true)
            @RequestParam String status,
            Principal principal) {
        
        User admin = getCurrentUser(principal);
        InquiryStatus inquiryStatus = InquiryStatus.valueOf(status);
        InquiryDto.InquiryResponse response = inquiryService.updateInquiryStatus(inquiryId, inquiryStatus, admin);
        
        return ResponseEntity.ok(CommonApiResponse.success("문의 상태가 변경되었습니다.", response));
    }
    
    @Operation(summary = "답변 대기 중인 문의 개수", description = "관리자가 답변 대기 중인 문의 개수를 조회합니다.")
    @GetMapping("/admin/pending-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<Long>> getPendingCount() {
        Long count = inquiryService.getPendingCount();
        return ResponseEntity.ok(CommonApiResponse.success("답변 대기 중인 문의 개수를 조회했습니다.", count));
    }
    
    // Private helper methods
    
    private User getCurrentUser(Principal principal) {
        if (principal == null) {
            throw new CustomException("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
        }
        
        try {
            return userService.getUserByEmail(principal.getName());
        } catch (Exception e) {
            throw new CustomException("사용자 정보를 찾을 수 없습니다.", HttpStatus.UNAUTHORIZED);
        }
    }
}

