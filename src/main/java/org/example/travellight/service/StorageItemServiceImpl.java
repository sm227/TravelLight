package org.example.travellight.service;

import org.example.travellight.dto.StorageItemDto;
import org.example.travellight.entity.Reservation;
import org.example.travellight.entity.StorageItem;
import org.example.travellight.repository.ReservationRepository;
import org.example.travellight.repository.StorageItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class StorageItemServiceImpl implements StorageItemService {

    private static final Logger logger = LoggerFactory.getLogger(StorageItemServiceImpl.class);

    private final StorageItemRepository storageItemRepository;
    private final ReservationRepository reservationRepository;
    private final StorageFileService storageFileService;

    public StorageItemServiceImpl(StorageItemRepository storageItemRepository,
                                 ReservationRepository reservationRepository,
                                 StorageFileService storageFileService) {
        this.storageItemRepository = storageItemRepository;
        this.reservationRepository = reservationRepository;
        this.storageFileService = storageFileService;
    }

    @Override
    public StorageItemDto.StorageItemResponse checkIn(StorageItemDto.CheckInRequest request, List<MultipartFile> photos) {
        logger.info("짐 입고 처리 시작: reservationNumber = {}", request.getReservationNumber());

        try {
            // 예약 조회
            Reservation reservation = reservationRepository.findByReservationNumber(request.getReservationNumber())
                    .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다: " + request.getReservationNumber()));

            // 이미 입고된 짐이 있는지 확인
            if (storageItemRepository.findByReservationId(reservation.getId()).isPresent()) {
                throw new RuntimeException("이미 입고 처리된 예약입니다.");
            }

            // 예약 상태 확인
            if (!"RESERVED".equals(reservation.getStatus())) {
                throw new RuntimeException("입고 가능한 예약 상태가 아닙니다. 현재 상태: " + reservation.getStatus());
            }

            // StorageItem 생성
            StorageItem storageItem = StorageItem.builder()
                    .reservation(reservation)
                    .storageCode(generateStorageCode())
                    .actualSmallBags(request.getActualSmallBags())
                    .actualMediumBags(request.getActualMediumBags())
                    .actualLargeBags(request.getActualLargeBags())
                    .staffNotes(request.getStaffNotes())
                    .status("STORED")
                    .checkInTime(LocalDateTime.now())
                    .build();

            // 사진 업로드 처리
            if (photos != null && !photos.isEmpty()) {
                for (MultipartFile photo : photos) {
                    try {
                        StorageItemDto.PhotoUploadResponse uploadResponse =
                                storageFileService.uploadPhoto(photo, request.getReservationNumber());
                        storageItem.addBagPhoto(uploadResponse.getFilePath());
                    } catch (Exception e) {
                        logger.error("사진 업로드 실패: {}", photo.getOriginalFilename(), e);
                        // 사진 업로드 실패는 경고로만 처리하고 계속 진행
                    }
                }
            }

            // StorageItem 저장
            StorageItem savedStorageItem = storageItemRepository.save(storageItem);

            // 예약 상태를 STORED로 변경
            reservation.setStatus("STORED");
            reservationRepository.save(reservation);

            logger.info("짐 입고 처리 완료: storageCode = {}", savedStorageItem.getStorageCode());

            return convertToResponse(savedStorageItem);

        } catch (Exception e) {
            logger.error("짐 입고 처리 실패: reservationNumber = {}", request.getReservationNumber(), e);
            throw new RuntimeException("짐 입고 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @Override
    public StorageItemDto.StorageItemResponse checkOut(StorageItemDto.CheckOutRequest request) {
        logger.info("짐 출고 처리 시작: storageCode = {}", request.getStorageCode());

        try {
            // StorageItem 조회
            StorageItem storageItem = storageItemRepository.findByStorageCode(request.getStorageCode())
                    .orElseThrow(() -> new RuntimeException("보관된 짐을 찾을 수 없습니다: " + request.getStorageCode()));

            // 이미 출고된 짐인지 확인
            if ("RETRIEVED".equals(storageItem.getStatus())) {
                throw new RuntimeException("이미 출고 처리된 짐입니다.");
            }

            // 본인 확인 (고객명과 이메일)
            Reservation reservation = storageItem.getReservation();
            if (!reservation.getUser().getName().equals(request.getCustomerName()) ||
                !reservation.getUser().getEmail().equals(request.getCustomerPhone())) {
                throw new RuntimeException("고객 정보가 일치하지 않습니다.");
            }

            // 출고 처리
            storageItem.checkOut();
            if (request.getStaffNotes() != null) {
                storageItem.setStaffNotes(
                        (storageItem.getStaffNotes() != null ? storageItem.getStaffNotes() + "\n" : "") +
                        "[출고] " + request.getStaffNotes()
                );
            }

            StorageItem savedStorageItem = storageItemRepository.save(storageItem);

            // 예약 상태를 COMPLETED로 변경
            reservation.setStatus("COMPLETED");
            reservationRepository.save(reservation);

            logger.info("짐 출고 처리 완료: storageCode = {}", request.getStorageCode());

            return convertToResponse(savedStorageItem);

        } catch (Exception e) {
            logger.error("짐 출고 처리 실패: storageCode = {}", request.getStorageCode(), e);
            throw new RuntimeException("짐 출고 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public StorageItemDto.StorageItemResponse getByReservationNumber(String reservationNumber) {
        Reservation reservation = reservationRepository.findByReservationNumber(reservationNumber)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다: " + reservationNumber));

        StorageItem storageItem = storageItemRepository.findByReservationId(reservation.getId())
                .orElseThrow(() -> new RuntimeException("보관된 짐을 찾을 수 없습니다: " + reservationNumber));

        return convertToResponse(storageItem);
    }

    @Override
    @Transactional(readOnly = true)
    public StorageItemDto.StorageItemResponse getByStorageCode(String storageCode) {
        StorageItem storageItem = storageItemRepository.findByStorageCode(storageCode)
                .orElseThrow(() -> new RuntimeException("보관된 짐을 찾을 수 없습니다: " + storageCode));

        return convertToResponse(storageItem);
    }

    @Override
    @Transactional(readOnly = true)
    public StorageItemDto.StoreStorageStatus getCurrentStoredItemsByStore(String placeName, String placeAddress) {
        List<StorageItem> storedItems = storageItemRepository.findCurrentStoredItemsByStore(placeName, placeAddress);

        List<StorageItemDto.StorageItemSummary> summaries = storedItems.stream()
                .map(this::convertToSummary)
                .collect(Collectors.toList());

        return StorageItemDto.StoreStorageStatus.builder()
                .placeName(placeName)
                .placeAddress(placeAddress)
                .currentStoredItems(storedItems.size())
                .storedItems(summaries)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StorageItemDto.StorageItemResponse> getStorageHistoryByUserId(Long userId) {
        List<StorageItem> storageItems = storageItemRepository.findByUserId(userId);

        return storageItems.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StorageItemDto.StorageItemSummary> getLongTermStoredItems(int days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        List<StorageItem> longTermItems = storageItemRepository.findLongTermStoredItems(cutoffDate);

        return longTermItems.stream()
                .map(this::convertToSummary)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StorageItemDto.StorageItemResponse getById(Long id) {
        StorageItem storageItem = storageItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("보관된 짐을 찾을 수 없습니다: " + id));

        return convertToResponse(storageItem);
    }

    @Override
    public String generateQRCodeDataUrl(String storageCode) {
        try {
            // QR 코드 생성을 위한 간단한 구현
            // 실제로는 QR 코드 라이브러리를 사용해야 함
            String qrContent = "TRAVELLIGHT:" + storageCode;
            return "data:text/plain;base64," + Base64.getEncoder().encodeToString(qrContent.getBytes());
        } catch (Exception e) {
            logger.error("QR 코드 생성 실패: storageCode = {}", storageCode, e);
            return null;
        }
    }

    private String generateStorageCode() {
        // 고유한 스토리지 코드 생성 (TL + 현재시간 + UUID)
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        return "TL" + timestamp.substring(timestamp.length() - 8) + uuid.toUpperCase();
    }

    private StorageItemDto.StorageItemResponse convertToResponse(StorageItem storageItem) {
        Reservation reservation = storageItem.getReservation();

        return StorageItemDto.StorageItemResponse.builder()
                .id(storageItem.getId())
                .storageCode(storageItem.getStorageCode())
                .reservationNumber(reservation.getReservationNumber())
                .customerName(reservation.getUser().getName())
                .customerPhone(reservation.getUser().getEmail())
                .placeName(reservation.getPlaceName())
                .placeAddress(reservation.getPlaceAddress())
                .bagPhotos(storageItem.getBagPhotos())
                .actualSmallBags(storageItem.getActualSmallBags())
                .actualMediumBags(storageItem.getActualMediumBags())
                .actualLargeBags(storageItem.getActualLargeBags())
                .totalBags(storageItem.getTotalBags())
                .checkInTime(storageItem.getCheckInTime())
                .checkOutTime(storageItem.getCheckOutTime())
                .status(storageItem.getStatus())
                .staffNotes(storageItem.getStaffNotes())
                .createdAt(storageItem.getCreatedAt())
                .qrCodeDataUrl(generateQRCodeDataUrl(storageItem.getStorageCode()))
                .build();
    }

    private StorageItemDto.StorageItemSummary convertToSummary(StorageItem storageItem) {
        Reservation reservation = storageItem.getReservation();

        // 썸네일 사진들만 추출 (최대 3개)
        List<String> thumbnailPhotos = storageItem.getBagPhotos().stream()
                .limit(3)
                .map(photo -> photo.replace("uploads/storage-photos", "uploads/storage-photos/thumbnails"))
                .collect(Collectors.toList());

        return StorageItemDto.StorageItemSummary.builder()
                .id(storageItem.getId())
                .storageCode(storageItem.getStorageCode())
                .customerName(reservation.getUser().getName())
                .placeName(reservation.getPlaceName())
                .totalBags(storageItem.getTotalBags())
                .checkInTime(storageItem.getCheckInTime())
                .status(storageItem.getStatus())
                .thumbnailPhotos(thumbnailPhotos)
                .build();
    }
}