package org.example.travellight.controller;

import lombok.RequiredArgsConstructor;
import org.example.travellight.dto.ApiResponse;
import org.example.travellight.dto.StorageItemDto;
import org.example.travellight.service.StorageFileService;
import org.example.travellight.service.StorageItemService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/storage")
@RequiredArgsConstructor
public class StorageController {

    private static final Logger logger = LoggerFactory.getLogger(StorageController.class);

    private final StorageItemService storageItemService;
    private final StorageFileService storageFileService;

    /**
     * 짐 입고 처리 API
     */
    @PostMapping(value = "/check-in", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<StorageItemDto.StorageItemResponse>> checkIn(
            @RequestParam("reservationNumber") String reservationNumber,
            @RequestParam(value = "actualSmallBags", required = false, defaultValue = "0") Integer actualSmallBags,
            @RequestParam(value = "actualMediumBags", required = false, defaultValue = "0") Integer actualMediumBags,
            @RequestParam(value = "actualLargeBags", required = false, defaultValue = "0") Integer actualLargeBags,
            @RequestParam(value = "staffNotes", required = false) String staffNotes,
            @RequestParam(value = "photos", required = false) List<MultipartFile> photos) {

        logger.info("=== 짐 입고 API 호출됨 ===");
        logger.info("예약번호: {}", reservationNumber);
        logger.info("실제 가방 수량 - 소형: {}, 중형: {}, 대형: {}", actualSmallBags, actualMediumBags, actualLargeBags);
        logger.info("사진 수: {}", photos != null ? photos.size() : 0);

        try {
            StorageItemDto.CheckInRequest request = StorageItemDto.CheckInRequest.builder()
                    .reservationNumber(reservationNumber)
                    .actualSmallBags(actualSmallBags)
                    .actualMediumBags(actualMediumBags)
                    .actualLargeBags(actualLargeBags)
                    .staffNotes(staffNotes)
                    .build();

            StorageItemDto.StorageItemResponse response = storageItemService.checkIn(request, photos);

            logger.info("짐 입고 처리 성공: storageCode = {}", response.getStorageCode());
            return ResponseEntity.ok(ApiResponse.success("짐 입고가 성공적으로 처리되었습니다.", response));

        } catch (Exception e) {
            logger.error("짐 입고 처리 실패: reservationNumber = {}", reservationNumber, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("짐 입고 처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 짐 출고 처리 API
     */
    @PostMapping("/check-out")
    public ResponseEntity<ApiResponse<StorageItemDto.StorageItemResponse>> checkOut(
            @RequestBody StorageItemDto.CheckOutRequest request) {

        logger.info("=== 짐 출고 API 호출됨 ===");
        logger.info("스토리지 코드: {}", request.getStorageCode());
        logger.info("고객명: {}, 전화번호: {}", request.getCustomerName(), request.getCustomerPhone());

        try {
            StorageItemDto.StorageItemResponse response = storageItemService.checkOut(request);

            logger.info("짐 출고 처리 성공: storageCode = {}", request.getStorageCode());
            return ResponseEntity.ok(ApiResponse.success("짐 출고가 성공적으로 처리되었습니다.", response));

        } catch (Exception e) {
            logger.error("짐 출고 처리 실패: storageCode = {}", request.getStorageCode(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("짐 출고 처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 예약번호로 보관 정보 조회 API
     */
    @GetMapping("/reservation/{reservationNumber}")
    public ResponseEntity<ApiResponse<StorageItemDto.StorageItemResponse>> getByReservationNumber(
            @PathVariable String reservationNumber) {

        logger.info("예약번호로 보관 정보 조회: {}", reservationNumber);

        try {
            StorageItemDto.StorageItemResponse response = storageItemService.getByReservationNumber(reservationNumber);
            return ResponseEntity.ok(ApiResponse.success("보관 정보를 조회했습니다.", response));

        } catch (Exception e) {
            logger.error("예약번호로 보관 정보 조회 실패: {}", reservationNumber, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("보관 정보 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * QR코드로 보관 정보 조회 API
     */
    @GetMapping("/qr/{storageCode}")
    public ResponseEntity<ApiResponse<StorageItemDto.StorageItemResponse>> getByStorageCode(
            @PathVariable String storageCode) {

        logger.info("QR코드로 보관 정보 조회: {}", storageCode);

        try {
            StorageItemDto.StorageItemResponse response = storageItemService.getByStorageCode(storageCode);
            return ResponseEntity.ok(ApiResponse.success("보관 정보를 조회했습니다.", response));

        } catch (Exception e) {
            logger.error("QR코드로 보관 정보 조회 실패: {}", storageCode, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("보관 정보 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * ID로 보관 정보 조회 API
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StorageItemDto.StorageItemResponse>> getById(@PathVariable Long id) {
        logger.info("ID로 보관 정보 조회: {}", id);

        try {
            StorageItemDto.StorageItemResponse response = storageItemService.getById(id);
            return ResponseEntity.ok(ApiResponse.success("보관 정보를 조회했습니다.", response));

        } catch (Exception e) {
            logger.error("ID로 보관 정보 조회 실패: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("보관 정보 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 매장의 현재 보관 중인 짐들 조회 API
     */
    @GetMapping("/store/current")
    public ResponseEntity<ApiResponse<StorageItemDto.StoreStorageStatus>> getCurrentStoredItemsByStore(
            @RequestParam String placeName,
            @RequestParam String placeAddress) {

        logger.info("매장 보관 현황 조회: {} - {}", placeName, placeAddress);

        try {
            StorageItemDto.StoreStorageStatus response =
                    storageItemService.getCurrentStoredItemsByStore(placeName, placeAddress);

            return ResponseEntity.ok(ApiResponse.success("매장 보관 현황을 조회했습니다.", response));

        } catch (Exception e) {
            logger.error("매장 보관 현황 조회 실패: {} - {}", placeName, placeAddress, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("매장 보관 현황 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 고객의 보관 이력 조회 API
     */
    @GetMapping("/user/{userId}/history")
    public ResponseEntity<ApiResponse<List<StorageItemDto.StorageItemResponse>>> getStorageHistoryByUserId(
            @PathVariable Long userId) {

        logger.info("고객 보관 이력 조회: userId = {}", userId);

        try {
            List<StorageItemDto.StorageItemResponse> response =
                    storageItemService.getStorageHistoryByUserId(userId);

            return ResponseEntity.ok(ApiResponse.success("보관 이력을 조회했습니다.", response));

        } catch (Exception e) {
            logger.error("고객 보관 이력 조회 실패: userId = {}", userId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("보관 이력 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 장기 미수령 짐들 조회 API
     */
    @GetMapping("/long-term/{days}")
    public ResponseEntity<ApiResponse<List<StorageItemDto.StorageItemSummary>>> getLongTermStoredItems(
            @PathVariable int days) {

        logger.info("장기 미수령 짐 조회: {} 일 이상", days);

        try {
            List<StorageItemDto.StorageItemSummary> response =
                    storageItemService.getLongTermStoredItems(days);

            return ResponseEntity.ok(ApiResponse.success("장기 미수령 짐 목록을 조회했습니다.", response));

        } catch (Exception e) {
            logger.error("장기 미수령 짐 조회 실패: days = {}", days, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("장기 미수령 짐 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사진 업로드 API (Base64)
     */
    @PostMapping("/upload-photo")
    public ResponseEntity<ApiResponse<StorageItemDto.PhotoUploadResponse>> uploadPhoto(
            @RequestBody StorageItemDto.PhotoUploadRequest request) {

        logger.info("Base64 사진 업로드: reservationNumber = {}", request.getReservationNumber());

        try {
            StorageItemDto.PhotoUploadResponse response = storageFileService.uploadPhotoFromBase64(request);
            return ResponseEntity.ok(ApiResponse.success("사진이 성공적으로 업로드되었습니다.", response));

        } catch (Exception e) {
            logger.error("Base64 사진 업로드 실패: {}", request.getReservationNumber(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("사진 업로드 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사진 업로드 API (MultipartFile)
     */
    @PostMapping(value = "/upload-photo-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<StorageItemDto.PhotoUploadResponse>> uploadPhotoFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("reservationNumber") String reservationNumber) {

        logger.info("파일 사진 업로드: reservationNumber = {}, fileName = {}",
                   reservationNumber, file.getOriginalFilename());

        try {
            StorageItemDto.PhotoUploadResponse response =
                    storageFileService.uploadPhoto(file, reservationNumber);

            return ResponseEntity.ok(ApiResponse.success("사진이 성공적으로 업로드되었습니다.", response));

        } catch (Exception e) {
            logger.error("파일 사진 업로드 실패: {}", reservationNumber, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("사진 업로드 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * QR코드 생성 API
     */
    @GetMapping("/qr-code/{storageCode}")
    public ResponseEntity<ApiResponse<String>> generateQRCode(@PathVariable String storageCode) {
        try {
            String qrCodeDataUrl = storageItemService.generateQRCodeDataUrl(storageCode);
            return ResponseEntity.ok(ApiResponse.success("QR코드가 생성되었습니다.", qrCodeDataUrl));

        } catch (Exception e) {
            logger.error("QR코드 생성 실패: {}", storageCode, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("QR코드 생성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 테스트용 API
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        logger.info("Storage 테스트 API 호출됨");
        return ResponseEntity.ok("StorageController 테스트 성공!");
    }
}