package org.example.travellight.controller;

import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/faqs")
@RequiredArgsConstructor
@Tag(name = "FAQ", description = "FAQ 관련 API")
public class FaqController {

    private final FaqService faqService;
    private final UserService userService;

    // 사용자용 API

    @GetMapping
    @Operation(summary = "FAQ 목록 조회", description = "활성화된 모든 FAQ를 조회합니다.")
    public ResponseEntity<CommonApiResponse<List<FaqDto.FaqResponse>>> getAllFaqs() {
        log.info("FAQ 목록 조회 요청");
        List<FaqDto.FaqResponse> faqs = faqService.getAllFaqs();
        return ResponseEntity.ok(CommonApiResponse.success("FAQ 목록을 조회했습니다.", faqs));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "카테고리별 FAQ 목록 조회")
    public ResponseEntity<CommonApiResponse<List<FaqDto.FaqResponse>>> getFaqsByCategory(
            @PathVariable String category) {
        log.info("카테고리별 FAQ 목록 조회 요청: {}", category);
        
        try {
            FaqCategory faqCategory = FaqCategory.valueOf(category.toUpperCase());
            List<FaqDto.FaqResponse> faqs = faqService.getFaqsByCategory(faqCategory);
            return ResponseEntity.ok(CommonApiResponse.success("카테고리별 FAQ를 조회했습니다.", faqs));
        } catch (IllegalArgumentException e) {
            log.error("잘못된 카테고리: {}", category);
            return ResponseEntity.badRequest()
                    .body(CommonApiResponse.error("잘못된 카테고리입니다: " + category));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "FAQ 상세 조회")
    public ResponseEntity<CommonApiResponse<FaqDto.FaqResponse>> getFaq(@PathVariable Long id) {
        log.info("FAQ 상세 조회 요청: {}", id);
        FaqDto.FaqResponse faq = faqService.getFaq(id);
        return ResponseEntity.ok(CommonApiResponse.success("FAQ를 조회했습니다.", faq));
    }

    @GetMapping("/search")
    @Operation(summary = "FAQ 검색")
    public ResponseEntity<CommonApiResponse<List<FaqDto.FaqResponse>>> searchFaqs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category) {
        log.info("FAQ 검색 요청 - keyword: {}, category: {}", keyword, category);
        
        List<FaqDto.FaqResponse> faqs;
        
        if (category != null && !category.isEmpty()) {
            try {
                FaqCategory faqCategory = FaqCategory.valueOf(category.toUpperCase());
                faqs = faqService.searchFaqsByCategoryAndKeyword(faqCategory, keyword);
            } catch (IllegalArgumentException e) {
                log.error("잘못된 카테고리: {}", category);
                return ResponseEntity.badRequest()
                        .body(CommonApiResponse.error("잘못된 카테고리입니다: " + category));
            }
        } else {
            faqs = faqService.searchFaqs(keyword);
        }
        
        return ResponseEntity.ok(CommonApiResponse.success("FAQ 검색 결과를 조회했습니다.", faqs));
    }

    @GetMapping("/categories")
    @Operation(summary = "카테고리 목록 조회", description = "각 카테고리별 FAQ 개수를 포함합니다.")
    public ResponseEntity<CommonApiResponse<List<FaqDto.FaqCategoryInfo>>> getAllCategories() {
        log.info("FAQ 카테고리 목록 조회 요청");
        List<FaqDto.FaqCategoryInfo> categories = faqService.getAllCategories();
        return ResponseEntity.ok(CommonApiResponse.success("카테고리 목록을 조회했습니다.", categories));
    }

    @GetMapping("/popular")
    @Operation(summary = "인기 FAQ 조회", description = "조회수 기준 상위 FAQ를 조회합니다.")
    public ResponseEntity<CommonApiResponse<List<FaqDto.FaqResponse>>> getPopularFaqs(
            @RequestParam(defaultValue = "5") int limit) {
        log.info("인기 FAQ 조회 요청 - limit: {}", limit);
        List<FaqDto.FaqResponse> faqs = faqService.getPopularFaqs(limit);
        return ResponseEntity.ok(CommonApiResponse.success("인기 FAQ를 조회했습니다.", faqs));
    }

    // 관리자용 API

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "FAQ 생성 (관리자)")
    public ResponseEntity<CommonApiResponse<FaqDto.FaqResponse>> createFaq(
            @Valid @RequestBody FaqDto.FaqRequest request,
            Principal principal) {
        User admin = getCurrentUser(principal);
        log.info("FAQ 생성 요청 - admin: {}", admin.getEmail());
        FaqDto.FaqResponse faq = faqService.createFaq(request, admin);
        return ResponseEntity.ok(CommonApiResponse.success("FAQ가 생성되었습니다.", faq));
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "FAQ 수정 (관리자)")
    public ResponseEntity<CommonApiResponse<FaqDto.FaqResponse>> updateFaq(
            @PathVariable Long id,
            @Valid @RequestBody FaqDto.FaqUpdateRequest request,
            Principal principal) {
        User admin = getCurrentUser(principal);
        log.info("FAQ 수정 요청 - id: {}, admin: {}", id, admin.getEmail());
        FaqDto.FaqResponse faq = faqService.updateFaq(id, request, admin);
        return ResponseEntity.ok(CommonApiResponse.success("FAQ가 수정되었습니다.", faq));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "FAQ 삭제 (관리자)")
    public ResponseEntity<CommonApiResponse<Void>> deleteFaq(
            @PathVariable Long id,
            Principal principal) {
        User admin = getCurrentUser(principal);
        log.info("FAQ 삭제 요청 - id: {}, admin: {}", id, admin.getEmail());
        faqService.deleteFaq(id, admin);
        return ResponseEntity.ok(CommonApiResponse.success("FAQ가 삭제되었습니다.", null));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "모든 FAQ 조회 (관리자)", description = "비활성화된 FAQ도 포함합니다.")
    public ResponseEntity<CommonApiResponse<Page<FaqDto.FaqResponse>>> getAllFaqsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("관리자 FAQ 목록 조회 요청 - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<FaqDto.FaqResponse> faqs = faqService.getAllFaqsForAdmin(pageable);
        return ResponseEntity.ok(CommonApiResponse.success("관리자 FAQ 목록을 조회했습니다.", faqs));
    }

    @GetMapping("/admin/category/{category}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "카테고리별 FAQ 조회 (관리자)")
    public ResponseEntity<CommonApiResponse<List<FaqDto.FaqResponse>>> getFaqsByCategoryForAdmin(
            @PathVariable String category) {
        log.info("관리자 카테고리별 FAQ 조회 요청: {}", category);
        
        try {
            FaqCategory faqCategory = FaqCategory.valueOf(category.toUpperCase());
            List<FaqDto.FaqResponse> faqs = faqService.getFaqsByCategoryForAdmin(faqCategory);
            return ResponseEntity.ok(CommonApiResponse.success("관리자 카테고리별 FAQ를 조회했습니다.", faqs));
        } catch (IllegalArgumentException e) {
            log.error("잘못된 카테고리: {}", category);
            return ResponseEntity.badRequest()
                    .body(CommonApiResponse.error("잘못된 카테고리입니다: " + category));
        }
    }

    @PatchMapping("/admin/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "FAQ 활성화/비활성화 토글 (관리자)")
    public ResponseEntity<CommonApiResponse<FaqDto.FaqResponse>> toggleFaqActive(
            @PathVariable Long id,
            Principal principal) {
        User admin = getCurrentUser(principal);
        log.info("FAQ 활성화 토글 요청 - id: {}, admin: {}", id, admin.getEmail());
        FaqDto.FaqResponse faq = faqService.toggleFaqActive(id, admin);
        return ResponseEntity.ok(CommonApiResponse.success("FAQ 활성화 상태가 변경되었습니다.", faq));
    }

    @PatchMapping("/admin/{id}/order")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "FAQ 정렬 순서 변경 (관리자)")
    public ResponseEntity<CommonApiResponse<FaqDto.FaqResponse>> updateFaqOrder(
            @PathVariable Long id,
            @RequestParam Integer newOrder,
            Principal principal) {
        User admin = getCurrentUser(principal);
        log.info("FAQ 순서 변경 요청 - id: {}, newOrder: {}, admin: {}", id, newOrder, admin.getEmail());
        FaqDto.FaqResponse faq = faqService.updateFaqOrder(id, newOrder, admin);
        return ResponseEntity.ok(CommonApiResponse.success("FAQ 순서가 변경되었습니다.", faq));
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

