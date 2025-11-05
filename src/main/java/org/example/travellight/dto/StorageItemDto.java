package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class StorageItemDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CheckInRequest {
        private String reservationNumber;
        private Integer actualSmallBags;
        private Integer actualMediumBags;
        private Integer actualLargeBags;
        private String staffNotes;
        // 사진은 별도 API로 업로드
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CheckOutRequest {
        private String storageCode; // QR코드에서 스캔한 코드
        private String customerName; // 본인 확인용
        private String customerPhone; // 본인 확인용
        private String staffNotes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StorageItemResponse {
        private Long id;
        private String storageCode;
        private String reservationNumber;
        private String customerName;
        private String customerPhone;
        private String placeName;
        private String placeAddress;
        private List<String> bagPhotos;
        private Integer actualSmallBags;
        private Integer actualMediumBags;
        private Integer actualLargeBags;
        private Integer totalBags;
        private LocalDateTime checkInTime;
        private LocalDateTime checkOutTime;
        private String status;
        private String staffNotes;
        private LocalDateTime createdAt;

        // QR코드 데이터 URL (프론트엔드에서 사용)
        private String qrCodeDataUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StorageItemSummary {
        private Long id;
        private String storageCode;
        private String customerName;
        private String placeName;
        private Integer totalBags;
        private LocalDateTime checkInTime;
        private String status;
        private List<String> thumbnailPhotos; // 썸네일 이미지만
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StoreStorageStatus {
        private String placeName;
        private String placeAddress;
        private Integer currentStoredItems;
        private Integer totalCapacity;
        private List<StorageItemSummary> storedItems;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PhotoUploadRequest {
        private String reservationNumber;
        private String fileName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PhotoUploadResponse {
        private String fileName;
        private String filePath;
        private String thumbnailPath;
        private Long fileSize;
    }
}