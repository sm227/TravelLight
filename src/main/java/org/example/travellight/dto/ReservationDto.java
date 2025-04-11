package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

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
    private String status = "RESERVED"; // RESERVED, COMPLETED, CANCELLED
} 