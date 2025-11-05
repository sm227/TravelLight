package org.example.travellight.service;

import org.example.travellight.dto.StorageItemDto;
import org.springframework.web.multipart.MultipartFile;

public interface StorageFileService {

    /**
     * 이미지 파일 업로드
     */
    StorageItemDto.PhotoUploadResponse uploadPhoto(MultipartFile file, String reservationNumber);

    /**
     * 이미지 파일 삭제
     */
    void deletePhoto(String filePath);

    /**
     * 썸네일 생성
     */
    String createThumbnail(String originalPath);

    /**
     * 예약의 모든 사진 삭제
     */
    void deleteAllPhotosOfReservation(String reservationNumber);

    /**
     * 파일 경로 검증
     */
    boolean isValidImagePath(String path);
}