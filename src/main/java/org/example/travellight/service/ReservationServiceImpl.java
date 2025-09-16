package org.example.travellight.service;

import org.example.travellight.dto.ReservationDto;
import org.example.travellight.entity.Partnership;
import org.example.travellight.entity.Reservation;
import org.example.travellight.entity.User;
import org.example.travellight.repository.ReservationRepository;
import org.example.travellight.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class ReservationServiceImpl implements ReservationService {
    
    private static final Logger logger = LoggerFactory.getLogger(ReservationServiceImpl.class);
    
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PartnershipService partnershipService;
    
    // 매장별 마지막 처리 시간을 저장하는 캐시 (중복 처리 방지)
    private final Map<String, LocalDateTime> lastProcessedTimeCache = new ConcurrentHashMap<>();
    
    @Autowired
    public ReservationServiceImpl(ReservationRepository reservationRepository,
                                 UserRepository userRepository,
                                 EmailService emailService,
                                 PartnershipService partnershipService) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.partnershipService = partnershipService;
    }
    
    @Override
    @Transactional
    public ReservationDto createReservation(ReservationDto reservationDto) {
        logger.info("예약 생성 서비스 시작: {}", reservationDto);
        
        // 데이터 검증
        if (reservationDto.getUserId() == null) {
            logger.error("사용자 ID가 null입니다");
            throw new IllegalArgumentException("사용자 ID는 필수입니다");
        }
        
        // 사용자 조회
        logger.info("사용자 ID {} 조회 시도", reservationDto.getUserId());
        User user = userRepository.findById(reservationDto.getUserId())
                .orElseThrow(() -> {
                    logger.error("사용자 ID {}를 찾을 수 없습니다", reservationDto.getUserId());
                    return new RuntimeException("사용자를 찾을 수 없습니다.");
                });
        
        logger.info("사용자 조회 성공: {}", user);
        
        // 매장 보관 용량 확인 (차감하지 않고 확인만)
        try {
            Partnership partnership = partnershipService.findByBusinessNameAndAddress(
                reservationDto.getPlaceName(), 
                reservationDto.getPlaceAddress()
            );
            
            if (partnership != null) {
                // 현재 사용 중인 용량 계산
                Map<String, Integer> currentUsage = partnershipService.getCurrentUsedCapacity(
                    partnership.getBusinessName(), 
                    partnership.getAddress()
                );
                
                // 최대 보관 가능한 용량
                int maxSmallBags = partnership.getSmallBagsAvailable() != null ? partnership.getSmallBagsAvailable() : 0;
                int maxMediumBags = partnership.getMediumBagsAvailable() != null ? partnership.getMediumBagsAvailable() : 0;
                int maxLargeBags = partnership.getLargeBagsAvailable() != null ? partnership.getLargeBagsAvailable() : 0;
                
                // 현재 사용 중인 용량
                int usedSmallBags = currentUsage.get("smallBags");
                int usedMediumBags = currentUsage.get("mediumBags");
                int usedLargeBags = currentUsage.get("largeBags");
                
                // 요청된 용량
                int requestedSmallBags = reservationDto.getSmallBags() != null ? reservationDto.getSmallBags() : 0;
                int requestedMediumBags = reservationDto.getMediumBags() != null ? reservationDto.getMediumBags() : 0;
                int requestedLargeBags = reservationDto.getLargeBags() != null ? reservationDto.getLargeBags() : 0;
                
                // 용량 초과 확인 (현재 사용량 + 요청량 > 최대 용량)
                if ((usedSmallBags + requestedSmallBags) > maxSmallBags || 
                    (usedMediumBags + requestedMediumBags) > maxMediumBags || 
                    (usedLargeBags + requestedLargeBags) > maxLargeBags) {
                    logger.error("보관 용량 초과: 요청(소형:{}, 중형:{}, 대형:{}) + 사용중(소형:{}, 중형:{}, 대형:{}) > 최대(소형:{}, 중형:{}, 대형:{})", 
                        requestedSmallBags, requestedMediumBags, requestedLargeBags,
                        usedSmallBags, usedMediumBags, usedLargeBags,
                        maxSmallBags, maxMediumBags, maxLargeBags);
                    throw new RuntimeException("보관 가능한 용량을 초과했습니다.");
                }
                
                logger.info("보관 용량 확인 완료: 사용가능(소형:{}, 중형:{}, 대형:{})", 
                    maxSmallBags - usedSmallBags - requestedSmallBags, 
                    maxMediumBags - usedMediumBags - requestedMediumBags, 
                    maxLargeBags - usedLargeBags - requestedLargeBags);
            }
        } catch (Exception e) {
            logger.error("매장 보관 용량 확인 중 오류: {}", e.getMessage(), e);
            throw new RuntimeException("보관 용량 확인 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        // Reservation 엔티티 생성
        try {
            Reservation reservation = Reservation.builder()
                    .user(user)
                    .placeName(reservationDto.getPlaceName())
                    .placeAddress(reservationDto.getPlaceAddress())
                    .reservationNumber(reservationDto.getReservationNumber())
                    .storageDate(reservationDto.getStorageDate())
                    .storageEndDate(reservationDto.getStorageEndDate())
                    .storageStartTime(reservationDto.getStorageStartTime())
                    .storageEndTime(reservationDto.getStorageEndTime())
                    .smallBags(reservationDto.getSmallBags())
                    .mediumBags(reservationDto.getMediumBags())
                    .largeBags(reservationDto.getLargeBags())
                    .totalPrice(reservationDto.getTotalPrice())
                    .storageType(reservationDto.getStorageType())
                    .status(reservationDto.getStatus() != null ? reservationDto.getStatus() : "RESERVED")
                    .paymentId(reservationDto.getPaymentId())
                    .build();
            
            // 저장
            logger.info("예약 엔티티 저장 시도: {}", reservation);
            Reservation savedReservation = reservationRepository.save(reservation);
            logger.info("예약 저장 성공: {}", savedReservation);
            
            // DTO 반환
            ReservationDto resultDto = mapToDto(savedReservation);
            
            // 예약 확인 이메일 전송
            try {
                logger.info("예약이 성공적으로 생성되었습니다. 이메일 전송을 시도합니다. 이메일: {}", resultDto.getUserEmail());
                boolean emailSent = emailService.sendReservationConfirmationEmail(resultDto);
                if (emailSent) {
                    logger.info("예약 확인 이메일이 {}에게 성공적으로 전송되었습니다.", resultDto.getUserEmail());
                } else {
                    logger.warn("예약 확인 이메일 전송이 실패했습니다. 사용자 이메일: {}", resultDto.getUserEmail());
                }
            } catch (Exception e) {
                // 이메일 발송이 실패해도 예약은 성공적으로 처리되어야 하므로 여기서는 예외를 던지지 않습니다
                logger.error("예약 확인 이메일 전송 중 오류 발생: {}", e.getMessage(), e);
            }
            
            return resultDto;
        } catch (Exception e) {
            logger.error("예약 엔티티 생성 중 오류: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public ReservationDto getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        return mapToDto(reservation);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ReservationDto getReservationByNumber(String reservationNumber) {
        Reservation reservation = reservationRepository.findByReservationNumber(reservationNumber)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        return mapToDto(reservation);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReservationDto> getUserReservations(Long userId) {
        List<Reservation> reservations = reservationRepository.findByUserId(userId);
        return reservations.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void cancelReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        
        // 예약 상태 확인
        if (!"RESERVED".equals(reservation.getStatus())) {
            throw new RuntimeException("취소할 수 있는 예약이 아닙니다.");
        }
        
        // 예약 상태를 CANCELLED로 변경
        reservation.setStatus("CANCELLED");
        reservationRepository.save(reservation);
        
        logger.info("예약 취소 완료: ID={}, 예약번호={}", reservation.getId(), reservation.getReservationNumber());
        
        // 취소 확인 이메일 전송 (선택사항)
        // TODO: EmailService에 sendReservationCancellationEmail 메서드 추가 필요
        /*
        try {
            ReservationDto cancelledReservation = mapToDto(reservation);
            boolean emailSent = emailService.sendReservationCancellationEmail(cancelledReservation);
            if (emailSent) {
                logger.info("예약 취소 확인 이메일이 {}에게 성공적으로 전송되었습니다.", cancelledReservation.getUserEmail());
            } else {
                logger.warn("예약 취소 확인 이메일 전송이 실패했습니다. 사용자 이메일: {}", cancelledReservation.getUserEmail());
            }
        } catch (Exception e) {
            logger.error("예약 취소 확인 이메일 전송 중 오류 발생: {}", e.getMessage(), e);
        }
        */
    }
    
    @Override
    @Transactional
    public void cancelReservationByNumber(String reservationNumber) {
        Reservation reservation = reservationRepository.findByReservationNumber(reservationNumber)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        
        // 예약 상태 확인
        if (!"RESERVED".equals(reservation.getStatus())) {
            throw new RuntimeException("취소할 수 있는 예약이 아닙니다.");
        }
        
        // 예약 상태를 CANCELLED로 변경
        reservation.setStatus("CANCELLED");
        reservationRepository.save(reservation);
        
        logger.info("예약 취소 완료: 예약번호={}", reservationNumber);
        
        // 취소 확인 이메일 전송 (선택사항)
        // TODO: EmailService에 sendReservationCancellationEmail 메서드 추가 필요
        /*
        try {
            ReservationDto cancelledReservation = mapToDto(reservation);
            boolean emailSent = emailService.sendReservationCancellationEmail(cancelledReservation);
            if (emailSent) {
                logger.info("예약 취소 확인 이메일이 {}에게 성공적으로 전송되었습니다.", cancelledReservation.getUserEmail());
            } else {
                logger.warn("예약 취소 확인 이메일 전송이 실패했습니다. 사용자 이메일: {}", cancelledReservation.getUserEmail());
            }
        } catch (Exception e) {
            logger.error("예약 취소 확인 이메일 전송 중 오류 발생: {}", e.getMessage(), e);
        }
        */
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReservationDto> getReservationsByPlaceName(String placeName) {
        // 매장명으로 필터된 예약 조회
        List<Reservation> reservations = reservationRepository.findByPlaceName(placeName);
        return reservations.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReservationDto> getRecentReservations(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Reservation> reservations = reservationRepository.findRecentReservations(pageable);
        return reservations.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void updatePaymentId(String reservationNumber, String paymentId) {
        Reservation reservation = reservationRepository.findByReservationNumber(reservationNumber)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다: " + reservationNumber));
        
        // 결제 ID 업데이트
        reservation.setPaymentId(paymentId);
        reservationRepository.save(reservation);
        
        logger.info("예약 결제 ID 업데이트 완료: reservationNumber={}, paymentId={}", 
                   reservationNumber, paymentId);
    }
    
    @Override
    @Transactional
    public void updateReservationStatusToCompleted(String reservationNumber) {
        Reservation reservation = reservationRepository.findByReservationNumber(reservationNumber)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다: " + reservationNumber));
        
        // 이미 COMPLETED 상태인 경우 중복 처리 방지
        if ("COMPLETED".equals(reservation.getStatus())) {
            logger.info("예약이 이미 완료 상태입니다: reservationNumber={}", reservationNumber);
            return;
        }
        
        // RESERVED 상태인 예약만 COMPLETED로 변경
        if (!"RESERVED".equals(reservation.getStatus())) {
            logger.warn("완료 처리할 수 없는 예약 상태입니다: reservationNumber={}, status={}", 
                       reservationNumber, reservation.getStatus());
            return;
        }
        
        // 예약 상태를 COMPLETED로 변경
        reservation.setStatus("COMPLETED");
        reservationRepository.save(reservation);
        
        // 매장의 보관 용량 복원
        try {
            Partnership partnership = partnershipService.findByBusinessNameAndAddress(
                reservation.getPlaceName(), 
                reservation.getPlaceAddress()
            );
            
            if (partnership != null) {
                logger.info("매장 보관 용량 복원 시작: businessName={}, address={}, 복원량(소형:{}, 중형:{}, 대형:{})", 
                           partnership.getBusinessName(), partnership.getAddress(),
                           reservation.getSmallBags(), reservation.getMediumBags(), reservation.getLargeBags());
                
                // Partnership 엔티티의 용량은 최대 보관 가능 수량을 의미하므로 
                // 실제로는 현재 사용량만 감소시키면 됩니다.
                // PartnershipService의 getCurrentUsedCapacity 메서드에서 
                // RESERVED 상태의 예약만 계산하도록 되어있다면 자동으로 용량이 복원됩니다.
                
                logger.info("매장 보관 용량 복원 완료: reservationNumber={}", reservationNumber);
            } else {
                logger.warn("매장 정보를 찾을 수 없습니다: placeName={}, address={}", 
                           reservation.getPlaceName(), reservation.getPlaceAddress());
            }
        } catch (Exception e) {
            logger.error("매장 보관 용량 복원 중 오류 발생: reservationNumber={}", reservationNumber, e);
            // 용량 복원 실패해도 예약 상태 변경은 유지
        }
        
        logger.info("예약 상태 완료 처리 완료: reservationNumber={}", reservationNumber);
    }
    
    @Override
    @Transactional
    public void processExpiredReservationsForStore(String businessName, String address) {
        // 캐시 키 생성 (매장명 + 주소)
        String cacheKey = businessName + "|" + address;
        
        // 중복 처리 방지: 2분 이내에 같은 매장에 대해 처리했다면 스킵
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastProcessed = lastProcessedTimeCache.get(cacheKey);
        
        if (lastProcessed != null && now.minusMinutes(2).isBefore(lastProcessed)) {
            logger.info("매장 만료 예약 처리 스킵 (최근 처리됨): businessName={}, address={}, 마지막처리={}", 
                       businessName, address, lastProcessed);
            return;
        }
        
        logger.info("매장별 만료 예약 처리 시작: businessName={}, address={}", businessName, address);
        
        try {
            // 1. 먼저 만료된 예약들 조회 (처리 전 로깅용)
            List<Reservation> expiredReservations = reservationRepository.findExpiredReservationsForStore(businessName, address);
            
            if (expiredReservations.isEmpty()) {
                logger.info("처리할 만료 예약 없음: businessName={}, address={}", businessName, address);
                // 캐시 업데이트
                lastProcessedTimeCache.put(cacheKey, now);
                return;
            }
            
            // 2. 만료된 예약 정보 로깅
            logger.info("처리 대상 만료 예약 수: {} 건, businessName={}, address={}", 
                       expiredReservations.size(), businessName, address);
            
            int totalSmallBags = 0, totalMediumBags = 0, totalLargeBags = 0;
            for (Reservation reservation : expiredReservations) {
                totalSmallBags += (reservation.getSmallBags() != null ? reservation.getSmallBags() : 0);
                totalMediumBags += (reservation.getMediumBags() != null ? reservation.getMediumBags() : 0);
                totalLargeBags += (reservation.getLargeBags() != null ? reservation.getLargeBags() : 0);
                
                logger.debug("만료 예약 처리 대상: 예약번호={}, 종료일={}, 종료시간={}, 가방수(소/중/대)={}/{}/{}", 
                           reservation.getReservationNumber(), 
                           reservation.getStorageEndDate(), 
                           reservation.getStorageEndTime(),
                           reservation.getSmallBags(), 
                           reservation.getMediumBags(), 
                           reservation.getLargeBags());
            }
            
            // 3. 배치로 상태 업데이트
            int updatedCount = reservationRepository.updateExpiredReservationsForStoreToCompleted(businessName, address);
            
            logger.info("매장별 만료 예약 처리 완료: businessName={}, address={}, 처리된예약수={}, 복원용량(소/중/대)={}/{}/{}", 
                       businessName, address, updatedCount, totalSmallBags, totalMediumBags, totalLargeBags);
            
            // 4. 캐시 업데이트
            lastProcessedTimeCache.put(cacheKey, now);
            
        } catch (Exception e) {
            logger.error("매장별 만료 예약 처리 중 오류 발생: businessName={}, address={}", 
                        businessName, address, e);
            throw new RuntimeException("만료 예약 처리 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    // 엔티티를 DTO로 변환하는 헬퍼 메소드
    private ReservationDto mapToDto(Reservation reservation) {
        return ReservationDto.builder()
                .id(reservation.getId())
                .userId(reservation.getUser().getId())
                .userEmail(reservation.getUser().getEmail())
                .userName(reservation.getUser().getName())
                .placeName(reservation.getPlaceName())
                .placeAddress(reservation.getPlaceAddress())
                .reservationNumber(reservation.getReservationNumber())
                .storageDate(reservation.getStorageDate())
                .storageEndDate(reservation.getStorageEndDate())
                .storageStartTime(reservation.getStorageStartTime())
                .storageEndTime(reservation.getStorageEndTime())
                .smallBags(reservation.getSmallBags())
                .mediumBags(reservation.getMediumBags())
                .largeBags(reservation.getLargeBags())
                .totalPrice(reservation.getTotalPrice())
                .storageType(reservation.getStorageType())
                .status(reservation.getStatus())
                .paymentId(reservation.getPaymentId())
                .build();
    }
} 