package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationDto {
    
    private Long id;
    private Long userId;
    private String userEmail;
    private String userName;
    
    private String placeName;
    private String placeAddress;
    private String reservationNumber;
    
    private LocalDate storageDate;
    private LocalDate storageEndDate;
    private LocalTime storageStartTime;
    private LocalTime storageEndTime;
    
    private Integer smallBags;
    private Integer mediumBags;
    private Integer largeBags;
    private Integer totalPrice;
    
    private String storageType; // "day" 또는 "period"
    @Builder.Default
    private String status = "RESERVED"; // RESERVED, COMPLETED, CANCELLED
    private String paymentId; // 포트원 결제 ID
    private String paymentMethod; // 결제 방법 (card, paypal)
    private Integer paymentAmount; // 결제 금액
    private LocalDateTime paymentTime; // 결제 시간
    private String paymentStatus; // 결제 상태 (PAID, FAILED, CANCELLED, REFUNDED)
    private String paymentProvider; // 결제 제공자 (portone, paypal, tosspayments 등)
    private String cardCompany; // 카드사명 (신한, 삼성, 현대 등)
    private String cardType; // 카드 타입 (신용카드, 체크카드, 할부카드 등)
    
    private LocalDateTime createdAt; // 예약 생성일
} 