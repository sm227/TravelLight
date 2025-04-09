package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventStorageDto {
    private String eventName;
    private String organizerName;
    private String email;
    private String phone;
    private String eventType;
    private String expectedAttendees;
    private String estimatedStorage;
    private String eventVenue;
    private String eventAddress;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalTime setupTime;
    private String additionalRequirements;
    private boolean agreeTerms;
}