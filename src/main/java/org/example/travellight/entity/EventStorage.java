package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "event_storage")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventStorage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String submissionId; // 신청번호

    @Column(nullable = false)
    private String eventName; // 행사명

    private String organizerName; // 담당자명

    @Column(nullable = false)
    private String email; // 이메일

    @Column(nullable = false)
    private String phone; // 연락처

    private String eventType; // 행사 유형

    private String expectedAttendees; // 예상 관객수

    private String estimatedStorage; // 예상 보관 짐 수량

    private String eventVenue; // 행사 장소명

    private String eventAddress; // 행사 장소 주소

    private LocalDate eventDate; // 행사 날짜

    private LocalTime startTime; // 행사 시작 시간

    private LocalTime endTime; // 행사 종료 시간

    private LocalTime setupTime; // 현장 설치 시간

    @Column(length = 1000)
    private String additionalRequirements; // 추가 요청사항

    private boolean agreeTerms; // 개인정보 수집 동의

    private LocalDate createdAt; // 신청일

    private String status; // 상태 (접수, 확인중, 확정, 취소 등)
}