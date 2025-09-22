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
import org.example.travellight.dto.ReviewDto;
import org.example.travellight.entity.User;
import org.example.travellight.exception.CustomException;
import org.example.travellight.service.ReviewService;
import org.example.travellight.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;

@Slf4j
@Tag(name = "리뷰 관리", description = "리뷰 작성, 조회, 관리 API")
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    private final UserService userService;
    
    @Operation(summary = "리뷰 작성", description = "예약에 대한 리뷰를 작성합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "리뷰 작성 성공",
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "401", description = "인증 필요", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PostMapping
    public ResponseEntity<CommonApiResponse<ReviewDto.ReviewResponse>> createReview(
            @Parameter(description = "리뷰 작성 정보", required = true)
            @Valid @RequestBody ReviewDto.ReviewRequest request,
            Principal principal) {
        
        User user = getCurrentUserLegacy(principal);
        ReviewDto.ReviewResponse response = reviewService.createReview(request, user);
        
        return ResponseEntity.ok(CommonApiResponse.success("리뷰가 성공적으로 작성되었습니다.", response));
    }
    
    @Operation(summary = "리뷰 수정", description = "작성한 리뷰를 수정합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "리뷰 수정 성공", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "403", description = "권한 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "404", description = "리뷰를 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PutMapping("/{reviewId}")
    public ResponseEntity<CommonApiResponse<ReviewDto.ReviewResponse>> updateReview(
            @Parameter(description = "리뷰 ID", required = true)
            @PathVariable Long reviewId,
            @Parameter(description = "리뷰 수정 정보", required = true)
            @Valid @RequestBody ReviewDto.ReviewUpdateRequest request,
            Principal principal) {
        
        User user = getCurrentUserLegacy(principal);
        ReviewDto.ReviewResponse response = reviewService.updateReview(reviewId, request, user);
        
        return ResponseEntity.ok(CommonApiResponse.success("리뷰가 성공적으로 수정되었습니다.", response));
    }
    
    @Operation(summary = "리뷰 삭제", description = "작성한 리뷰를 삭제합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "리뷰 삭제 성공", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "403", description = "권한 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "404", description = "리뷰를 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<CommonApiResponse<Void>> deleteReview(
            @Parameter(description = "리뷰 ID", required = true)
            @PathVariable Long reviewId,
            Principal principal) {
        
        User user = getCurrentUserLegacy(principal);
        reviewService.deleteReview(reviewId, user);
        
        return ResponseEntity.ok(CommonApiResponse.success("리뷰가 성공적으로 삭제되었습니다.", null));
    }
    
    @Operation(summary = "리뷰 상세 조회", description = "특정 리뷰의 상세 정보를 조회합니다.")
    @GetMapping("/{reviewId}")
    public ResponseEntity<CommonApiResponse<ReviewDto.ReviewResponse>> getReview(
            @Parameter(description = "리뷰 ID", required = true)
            @PathVariable Long reviewId,
            Principal principal) {
        
        User currentUser = getCurrentUserOrNull(principal);
        ReviewDto.ReviewResponse response = reviewService.getReview(reviewId, currentUser);
        
        return ResponseEntity.ok(CommonApiResponse.success("리뷰 정보를 조회했습니다.", response));
    }
    
    @Operation(summary = "제휴점 리뷰 목록 조회", description = "특정 제휴점의 리뷰 목록을 조회합니다.")
    @GetMapping("/place")
    public ResponseEntity<CommonApiResponse<Page<ReviewDto.ReviewResponse>>> getPlaceReviews(
            @Parameter(description = "제휴점명", required = true)
            @RequestParam String placeName,
            @Parameter(description = "제휴점 주소", required = true)
            @RequestParam String placeAddress,
            @Parameter(description = "정렬 기준 (latest, rating)", required = false)
            @RequestParam(defaultValue = "latest") String sortBy,
            @PageableDefault(size = 10) Pageable pageable,
            Principal principal) {
        
        User currentUser = getCurrentUserOrNull(principal);
        Page<ReviewDto.ReviewResponse> reviews = reviewService.getPlaceReviews(
                placeName, placeAddress, sortBy, pageable, currentUser);
        
        return ResponseEntity.ok(CommonApiResponse.success("제휴점 리뷰 목록을 조회했습니다.", reviews));
    }
    
    @Operation(summary = "내 리뷰 목록 조회", description = "로그인한 사용자가 작성한 리뷰 목록을 조회합니다.")
    @GetMapping("/my")
    public ResponseEntity<CommonApiResponse<Page<ReviewDto.ReviewResponse>>> getMyReviews(
            @PageableDefault(size = 10) Pageable pageable,
            Principal principal) {
        
        User user = getCurrentUserLegacy(principal);
        Page<ReviewDto.ReviewResponse> reviews = reviewService.getUserReviews(user, pageable);
        
        return ResponseEntity.ok(CommonApiResponse.success("내 리뷰 목록을 조회했습니다.", reviews));
    }
    
    @Operation(summary = "제휴점 리뷰 요약", description = "특정 제휴점의 리뷰 요약 정보를 조회합니다.")
    @GetMapping("/place/summary")
    public ResponseEntity<CommonApiResponse<ReviewDto.ReviewSummary>> getPlaceReviewSummary(
            @Parameter(description = "제휴점명", required = true)
            @RequestParam String placeName,
            @Parameter(description = "제휴점 주소", required = true)
            @RequestParam String placeAddress) {
        
        ReviewDto.ReviewSummary summary = reviewService.getPlaceReviewSummary(placeName, placeAddress);
        
        return ResponseEntity.ok(CommonApiResponse.success("제휴점 리뷰 요약을 조회했습니다.", summary));
    }
    
    @Operation(summary = "리뷰 도움이 됨 토글", description = "리뷰에 도움이 됨을 추가하거나 취소합니다.")
    @PostMapping("/{reviewId}/helpful")
    public ResponseEntity<CommonApiResponse<Boolean>> toggleHelpful(
            @Parameter(description = "리뷰 ID", required = true)
            @PathVariable Long reviewId,
            Principal principal) {
        
        User user = getCurrentUserLegacy(principal);
        boolean isHelpful = reviewService.toggleHelpful(reviewId, user);
        
        String message = isHelpful ? "도움이 됨을 추가했습니다." : "도움이 됨을 취소했습니다.";
        return ResponseEntity.ok(CommonApiResponse.success(message, isHelpful));
    }
    
    @Operation(summary = "리뷰 신고", description = "부적절한 리뷰를 신고합니다.")
    @PostMapping("/{reviewId}/report")
    public ResponseEntity<CommonApiResponse<Void>> reportReview(
            @Parameter(description = "리뷰 ID", required = true)
            @PathVariable Long reviewId,
            @Parameter(description = "신고 정보", required = true)
            @Valid @RequestBody ReviewDto.ReviewReportRequest request,
            Principal principal) {
        
        User user = getCurrentUserLegacy(principal);
        reviewService.reportReview(reviewId, request, user);
        
        return ResponseEntity.ok(CommonApiResponse.success("리뷰 신고가 접수되었습니다.", null));
    }
    
    @Operation(summary = "리뷰 사진 업로드", description = "리뷰에 첨부할 사진을 업로드합니다.")
    @PostMapping("/photos/upload")
    public ResponseEntity<CommonApiResponse<List<String>>> uploadReviewPhotos(
            @Parameter(description = "업로드할 사진 파일들", required = true)
            @RequestParam("files") List<MultipartFile> files,
            Principal principal) {
        
        // 로그인 확인
        getCurrentUserLegacy(principal);
        
        List<String> uploadedFilenames = reviewService.uploadReviewPhotos(files);
        
        return ResponseEntity.ok(CommonApiResponse.success("사진이 성공적으로 업로드되었습니다.", uploadedFilenames));
    }
    
    @Operation(summary = "리뷰 사진 삭제", description = "리뷰 사진을 삭제합니다.")
    @DeleteMapping("/photos/{photoId}")
    public ResponseEntity<CommonApiResponse<Void>> deleteReviewPhoto(
            @Parameter(description = "사진 ID", required = true)
            @PathVariable Long photoId,
            Principal principal) {
        
        User user = getCurrentUserLegacy(principal);
        reviewService.deleteReviewPhoto(photoId, user);
        
        return ResponseEntity.ok(CommonApiResponse.success("사진이 성공적으로 삭제되었습니다.", null));
    }
    
    @Operation(summary = "리뷰 작성 가능 여부 확인", description = "특정 예약에 대해 리뷰 작성이 가능한지 확인합니다.")
    @GetMapping("/can-write/{reservationId}")
    public ResponseEntity<CommonApiResponse<Boolean>> canWriteReview(
            @Parameter(description = "예약 ID", required = true)
            @PathVariable Long reservationId,
            @Parameter(description = "사용자 ID", required = true)
            @RequestParam Long userId) {
        
        User user = userService.getUserByIdEntity(userId);
        boolean canWrite = reviewService.canWriteReview(reservationId, user);
        
        return ResponseEntity.ok(CommonApiResponse.success("리뷰 작성 가능 여부를 확인했습니다.", canWrite));
    }
    
    @Operation(summary = "상위 평점 제휴점 조회", description = "평점이 높은 상위 제휴점 목록을 조회합니다.")
    @GetMapping("/top-rated-places")
    public ResponseEntity<CommonApiResponse<List<ReviewDto.PlaceReviewSummary>>> getTopRatedPlaces(
            @Parameter(description = "조회할 개수")
            @RequestParam(defaultValue = "10") int limit) {
        
        List<ReviewDto.PlaceReviewSummary> topRatedPlaces = reviewService.getTopRatedPlaces(limit);
        
        return ResponseEntity.ok(CommonApiResponse.success("상위 평점 제휴점 목록을 조회했습니다.", topRatedPlaces));
    }
    
    // 관리자 전용 API
    
    @Operation(summary = "관리자 답변 추가", description = "관리자가 리뷰에 답변을 추가합니다.")
    @PostMapping("/{reviewId}/admin-reply")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<ReviewDto.ReviewResponse>> addAdminReply(
            @Parameter(description = "리뷰 ID", required = true)
            @PathVariable Long reviewId,
            @Parameter(description = "관리자 답변", required = true)
            @Valid @RequestBody ReviewDto.AdminReplyRequest request,
            Principal principal) {
        
        User admin = getCurrentUserLegacy(principal);
        ReviewDto.ReviewResponse response = reviewService.addAdminReply(reviewId, request, admin);
        
        return ResponseEntity.ok(CommonApiResponse.success("관리자 답변이 추가되었습니다.", response));
    }
    
    @Operation(summary = "리뷰 상태 변경", description = "관리자가 리뷰 상태를 변경합니다.")
    @PutMapping("/{reviewId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<ReviewDto.ReviewResponse>> updateReviewStatus(
            @Parameter(description = "리뷰 ID", required = true)
            @PathVariable Long reviewId,
            @Parameter(description = "새 상태")
            @RequestParam String status,
            Principal principal) {
        
        User admin = getCurrentUserLegacy(principal);
        ReviewDto.ReviewResponse response = reviewService.updateReviewStatus(reviewId, status, admin);
        
        return ResponseEntity.ok(CommonApiResponse.success("리뷰 상태가 변경되었습니다.", response));
    }
    
    @Operation(summary = "최근 리뷰 조회", description = "관리자가 최근 작성된 리뷰를 조회합니다.")
    @GetMapping("/admin/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<Page<ReviewDto.ReviewResponse>>> getRecentReviews(
            @PageableDefault(size = 20) Pageable pageable) {
        
        Page<ReviewDto.ReviewResponse> reviews = reviewService.getRecentReviews(pageable);
        
        return ResponseEntity.ok(CommonApiResponse.success("최근 리뷰 목록을 조회했습니다.", reviews));
    }
    
    @Operation(summary = "신고가 많은 리뷰 조회", description = "관리자가 신고가 많은 리뷰를 조회합니다.")
    @GetMapping("/admin/high-reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonApiResponse<List<ReviewDto.ReviewResponse>>> getReviewsWithHighReports(
            @Parameter(description = "신고 횟수 임계값")
            @RequestParam(defaultValue = "3") int threshold) {
        
        List<ReviewDto.ReviewResponse> reviews = reviewService.getReviewsWithHighReports(threshold);
        
        return ResponseEntity.ok(CommonApiResponse.success("신고가 많은 리뷰 목록을 조회했습니다.", reviews));
    }
    
    // Private helper methods
    
    private User getCurrentUserLegacy(Principal principal) {
        if (principal == null) {
            throw new CustomException("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
        }
        
        try {
            return userService.getUserByEmail(principal.getName());
        } catch (Exception e) {
            throw new CustomException("사용자 정보를 찾을 수 없습니다.", HttpStatus.UNAUTHORIZED);
        }
    }
    
    private User getCurrentUser(Principal principal, HttpServletRequest request) {
        // Authorization 헤더에서 토큰 확인 (임시 방식)
        String authHeader = request.getHeader("Authorization");
        log.info("Authorization 헤더: {}", authHeader);
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // "Bearer " 제거
            log.info("추출된 토큰: {}", token);
            
            // 임시: 더미 토큰에서 사용자 ID 추출
            if (token.startsWith("user-") && token.endsWith("-token")) {
                try {
                    String userIdStr = token.substring(5, token.length() - 6); // "user-" 와 "-token" 제거
                    Long userId = Long.valueOf(userIdStr);
                    log.info("토큰에서 추출된 사용자 ID: {}", userId);
                    
                    User user = userService.getUserByIdEntity(userId);
                    log.info("사용자 조회 성공: {}", user.getEmail());
                    return user;
                } catch (Exception e) {
                    log.error("토큰 파싱 오류: {}", e.getMessage());
                    throw new CustomException("유효하지 않은 토큰입니다.", HttpStatus.UNAUTHORIZED);
                }
            }
        }
        
        log.warn("유효한 Authorization 헤더가 없음. 토큰: {}", authHeader);
        throw new CustomException("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
    }
    
    private User getCurrentUserOrNull(Principal principal) {
        if (principal == null) {
            return null;
        }
        
        try {
            return userService.getUserByEmail(principal.getName());
        } catch (Exception e) {
            return null;
        }
    }
}
