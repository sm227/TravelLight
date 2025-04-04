package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import org.example.travellight.dto.ReservationDto;
import org.example.travellight.entity.Reservation;
import org.example.travellight.entity.User;
import org.example.travellight.repository.ReservationRepository;
import org.example.travellight.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {
    
    private static final Logger logger = LoggerFactory.getLogger(ReservationServiceImpl.class);
    
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    
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
                    .build();
            
            // 저장
            logger.info("예약 엔티티 저장 시도: {}", reservation);
            Reservation savedReservation = reservationRepository.save(reservation);
            logger.info("예약 저장 성공: {}", savedReservation);
            
            // DTO 반환
            ReservationDto resultDto = mapToDto(savedReservation);
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
        
        reservationRepository.delete(reservation);
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
                .build();
    }
} 