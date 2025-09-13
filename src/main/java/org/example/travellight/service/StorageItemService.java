package org.example.travellight.service;

import org.example.travellight.dto.StorageItemDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface StorageItemService {

    /**
     * 짐 입고 처리 (사진 업로드 포함)
     */
    StorageItemDto.StorageItemResponse checkIn(StorageItemDto.CheckInRequest request, List<MultipartFile> photos);

    /**
     * 짐 출고 처리
     */
    StorageItemDto.StorageItemResponse checkOut(StorageItemDto.CheckOutRequest request);

    /**
     * 예약번호로 StorageItem 조회
     */
    StorageItemDto.StorageItemResponse getByReservationNumber(String reservationNumber);

    /**
     * 스토리지 코드로 StorageItem 조회 (QR코드 스캔용)
     */
    StorageItemDto.StorageItemResponse getByStorageCode(String storageCode);

    /**
     * 매장의 현재 보관 중인 짐들 조회
     */
    StorageItemDto.StoreStorageStatus getCurrentStoredItemsByStore(String placeName, String placeAddress);

    /**
     * 고객의 모든 보관 이력 조회
     */
    List<StorageItemDto.StorageItemResponse> getStorageHistoryByUserId(Long userId);

    /**
     * 장기 미수령 짐들 조회
     */
    List<StorageItemDto.StorageItemSummary> getLongTermStoredItems(int days);

    /**
     * StorageItem ID로 상세 조회
     */
    StorageItemDto.StorageItemResponse getById(Long id);

    /**
     * QR코드 데이터 URL 생성
     */
    String generateQRCodeDataUrl(String storageCode);
}