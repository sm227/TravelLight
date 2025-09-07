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
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReservationServiceImpl implements ReservationService {
    
    private static final Logger logger = LoggerFactory.getLogger(ReservationServiceImpl.class);
    
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PartnershipService partnershipService;
    
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
        Reservation reservation = reservationRepository.findByReservationNumber(reservationNumber);
        if (reservation == null) {
            throw new RuntimeException("예약을 찾을 수 없습니다.");
        }
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
        Reservation reservation = reservationRepository.findByReservationNumber(reservationNumber);
        if (reservation == null) {
            throw new RuntimeException("예약을 찾을 수 없습니다.");
        }
        
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