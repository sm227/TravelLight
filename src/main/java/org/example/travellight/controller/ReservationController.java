package org.example.travellight.controller;

import lombok.RequiredArgsConstructor;
import org.example.travellight.dto.ReservationDto;
import org.example.travellight.service.ReservationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {
    
    private static final Logger logger = LoggerFactory.getLogger(ReservationController.class);
    
    private final ReservationService reservationService;
    
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
    
    // 파트너 대시보드를 위한 매장명별 예약 조회
    @GetMapping("/store/{placeName}")
    public ResponseEntity<List<ReservationDto>> getReservationsByPlace(
            @PathVariable("placeName") String placeName) {
        List<ReservationDto> reservations = reservationService.getReservationsByPlaceName(placeName);
        return ResponseEntity.ok(reservations);
    }
} 