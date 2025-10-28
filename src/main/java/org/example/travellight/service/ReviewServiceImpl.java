package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.ReviewDto;
import org.example.travellight.entity.*;
import org.example.travellight.exception.CustomException;
import org.example.travellight.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReviewServiceImpl implements ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final ReviewPhotoRepository reviewPhotoRepository;
    private final ReviewHelpfulRepository reviewHelpfulRepository;
    private final ReviewReportRepository reviewReportRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    
    // 파일 업로드 경로 (실제 운영환경에서는 S3 등 클라우드 스토리지 사용 권장)
    private static final String UPLOAD_DIR = "uploads/reviews/";
    
    @Override
    public ReviewDto.ReviewResponse createReview(ReviewDto.ReviewRequest request, User user) {
        log.info("리뷰 작성 요청 - 사용자: {}, 예약 ID: {}", user.getId(), request.getReservationId());
        
        // 예약 정보 조회 및 검증
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new CustomException("예약을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        log.info("예약 정보 조회 성공 - 예약 ID: {}, 상태: {}, 사용자 ID: {}", 
                reservation.getId(), reservation.getStatus(), reservation.getUser().getId());
        
        // 예약 소유자 확인
        if (!reservation.getUser().getId().equals(user.getId())) {
            log.error("예약 소유자 불일치 - 예약 사용자 ID: {}, 현재 사용자 ID: {}", 
                    reservation.getUser().getId(), user.getId());
            throw new CustomException("본인의 예약에만 리뷰를 작성할 수 있습니다.", HttpStatus.FORBIDDEN);
        }
        
        // 리뷰 작성 가능 상태 확인
        boolean canWrite = reservation.canWriteReview();
        log.info("리뷰 작성 가능 여부: {}, 예약 상태: {}", canWrite, reservation.getStatus());
        if (!canWrite) {
            throw new CustomException("완료된 예약에만 리뷰를 작성할 수 있습니다.", HttpStatus.BAD_REQUEST);
        }
        
        // 이미 리뷰가 작성되었는지 확인
        boolean reviewExists = reviewRepository.existsByReservationIdAndStatus(request.getReservationId(), ReviewStatus.ACTIVE);
        log.info("기존 리뷰 존재 여부: {}", reviewExists);
        if (reviewExists) {
            throw new CustomException("이미 리뷰를 작성한 예약입니다.", HttpStatus.CONFLICT);
        }
        
        // 리뷰 생성
        log.info("리뷰 엔티티 생성 중 - 평점: {}, 제목: {}, 내용: {}", 
                request.getRating(), request.getTitle(), request.getContent());
        
        Review review = Review.builder()
                .user(user)
                .reservation(reservation)
                .placeName(reservation.getPlaceName())
                .placeAddress(reservation.getPlaceAddress())
                .rating(request.getRating())
                .title(request.getTitle())
                .content(request.getContent())
                .status(ReviewStatus.ACTIVE)
                .build();
        
        log.info("리뷰 저장 시작...");
        Review savedReview = reviewRepository.save(review);
        log.info("리뷰 저장 성공! - 리뷰 ID: {}, 데이터베이스 ID: {}", savedReview.getId(), savedReview.getId());
        
        // 사진 처리
        if (request.getPhotoFilenames() != null && !request.getPhotoFilenames().isEmpty()) {
            log.info("사진 처리 시작 - 사진 개수: {}", request.getPhotoFilenames().size());
            saveReviewPhotos(savedReview, request.getPhotoFilenames());
        } else {
            log.info("첨부된 사진 없음");
        }
        
        log.info("리뷰 작성 완료! - 리뷰 ID: {}", savedReview.getId());
        
        // 저장된 리뷰 다시 조회해서 확인
        Optional<Review> checkReview = reviewRepository.findById(savedReview.getId());
        if (checkReview.isPresent()) {
            log.info("저장 확인 성공 - 리뷰 ID: {}, 상태: {}", checkReview.get().getId(), checkReview.get().getStatus());
        } else {
            log.error("저장 확인 실패 - 리뷰가 데이터베이스에서 조회되지 않음");
        }
        
        return convertToResponse(savedReview, user);
    }
    
    @Override
    public ReviewDto.ReviewResponse updateReview(Long reviewId, ReviewDto.ReviewUpdateRequest request, User user) {
        log.info("리뷰 수정 요청 - 리뷰 ID: {}, 사용자: {}", reviewId, user.getId());
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException("리뷰를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        // 작성자 확인
        if (!review.getUser().getId().equals(user.getId())) {
            throw new CustomException("본인이 작성한 리뷰만 수정할 수 있습니다.", HttpStatus.FORBIDDEN);
        }
        
        // 삭제된 리뷰는 수정 불가
        if (review.getStatus() == ReviewStatus.DELETED) {
            throw new CustomException("삭제된 리뷰는 수정할 수 없습니다.", HttpStatus.BAD_REQUEST);
        }
        
        // 리뷰 정보 업데이트
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setContent(request.getContent());
        
        // 사진 처리
        updateReviewPhotos(review, request.getKeepPhotoIds(), request.getNewPhotoFilenames());
        
        Review savedReview = reviewRepository.save(review);
        
        log.info("리뷰 수정 완료 - 리뷰 ID: {}", reviewId);
        return convertToResponse(savedReview, user);
    }
    
    @Override
    public void deleteReview(Long reviewId, User user) {
        log.info("리뷰 삭제 요청 - 리뷰 ID: {}, 사용자: {}", reviewId, user.getId());
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException("리뷰를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        // 작성자 또는 관리자만 삭제 가능
        if (!review.getUser().getId().equals(user.getId()) && !user.getRole().equals(Role.ADMIN)) {
            throw new CustomException("리뷰를 삭제할 권한이 없습니다.", HttpStatus.FORBIDDEN);
        }
        
        // 소프트 삭제
        review.setStatus(ReviewStatus.DELETED);
        reviewRepository.save(review);
        
        log.info("리뷰 삭제 완료 - 리뷰 ID: {}", reviewId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ReviewDto.ReviewResponse getReview(Long reviewId, User currentUser) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException("리뷰를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        // 삭제된 리뷰는 작성자와 관리자만 조회 가능
        if (review.getStatus() == ReviewStatus.DELETED) {
            if (currentUser == null || 
                (!review.getUser().getId().equals(currentUser.getId()) && !currentUser.getRole().equals(Role.ADMIN))) {
                throw new CustomException("삭제된 리뷰입니다.", HttpStatus.FORBIDDEN);
            }
        }
        
        return convertToResponse(review, currentUser);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ReviewDto.ReviewResponse> getPlaceReviews(String placeName, String placeAddress,
                                                         String sortBy, Pageable pageable, User currentUser) {
        Page<Review> reviews;
        
        if ("rating".equals(sortBy)) {
            reviews = reviewRepository.findByPlaceNameAndPlaceAddressAndStatusOrderByRatingDescCreatedAtDesc(
                    placeName, placeAddress, ReviewStatus.ACTIVE, pageable);
        } else {
            reviews = reviewRepository.findByPlaceNameAndPlaceAddressAndStatusOrderByCreatedAtDesc(
                    placeName, placeAddress, ReviewStatus.ACTIVE, pageable);
        }
        
        return reviews.map(review -> convertToResponse(review, currentUser));
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ReviewDto.ReviewResponse> getUserReviews(User user, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByUserAndStatusOrderByCreatedAtDesc(
                user, ReviewStatus.ACTIVE, pageable);
        
        return reviews.map(review -> convertToResponse(review, user));
    }
    
    @Override
    @Transactional(readOnly = true)
    public ReviewDto.ReviewSummary getPlaceReviewSummary(String placeName, String placeAddress) {
        Double averageRating = reviewRepository.getAverageRatingByPlace(placeName, placeAddress, ReviewStatus.ACTIVE);
        Long totalReviews = reviewRepository.countByPlaceNameAndPlaceAddressAndStatus(placeName, placeAddress, ReviewStatus.ACTIVE);
        List<Object[]> ratingDistribution = reviewRepository.getRatingDistributionByPlace(placeName, placeAddress, ReviewStatus.ACTIVE);
        
        // 평점별 분포 계산
        Map<Integer, Long> distributionMap = ratingDistribution.stream()
                .collect(Collectors.toMap(
                        arr -> (Integer) arr[0],
                        arr -> (Long) arr[1]
                ));
        
        ReviewDto.RatingDistribution distribution = ReviewDto.RatingDistribution.builder()
                .rating5Count(distributionMap.getOrDefault(5, 0L))
                .rating4Count(distributionMap.getOrDefault(4, 0L))
                .rating3Count(distributionMap.getOrDefault(3, 0L))
                .rating2Count(distributionMap.getOrDefault(2, 0L))
                .rating1Count(distributionMap.getOrDefault(1, 0L))
                .build();
        
        return ReviewDto.ReviewSummary.builder()
                .placeName(placeName)
                .placeAddress(placeAddress)
                .averageRating(averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0)
                .totalReviews(totalReviews)
                .ratingDistribution(distribution)
                .build();
    }
    
    @Override
    public boolean toggleHelpful(Long reviewId, User user) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException("리뷰를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        Optional<ReviewHelpful> existingHelpful = reviewHelpfulRepository.findByReviewAndUser(review, user);
        
        if (existingHelpful.isPresent()) {
            // 이미 도움이 됨을 눌렀다면 취소
            reviewHelpfulRepository.delete(existingHelpful.get());
            review.setHelpfulCount(Math.max(0, review.getHelpfulCount() - 1));
            reviewRepository.save(review);
            return false;
        } else {
            // 도움이 됨 추가
            ReviewHelpful helpful = ReviewHelpful.builder()
                    .review(review)
                    .user(user)
                    .build();
            reviewHelpfulRepository.save(helpful);
            review.incrementHelpfulCount();
            reviewRepository.save(review);
            return true;
        }
    }
    
    @Override
    public void reportReview(Long reviewId, ReviewDto.ReviewReportRequest request, User user) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException("리뷰를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        // 이미 신고했는지 확인
        if (reviewReportRepository.existsByReviewAndUser(review, user)) {
            throw new CustomException("이미 신고한 리뷰입니다.", HttpStatus.CONFLICT);
        }
        
        // 본인 리뷰는 신고 불가
        if (review.getUser().getId().equals(user.getId())) {
            throw new CustomException("본인이 작성한 리뷰는 신고할 수 없습니다.", HttpStatus.BAD_REQUEST);
        }
        
        ReviewReport report = ReviewReport.builder()
                .review(review)
                .user(user)
                .reason(request.getReason())
                .description(request.getDescription())
                .status(ReportStatus.PENDING)
                .build();
        
        reviewReportRepository.save(report);
        
        // 리뷰의 신고 카운트 증가
        review.incrementReportCount();
        reviewRepository.save(review);
        
        log.info("리뷰 신고 접수 - 리뷰 ID: {}, 신고자: {}, 사유: {}", reviewId, user.getId(), request.getReason());
    }
    
    @Override
    public ReviewDto.ReviewResponse addAdminReply(Long reviewId, ReviewDto.AdminReplyRequest request, User admin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException("리뷰를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        review.addAdminReply(request.getAdminReply(), admin);
        Review savedReview = reviewRepository.save(review);
        
        log.info("관리자 답변 추가 - 리뷰 ID: {}, 관리자: {}", reviewId, admin.getId());
        return convertToResponse(savedReview, admin);
    }
    
    @Override
    public ReviewDto.ReviewResponse updateReviewStatus(Long reviewId, String status, User admin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException("리뷰를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        ReviewStatus newStatus = ReviewStatus.valueOf(status.toUpperCase());
        review.setStatus(newStatus);
        Review savedReview = reviewRepository.save(review);
        
        log.info("리뷰 상태 변경 - 리뷰 ID: {}, 새 상태: {}, 관리자: {}", reviewId, newStatus, admin.getId());
        return convertToResponse(savedReview, admin);
    }
    
    @Override
    public List<String> uploadReviewPhotos(List<MultipartFile> files) {
        List<String> uploadedFilenames = new ArrayList<>();
        
        // 업로드 디렉토리 생성
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new CustomException("파일 업로드 디렉토리 생성에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            
            try {
                // 파일명 생성 (중복 방지를 위해 현재 시간 추가)
                String originalFilename = file.getOriginalFilename();
                String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                String newFilename = System.currentTimeMillis() + "_" + UUID.randomUUID().toString() + extension;
                
                // 파일 저장
                Path filePath = Paths.get(UPLOAD_DIR, newFilename);
                Files.copy(file.getInputStream(), filePath);
                
                uploadedFilenames.add(newFilename);
                
            } catch (IOException e) {
                log.error("파일 업로드 실패: {}", file.getOriginalFilename(), e);
                throw new CustomException("파일 업로드에 실패했습니다: " + file.getOriginalFilename(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        
        return uploadedFilenames;
    }
    
    @Override
    public void deleteReviewPhoto(Long photoId, User user) {
        ReviewPhoto photo = reviewPhotoRepository.findById(photoId)
                .orElseThrow(() -> new CustomException("사진을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        // 권한 확인 (리뷰 작성자 또는 관리자)
        if (!photo.getReview().getUser().getId().equals(user.getId()) && !user.getRole().equals(Role.ADMIN)) {
            throw new CustomException("사진을 삭제할 권한이 없습니다.", HttpStatus.FORBIDDEN);
        }
        
        // 파일 삭제
        try {
            Path filePath = Paths.get(photo.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("파일 삭제 실패: {}", photo.getFilePath(), e);
        }
        
        // DB에서 삭제
        reviewPhotoRepository.delete(photo);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean hasActiveReview(Long reservationId) {
        return reviewRepository.existsByReservationIdAndStatus(reservationId, ReviewStatus.ACTIVE);
    }
    
    @Override
    @Transactional
    public boolean deleteReviewByReservationId(Long reservationId) {
        log.info("예약 ID로 리뷰 삭제 시도: {}", reservationId);
        
        Optional<Review> reviewOpt = reviewRepository.findByReservationIdAndStatus(reservationId, ReviewStatus.ACTIVE);
        
        if (reviewOpt.isEmpty()) {
            log.info("삭제할 활성 리뷰가 없음: 예약 ID {}", reservationId);
            return false;
        }
        
        Review review = reviewOpt.get();
        
        // 리뷰 사진들 먼저 삭제
        List<ReviewPhoto> photos = reviewPhotoRepository.findByReviewId(review.getId());
        for (ReviewPhoto photo : photos) {
            try {
                // 파일 시스템에서 파일 삭제
                Path filePath = Paths.get(UPLOAD_DIR + photo.getFilename());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                log.warn("사진 파일 삭제 실패: {}", photo.getFilename(), e);
            }
        }
        reviewPhotoRepository.deleteByReviewId(review.getId());
        
        // 도움이 됨 기록 삭제
        reviewHelpfulRepository.deleteByReview(review);
        
        // 신고 기록 삭제
        reviewReportRepository.deleteByReview(review);
        
        // 리뷰 삭제
        reviewRepository.delete(review);
        
        log.info("리뷰 삭제 완료: 리뷰 ID {}", review.getId());
        
        return true;
    }
    
    @Override
    @Transactional(readOnly = true)
    public ReviewDto.ReviewResponse getReviewByReservationId(Long reservationId) {
        log.info("예약 ID로 리뷰 조회: {}", reservationId);
        
        Optional<Review> reviewOpt = reviewRepository.findByReservationIdAndStatus(reservationId, ReviewStatus.ACTIVE);
        
        if (reviewOpt.isEmpty()) {
            log.info("조회할 활성 리뷰가 없음: 예약 ID {}", reservationId);
            return null;
        }
        
        Review review = reviewOpt.get();
        return convertToResponse(review, review.getUser());
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean canWriteReview(Long reservationId, User user) {
        // 예약 존재 여부 확인
        Optional<Reservation> reservationOpt = reservationRepository.findById(reservationId);
        if (reservationOpt.isEmpty()) {
            return false; // 예약이 없으면 리뷰 작성 불가
        }
        
        Reservation reservation = reservationOpt.get();
        
        // 예약 소유자 확인
        if (!reservation.getUser().getId().equals(user.getId())) {
            return false;
        }
        
        // 완료된 예약인지 확인
        if (!reservation.canWriteReview()) {
            return false;
        }
        
        // 이미 리뷰가 작성되었는지 확인
        return !reviewRepository.existsByReservationIdAndStatus(reservationId, ReviewStatus.ACTIVE);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReviewDto.PlaceReviewSummary> getTopRatedPlaces(int limit) {
        List<Object[]> results = reviewRepository.findTopRatedPlaces(ReviewStatus.ACTIVE, 1); // 최소 1개 리뷰 필요
        
        return results.stream()
                .limit(limit)
                .map(arr -> {
                    String placeName = (String) arr[0];
                    String placeAddress = (String) arr[1];
                    Double avgRating = (Double) arr[2];
                    Long reviewCount = (Long) arr[3];
                    Double recommendationScore = (Double) arr[4]; // DB에서 계산된 추천 점수
                    
                    return ReviewDto.PlaceReviewSummary.builder()
                            .placeName(placeName)
                            .placeAddress(placeAddress)
                            .averageRating(Math.round(avgRating * 10.0) / 10.0)
                            .reviewCount(reviewCount)
                            .recommendationScore(Math.round(recommendationScore * 10.0) / 10.0)
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ReviewDto.ReviewResponse> getRecentReviews(Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByStatusOrderByCreatedAtDesc(ReviewStatus.ACTIVE, pageable);
        return reviews.map(review -> convertToResponse(review, null));
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReviewDto.ReviewResponse> getReviewsWithHighReports(int threshold) {
        List<Review> reviews = reviewRepository.findReviewsWithHighReports(threshold, ReviewStatus.ACTIVE);
        return reviews.stream()
                .map(review -> convertToResponse(review, null))
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ReviewDto.ReviewResponse> getAdminUserReviews(Long userId, Pageable pageable) {
        log.info("관리자 - 사용자 ID {}의 리뷰 목록 조회 시작", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        // 해당 사용자의 모든 리뷰 조회 (상태 관계없이)
        Page<Review> reviews = reviewRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        
        log.info("사용자 ID {}의 리뷰 {}건 조회 완료", userId, reviews.getTotalElements());
        
        return reviews.map(review -> convertToResponse(review, null));
    }
    
    // Private helper methods
    
    private void saveReviewPhotos(Review review, List<String> photoFilenames) {
        for (int i = 0; i < photoFilenames.size(); i++) {
            String filename = photoFilenames.get(i);
            
            ReviewPhoto photo = ReviewPhoto.builder()
                    .review(review)
                    .filename(filename)
                    .originalFilename(filename) // 실제로는 원본 파일명을 별도로 저장해야 함
                    .filePath(UPLOAD_DIR + filename)
                    .sortOrder(i + 1)
                    .build();
            
            reviewPhotoRepository.save(photo);
        }
    }
    
    private void updateReviewPhotos(Review review, List<Long> keepPhotoIds, List<String> newPhotoFilenames) {
        // 기존 사진 중 유지하지 않을 것들 삭제
        List<ReviewPhoto> existingPhotos = reviewPhotoRepository.findByReviewIdOrderBySortOrderAsc(review.getId());
        
        for (ReviewPhoto photo : existingPhotos) {
            if (keepPhotoIds == null || !keepPhotoIds.contains(photo.getId())) {
                // 파일 삭제
                try {
                    Path filePath = Paths.get(photo.getFilePath());
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    log.warn("파일 삭제 실패: {}", photo.getFilePath(), e);
                }
                reviewPhotoRepository.delete(photo);
            }
        }
        
        // 새 사진 추가
        if (newPhotoFilenames != null && !newPhotoFilenames.isEmpty()) {
            int nextSortOrder = reviewPhotoRepository.findByReviewIdOrderBySortOrderAsc(review.getId()).size() + 1;
            
            for (String filename : newPhotoFilenames) {
                ReviewPhoto photo = ReviewPhoto.builder()
                        .review(review)
                        .filename(filename)
                        .originalFilename(filename)
                        .filePath(UPLOAD_DIR + filename)
                        .sortOrder(nextSortOrder++)
                        .build();
                
                reviewPhotoRepository.save(photo);
            }
        }
    }
    
    private ReviewDto.ReviewResponse convertToResponse(Review review, User currentUser) {
        // 사진 정보 변환
        List<ReviewDto.ReviewPhotoResponse> photoResponses = review.getPhotos().stream()
                .map(photo -> ReviewDto.ReviewPhotoResponse.builder()
                        .id(photo.getId())
                        .filename(photo.getFilename())
                        .originalFilename(photo.getOriginalFilename())
                        .filePath(photo.getFilePath())
                        .fileSize(photo.getFileSize())
                        .mimeType(photo.getMimeType())
                        .sortOrder(photo.getSortOrder())
                        .uploadedAt(photo.getUploadedAt())
                        .build())
                .collect(Collectors.toList());
        
        // 사용자 정보 변환
        ReviewDto.UserInfo userInfo = ReviewDto.UserInfo.builder()
                .id(review.getUser().getId())
                .name(review.getUser().getName())
                .build();
        
        // 관리자 정보 변환
        ReviewDto.UserInfo adminUserInfo = null;
        if (review.getAdminUser() != null) {
            adminUserInfo = ReviewDto.UserInfo.builder()
                    .id(review.getAdminUser().getId())
                    .name(review.getAdminUser().getName())
                    .build();
        }
        
        // 현재 사용자 관련 정보
        Boolean isHelpfulByCurrentUser = false;
        Boolean isReportedByCurrentUser = false;
        Boolean canEdit = false;
        
        if (currentUser != null) {
            isHelpfulByCurrentUser = reviewHelpfulRepository.existsByReviewAndUser(review, currentUser);
            isReportedByCurrentUser = reviewReportRepository.existsByReviewAndUser(review, currentUser);
            canEdit = review.getUser().getId().equals(currentUser.getId());
        }
        
        return ReviewDto.ReviewResponse.builder()
                .id(review.getId())
                .reservationId(review.getReservation().getId())
                .reservationNumber(review.getReservation().getReservationNumber())
                .placeName(review.getPlaceName())
                .placeAddress(review.getPlaceAddress())
                .rating(review.getRating())
                .title(review.getTitle())
                .content(review.getContent())
                .status(review.getStatus())
                .reportCount(review.getReportCount())
                .helpfulCount(review.getHelpfulCount())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .user(userInfo)
                .photos(photoResponses)
                .adminReply(review.getAdminReply())
                .adminUser(adminUserInfo)
                .adminReplyAt(review.getAdminReplyAt())
                .isHelpfulByCurrentUser(isHelpfulByCurrentUser)
                .isReportedByCurrentUser(isReportedByCurrentUser)
                .canEdit(canEdit)
                .build();
    }
}
