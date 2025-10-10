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
import org.example.travellight.dto.FaqDto;
import org.example.travellight.entity.FaqCategory;
import org.example.travellight.entity.User;
import org.example.travellight.exception.CustomException;
import org.example.travellight.service.FaqService;
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
@Tag(name = "FAQ 관리", description = "자주 묻는 질문(FAQ) 조회 및 관리 API")
@RestController
@RequestMapping("/api/faqs")
@RequiredArgsConstructor
public class FaqController {
    
    private final FaqService faqService;
    private final UserService userService;
    
    // 사용자용 API
    
    @Operation(summary = "FAQ 목록 조회", description = "모든 활성화된 FAQ 목록을 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @GetMapping
    public ResponseEntity<CommonApiResponse<List<FaqDto.FaqResponse>>> getAllFaqs() {
        List<FaqDto.FaqResponse> faqs = faqService.getAllFaqs();
        return ResponseEntity.ok(CommonApiResponse.success("FAQ 목록을 조회했습니다.", faqs));
    }
    
    @Operation(summary = "카테고리별 FAQ 조회", description = "특정 카테고리의 FAQ 목록을 조회합니다.")
    @GetMapping("/category/{category}")
    public ResponseEntity<CommonApiResponse<List<FaqDto.FaqResponse>>> getFaqsByCategory(
            @Parameter(description = "FAQ 카테고리", required = true)
            @PathVariable String category) {
        
        FaqCategory faqCategory = FaqCategory.fromCode(category);
        List<FaqDto.FaqResponse> faqs = faqService.getFaqsByCategory(faqCategory);
        
        return ResponseEntity.ok(CommonApiResponse.success("카테고리별 FAQ 목록을 조회했습니다.", faqs));
    }
    
    @Operation(summary = "FAQ 상세 조회", description = "특정 FAQ의 상세 정보를 조회합니다.")
    @GetMapping("/{faqId}")
    public ResponseEntity<CommonApiResponse<FaqDto.FaqResponse>> getFaq(
            @Parameter(description = "FAQ ID", required = true)
            @PathVariable Long faqId) {
        
        FaqDto.FaqResponse faq = faqService.getFaq(faqId);
        return ResponseEntity.ok(CommonApiResponse.success("FAQ 정보를 조회했습니다.", faq));
    }
    
    @Operation(summary = "FAQ 검색", description = "키워드로 FAQ를 검색합니다.")
    @GetMapping("/search")
    public ResponseEntity<CommonApiResponse<List<FaqDto.FaqResponse>>> searchFaqs(
            @Parameter(description = "검색 키워드")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "카테고리 필터")
            @RequestParam(required = false) String category) {
        
        List<FaqDto.FaqResponse> faqs;
        
        if (category != null && !category.isEmpty()) {
            FaqCategory faqCategory = FaqCategory.fromCode(category);
            faqs = faqService.searchFaqsByCategoryAndKeyword(faqCategory, keyword);
        } else {
            faqs = faqService.searchFaqs(keyword);
        }
        
        return ResponseEntity.ok(CommonApiResponse.success("FAQ 검색 결과를 조회했습니다.", faqs));
    }
    
    @Operation(summary = "FAQ 카테고리 목록 조회", description = "모든 FAQ 카테고리와 각 카테고리별 FAQ 개수를 조회합니다.")
    @GetMapping("/categories")
    public ResponseEntity<CommonApiResponse<List<FaqDto.FaqCategoryInfo>>> getAllCategories() {
        List<FaqDto.FaqCategoryInfo> categories = faqService.getAllCategories();
        return ResponseEntity.ok(CommonApiResponse.success("FAQ 카테고리 목록을 조회했습니다.", categories));
    }
    
    @Operation(summary = "인기 FAQ 조회", description = "조회수가 높은 인기 FAQ를 조회합니다.")
    @GetMapping("/popular")
    public ResponseEntity<CommonApiResponse<List<FaqDto.FaqResponse>>> getPopularFaqs(
            @Parameter(description = "조회할 개수")
            @RequestParam(defaultValue = "5") int limit) {
        
        List<FaqDto.FaqResponse> faqs = faqService.getPopularFaqs(limit);
        return ResponseEntity.ok(CommonApiResponse.success("인기 FAQ 목록을 조회했습니다.", faqs));
    }
    
    // 관리자용 API
    
    @Operation(summary = "FAQ 생성", description = "관리자가 새로운 FAQ를 생성합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "생성 성공",
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 필요"),
        @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<FaqDto.FaqResponse>> createFaq(
            @Parameter(description = "FAQ 생성 정보", required = true)
            @Valid @RequestBody FaqDto.FaqRequest request,
            Principal principal) {
        
        User admin = getCurrentUser(principal);
        FaqDto.FaqResponse response = faqService.createFaq(request, admin);
        
        return ResponseEntity.ok(CommonApiResponse.success("FAQ가 성공적으로 생성되었습니다.", response));
    }
    
    @Operation(summary = "FAQ 수정", description = "관리자가 FAQ를 수정합니다.")
    @PutMapping("/{faqId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<FaqDto.FaqResponse>> updateFaq(
            @Parameter(description = "FAQ ID", required = true)
            @PathVariable Long faqId,
            @Parameter(description = "FAQ 수정 정보", required = true)
            @Valid @RequestBody FaqDto.FaqUpdateRequest request,
            Principal principal) {
        
        User admin = getCurrentUser(principal);
        FaqDto.FaqResponse response = faqService.updateFaq(faqId, request, admin);
        
        return ResponseEntity.ok(CommonApiResponse.success("FAQ가 성공적으로 수정되었습니다.", response));
    }
    
    @Operation(summary = "FAQ 삭제", description = "관리자가 FAQ를 삭제합니다.")
    @DeleteMapping("/{faqId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<Void>> deleteFaq(
            @Parameter(description = "FAQ ID", required = true)
            @PathVariable Long faqId,
            Principal principal) {
        
        User admin = getCurrentUser(principal);
        faqService.deleteFaq(faqId, admin);
        
        return ResponseEntity.ok(CommonApiResponse.success("FAQ가 성공적으로 삭제되었습니다.", null));
    }
    
    @Operation(summary = "관리자용 FAQ 목록 조회", description = "관리자가 모든 FAQ를 조회합니다 (비활성화 포함).")
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<Page<FaqDto.FaqResponse>>> getAllFaqsForAdmin(
            @PageableDefault(size = 20) Pageable pageable) {
        
        Page<FaqDto.FaqResponse> faqs = faqService.getAllFaqsForAdmin(pageable);
        return ResponseEntity.ok(CommonApiResponse.success("관리자용 FAQ 목록을 조회했습니다.", faqs));
    }
    
    @Operation(summary = "관리자용 카테고리별 FAQ 조회", description = "관리자가 카테고리별 FAQ를 조회합니다 (비활성화 포함).")
    @GetMapping("/admin/category/{category}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<List<FaqDto.FaqResponse>>> getFaqsByCategoryForAdmin(
            @Parameter(description = "FAQ 카테고리", required = true)
            @PathVariable String category) {
        
        FaqCategory faqCategory = FaqCategory.fromCode(category);
        List<FaqDto.FaqResponse> faqs = faqService.getFaqsByCategoryForAdmin(faqCategory);
        
        return ResponseEntity.ok(CommonApiResponse.success("관리자용 카테고리별 FAQ 목록을 조회했습니다.", faqs));
    }
    
    @Operation(summary = "FAQ 활성화/비활성화", description = "관리자가 FAQ의 활성화 상태를 변경합니다.")
    @PutMapping("/{faqId}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<FaqDto.FaqResponse>> toggleFaqActive(
            @Parameter(description = "FAQ ID", required = true)
            @PathVariable Long faqId,
            Principal principal) {
        
        User admin = getCurrentUser(principal);
        FaqDto.FaqResponse response = faqService.toggleFaqActive(faqId, admin);
        
        String message = response.getIsActive() ? "FAQ가 활성화되었습니다." : "FAQ가 비활성화되었습니다.";
        return ResponseEntity.ok(CommonApiResponse.success(message, response));
    }
    
    @Operation(summary = "FAQ 순서 변경", description = "관리자가 FAQ의 표시 순서를 변경합니다.")
    @PutMapping("/{faqId}/order")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<FaqDto.FaqResponse>> updateFaqOrder(
            @Parameter(description = "FAQ ID", required = true)
            @PathVariable Long faqId,
            @Parameter(description = "새로운 순서", required = true)
            @RequestParam Integer order,
            Principal principal) {
        
        User admin = getCurrentUser(principal);
        FaqDto.FaqResponse response = faqService.updateFaqOrder(faqId, order, admin);
        
        return ResponseEntity.ok(CommonApiResponse.success("FAQ 순서가 변경되었습니다.", response));
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

