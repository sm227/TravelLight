package org.example.travellight.controller;

import lombok.RequiredArgsConstructor;
import org.example.travellight.dto.CommonApiResponse;
import org.example.travellight.dto.ReservationDto;
import org.example.travellight.service.ReservationService;
import org.example.travellight.service.ReviewService;
import org.example.travellight.service.UserService;
import org.example.travellight.service.StorageItemService;
import org.example.travellight.dto.StorageItemDto;
import org.example.travellight.entity.User;
import org.example.travellight.dto.ReviewDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {
    
    private static final Logger logger = LoggerFactory.getLogger(ReservationController.class);
    
    private final ReservationService reservationService;
    private final ReviewService reviewService;
    private final UserService userService;
    private final StorageItemService storageItemService;
    
    @PostMapping
    public ResponseEntity<ReservationDto> createReservation(@RequestBody ReservationDto reservationDto) {
        logger.info("예약 생성 요청: {}", reservationDto);
        try {
            ReservationDto createdReservation = reservationService.createReservation(reservationDto);
            logger.info("예약 생성 성공: {}", createdReservation);
            return new ResponseEntity<>(createdReservation, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("예약 생성 중 오류 발생: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @PutMapping("/{reservationNumber}/payment-id")
    public ResponseEntity<CommonApiResponse> updatePaymentId(@PathVariable String reservationNumber,
                                                             @RequestBody Map<String, String> request) {
        try {
            String paymentId = request.get("paymentId");
            
            if (paymentId == null || paymentId.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(CommonApiResponse.error("결제 ID가 필요합니다."));
            }
            
            logger.info("예약 결제 ID 업데이트 요청: reservationNumber = {}, paymentId = {}", 
                       reservationNumber, paymentId);
            
            reservationService.updatePaymentId(reservationNumber, paymentId);
            
            logger.info("예약 결제 ID 업데이트 성공: reservationNumber = {}", reservationNumber);
            
            return ResponseEntity.ok(CommonApiResponse.success("결제 ID가 성공적으로 업데이트되었습니다.", null));
            
        } catch (Exception e) {
            logger.error("예약 결제 ID 업데이트 중 오류 발생: reservationNumber = {}", reservationNumber, e);
            return ResponseEntity.badRequest()
                .body(CommonApiResponse.error("결제 ID 업데이트 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ReservationDto> getReservationById(@PathVariable Long id) {
        ReservationDto reservation = reservationService.getReservationById(id);
        return ResponseEntity.ok(reservation);
    }
    
    @GetMapping("/number/{reservationNumber}")
    public ResponseEntity<ReservationDto> getReservationByNumber(@PathVariable String reservationNumber) {
        ReservationDto reservation = reservationService.getReservationByNumber(reservationNumber);
        return ResponseEntity.ok(reservation);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReservationDto>> getUserReservations(@PathVariable("userId") Long userId) {
        List<ReservationDto> reservations = reservationService.getUserReservations(userId);
        return ResponseEntity.ok(reservations);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id) {
        reservationService.cancelReservation(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{reservationNumber}/cancel")
    public ResponseEntity<CommonApiResponse> cancelReservationByNumber(@PathVariable String reservationNumber) {
        logger.info("예약 취소 요청: {}", reservationNumber);
        try {
            reservationService.cancelReservationByNumber(reservationNumber);
            logger.info("예약 취소 성공: {}", reservationNumber);
            return ResponseEntity.ok(CommonApiResponse.success("예약이 성공적으로 취소되었습니다.", null));
        } catch (Exception e) {
            logger.error("예약 취소 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(CommonApiResponse.error(e.getMessage()));
        }
    }
    
    // 파트너 대시보드를 위한 매장명별 예약 조회
    @GetMapping("/store/{placeName}")
    public ResponseEntity<List<ReservationDto>> getReservationsByPlace(
            @PathVariable("placeName") String placeName) {
        List<ReservationDto> reservations = reservationService.getReservationsByPlaceName(placeName);
        return ResponseEntity.ok(reservations);
    }
    
    // 관리자 대시보드를 위한 최근 예약 조회
    @GetMapping("/recent")
    public ResponseEntity<List<ReservationDto>> getRecentReservations(
            @RequestParam(defaultValue = "10") int limit) {
        List<ReservationDto> reservations = reservationService.getRecentReservations(limit);
        return ResponseEntity.ok(reservations);
    }
    
    // 예약 상태를 COMPLETED로 업데이트 (매장 용량 복원)
    @PutMapping("/{reservationNumber}/complete")
    public ResponseEntity<CommonApiResponse> completeReservation(@PathVariable String reservationNumber) {
        logger.info("예약 완료 처리 요청: {}", reservationNumber);
        try {
            reservationService.updateReservationStatusToCompleted(reservationNumber);
            logger.info("예약 완료 처리 성공: {}", reservationNumber);
            return ResponseEntity.ok(CommonApiResponse.success("예약이 성공적으로 완료되었습니다.", null));
        } catch (Exception e) {
            logger.error("예약 완료 처리 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(CommonApiResponse.error(e.getMessage()));
        }
    }
    
    // 리뷰 작성 가능 여부 확인 API
    @GetMapping("/{reservationId}/can-write-review")
    public ResponseEntity<CommonApiResponse<Boolean>> canWriteReview(
            @PathVariable Long reservationId,
            @RequestParam Long userId) {
        
        logger.info("리뷰 작성 가능 여부 확인 요청: reservationId = {}, userId = {}", reservationId, userId);
        
        try {
            User user = userService.getUserByIdEntity(userId);
            boolean canWrite = reviewService.canWriteReview(reservationId, user);
            
            logger.info("리뷰 작성 가능 여부: {}", canWrite);
            return ResponseEntity.ok(CommonApiResponse.success("리뷰 작성 가능 여부를 확인했습니다.", canWrite));
        } catch (Exception e) {
            logger.error("리뷰 작성 가능 여부 확인 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(CommonApiResponse.error("리뷰 작성 가능 여부 확인 중 오류가 발생했습니다."));
        }
    }
    
    // 테스트용 간단한 API
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        logger.info("테스트 API 호출됨");
        return ResponseEntity.ok("ReservationController 테스트 성공!");
    }
    
    // 리뷰 작성 API
    @PostMapping("/reviews")
    public ResponseEntity<CommonApiResponse<ReviewDto.ReviewResponse>> createReview(
            @RequestBody ReviewDto.ReviewRequest request,
            @RequestParam Long userId) {
        
        logger.info("=== 리뷰 작성 API 호출됨 ===");
        logger.info("userId: {}", userId);
        logger.info("요청 데이터: {}", request);
        
        try {
            // 사용자 조회
            logger.info("사용자 조회 시작 - userId: {}", userId);
            User user = userService.getUserByIdEntity(userId);
            logger.info("사용자 조회 성공 - userEmail: {}", user.getEmail());
            
            // 리뷰 생성
            logger.info("리뷰 생성 서비스 호출");
            ReviewDto.ReviewResponse response = reviewService.createReview(request, user);
            
            logger.info("리뷰 작성 성공: reviewId = {}", response.getId());
            return ResponseEntity.ok(CommonApiResponse.success("리뷰가 성공적으로 작성되었습니다.", response));
        } catch (Exception e) {
            logger.error("리뷰 작성 중 오류 발생", e);
            return ResponseEntity.badRequest().body(CommonApiResponse.error("리뷰 작성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    // 예약의 리뷰 작성 상태 확인 API
    @GetMapping("/{reservationId}/review-status")
    public ResponseEntity<CommonApiResponse<Map<String, Object>>> getReviewStatus(
            @PathVariable Long reservationId) {
        
        logger.info("리뷰 상태 확인 요청 - 예약 ID: {}", reservationId);
        
        try {
            // 해당 예약의 활성 리뷰가 있는지 확인
            boolean hasReview = reviewService.hasActiveReview(reservationId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("hasReview", hasReview);
            
            logger.info("리뷰 상태 확인 결과 - 예약 ID: {}, 리뷰 존재: {}", reservationId, hasReview);
            return ResponseEntity.ok(CommonApiResponse.success("리뷰 상태를 확인했습니다.", result));
        } catch (Exception e) {
            logger.error("리뷰 상태 확인 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(CommonApiResponse.error("리뷰 상태 확인 중 오류가 발생했습니다."));
        }
    }
    
    // 예약의 리뷰 조회 API
    @GetMapping("/{reservationId}/review")
    public ResponseEntity<CommonApiResponse<ReviewDto.ReviewResponse>> getReviewByReservation(
            @PathVariable Long reservationId) {
        
        logger.info("=== 예약 리뷰 조회 API 호출 ===");
        logger.info("예약 ID: {}", reservationId);
        
        try {
            logger.info("리뷰 서비스 호출 중...");
            ReviewDto.ReviewResponse review = reviewService.getReviewByReservationId(reservationId);
            
            if (review != null) {
                logger.info("예약 리뷰 조회 성공 - 예약 ID: {}, 리뷰 ID: {}", reservationId, review.getId());
                return ResponseEntity.ok(CommonApiResponse.success("리뷰를 조회했습니다.", review));
            } else {
                logger.info("조회할 리뷰 없음 - 예약 ID: {}", reservationId);
                return ResponseEntity.ok(CommonApiResponse.success("리뷰가 없습니다.", null));
            }
        } catch (Exception e) {
            logger.error("=== 리뷰 조회 중 심각한 오류 발생 ===", e);
            logger.error("오류 메시지: {}", e.getMessage());
            logger.error("오류 타입: {}", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("리뷰 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    // 예약의 리뷰 수정 API
    @PutMapping("/{reservationId}/review")
    public ResponseEntity<CommonApiResponse<ReviewDto.ReviewResponse>> updateReviewByReservation(
            @PathVariable Long reservationId,
            @RequestBody ReviewDto.ReviewUpdateRequest request,
            @RequestParam Long userId) {
        
        logger.info("=== 예약 리뷰 수정 API 호출 ===");
        logger.info("예약 ID: {}, 사용자 ID: {}", reservationId, userId);
        logger.info("수정 요청 데이터: {}", request);
        
        try {
            logger.info("사용자 조회 중...");
            User user = userService.getUserByIdEntity(userId);
            logger.info("사용자 조회 성공: {}", user.getId());
            
            // 먼저 기존 리뷰를 조회
            logger.info("기존 리뷰 조회 중...");
            ReviewDto.ReviewResponse existingReview = reviewService.getReviewByReservationId(reservationId);
            if (existingReview == null) {
                logger.warn("수정할 리뷰가 없음 - 예약 ID: {}", reservationId);
                return ResponseEntity.badRequest().body(CommonApiResponse.error("수정할 리뷰가 없습니다."));
            }
            logger.info("기존 리뷰 조회 성공: 리뷰 ID {}", existingReview.getId());
            
            // 리뷰 수정
            logger.info("리뷰 수정 서비스 호출 중...");
            ReviewDto.ReviewResponse updatedReview = reviewService.updateReview(existingReview.getId(), request, user);
            
            logger.info("예약 리뷰 수정 성공 - 예약 ID: {}, 리뷰 ID: {}", reservationId, updatedReview.getId());
            return ResponseEntity.ok(CommonApiResponse.success("리뷰가 성공적으로 수정되었습니다.", updatedReview));
            
        } catch (Exception e) {
            logger.error("=== 리뷰 수정 중 심각한 오류 발생 ===", e);
            logger.error("오류 메시지: {}", e.getMessage());
            logger.error("오류 타입: {}", e.getClass().getSimpleName());
            if (e.getCause() != null) {
                logger.error("원인: {}", e.getCause().getMessage());
            }
            StackTraceElement[] stackTrace = e.getStackTrace();
            if (stackTrace.length > 0) {
                logger.error("스택 트레이스 첫 번째: {}", stackTrace[0]);
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("리뷰 수정 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    // 테스트용: 예약의 리뷰 삭제 (관리자 또는 개발자용)
    @DeleteMapping("/{reservationId}/review")
    public ResponseEntity<CommonApiResponse<String>> deleteReviewByReservation(
            @PathVariable Long reservationId) {
        
        logger.info("=== 예약 리뷰 삭제 API 호출 ===");
        logger.info("예약 ID: {}", reservationId);
        
        try {
            logger.info("리뷰 삭제 서비스 호출 중...");
            boolean deleted = reviewService.deleteReviewByReservationId(reservationId);
            
            if (deleted) {
                logger.info("예약 리뷰 삭제 성공 - 예약 ID: {}", reservationId);
                return ResponseEntity.ok(CommonApiResponse.success("리뷰가 성공적으로 삭제되었습니다.", "deleted"));
            } else {
                logger.info("삭제할 리뷰 없음 - 예약 ID: {}", reservationId);
                return ResponseEntity.ok(CommonApiResponse.success("삭제할 리뷰가 없습니다.", "not_found"));
            }
        } catch (Exception e) {
            logger.error("=== 리뷰 삭제 중 심각한 오류 발생 ===", e);
            logger.error("오류 메시지: {}", e.getMessage());
            logger.error("오류 타입: {}", e.getClass().getSimpleName());
            if (e.getCause() != null) {
                logger.error("원인: {}", e.getCause().getMessage());
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("리뷰 삭제 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    // 예약의 보관 정보 조회 API
    @GetMapping("/{reservationNumber}/storage")
    public ResponseEntity<CommonApiResponse<StorageItemDto.StorageItemResponse>> getStorageInfoByReservation(
            @PathVariable String reservationNumber) {

        logger.info("=== 예약의 보관 정보 조회 API 호출 ===");
        logger.info("예약번호: {}", reservationNumber);

        try {
            StorageItemDto.StorageItemResponse storageInfo =
                    storageItemService.getByReservationNumber(reservationNumber);

            if (storageInfo != null) {
                logger.info("보관 정보 조회 성공 - 예약번호: {}, 스토리지 코드: {}",
                           reservationNumber, storageInfo.getStorageCode());
                return ResponseEntity.ok(CommonApiResponse.success("보관 정보를 조회했습니다.", storageInfo));
            } else {
                logger.info("보관 정보 없음 - 예약번호: {}", reservationNumber);
                return ResponseEntity.ok(CommonApiResponse.success("보관 정보가 없습니다.", null));
            }
        } catch (Exception e) {
            logger.error("=== 보관 정보 조회 중 오류 발생 ===", e);
            logger.error("오류 메시지: {}", e.getMessage());
            logger.error("오류 타입: {}", e.getClass().getSimpleName());
            return ResponseEntity.ok(CommonApiResponse.success("보관 정보가 없습니다.", null));
        }
    }

    // 예약의 보관 상태 확인 API (간단 버전)
    @GetMapping("/{reservationNumber}/storage-status")
    public ResponseEntity<CommonApiResponse<Map<String, Object>>> getStorageStatus(
            @PathVariable String reservationNumber) {

        logger.info("예약 보관 상태 확인 요청 - 예약번호: {}", reservationNumber);

        try {
            Map<String, Object> result = new HashMap<>();

            try {
                StorageItemDto.StorageItemResponse storageInfo =
                        storageItemService.getByReservationNumber(reservationNumber);

                result.put("hasStorage", true);
                result.put("status", storageInfo.getStatus());
                result.put("storageCode", storageInfo.getStorageCode());
                result.put("checkInTime", storageInfo.getCheckInTime());
                result.put("checkOutTime", storageInfo.getCheckOutTime());

            } catch (Exception e) {
                result.put("hasStorage", false);
                result.put("status", "NOT_STORED");
            }

            logger.info("보관 상태 확인 결과 - 예약번호: {}, 보관 여부: {}",
                       reservationNumber, result.get("hasStorage"));
            return ResponseEntity.ok(CommonApiResponse.success("보관 상태를 확인했습니다.", result));

        } catch (Exception e) {
            logger.error("보관 상태 확인 중 오류 발생: {}", e.getMessage(), e);
            Map<String, Object> result = new HashMap<>();
            result.put("hasStorage", false);
            result.put("status", "ERROR");
            return ResponseEntity.ok(CommonApiResponse.success("보관 상태를 확인했습니다.", result));
        }
    }
} 