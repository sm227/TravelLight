package org.example.travellight.controller;

import lombok.RequiredArgsConstructor;
import org.example.travellight.dto.ApiResponse;
import org.example.travellight.dto.EventStorageDto;
import org.example.travellight.service.EventStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EventStorageController {

    private final EventStorageService eventStorageService;

    @PostMapping("/EventStorage")
    public ResponseEntity<ApiResponse> createEventStorageRequest(@RequestBody Map<String, Object> requestMap) {
        try {
            // 날짜/시간 데이터 변환
            LocalDate eventDate = null;
            LocalTime startTime = null;
            LocalTime endTime = null;
            LocalTime setupTime = null;

            if (requestMap.get("eventDate") != null) {
                String eventDateStr = requestMap.get("eventDate").toString();
                if (eventDateStr.contains("T")) {
                    eventDate = LocalDate.parse(eventDateStr.split("T")[0]);
                } else {
                    eventDate = LocalDate.parse(eventDateStr);
                }
            }

            if (requestMap.get("startTime") != null) {
                String startTimeStr = requestMap.get("startTime").toString();
                if (startTimeStr.contains("T")) {
                    startTime = LocalTime.parse(startTimeStr.split("T")[1].substring(0, 8));
                } else {
                    startTime = LocalTime.parse(startTimeStr);
                }
            }

            if (requestMap.get("endTime") != null) {
                String endTimeStr = requestMap.get("endTime").toString();
                if (endTimeStr.contains("T")) {
                    endTime = LocalTime.parse(endTimeStr.split("T")[1].substring(0, 8));
                } else {
                    endTime = LocalTime.parse(endTimeStr);
                }
            }

            if (requestMap.get("setupTime") != null) {
                String setupTimeStr = requestMap.get("setupTime").toString();
                if (setupTimeStr.contains("T")) {
                    setupTime = LocalTime.parse(setupTimeStr.split("T")[1].substring(0, 8));
                } else {
                    setupTime = LocalTime.parse(setupTimeStr);
                }
            }

            // DTO 객체 생성
            EventStorageDto dto = EventStorageDto.builder()
                    .eventName((String) requestMap.get("eventName"))
                    .organizerName((String) requestMap.get("organizerName"))
                    .email((String) requestMap.get("email"))
                    .phone((String) requestMap.get("phone"))
                    .eventType((String) requestMap.get("eventType"))
                    .expectedAttendees((String) requestMap.get("expectedAttendees"))
                    .estimatedStorage((String) requestMap.get("estimatedStorage"))
                    .eventVenue((String) requestMap.get("eventVenue"))
                    .eventAddress((String) requestMap.get("eventAddress"))
                    .eventDate(eventDate)
                    .startTime(startTime)
                    .endTime(endTime)
                    .setupTime(setupTime)
                    .additionalRequirements((String) requestMap.get("additionalRequirements"))
                    .agreeTerms(Boolean.valueOf(requestMap.get("agreeTerms").toString()))
                    .build();

            // 유효성 검증
            if (!eventStorageService.validateSubmission(dto)) {
                return ResponseEntity.badRequest().body(ApiResponse.builder()
                        .success(false)
                        .message("필수 항목을 모두 입력해주세요.")
                        .build());
            }

            // 서비스 호출하여 데이터 저장 및 신청번호 생성
            String submissionId = eventStorageService.createEventStorageRequest(dto);

            // 응답 생성
            Map<String, Object> data = new HashMap<>();
            data.put("submissionId", submissionId);

            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("이동식 짐보관 서비스 신청이 완료되었습니다.")
                    .data(data)
                    .build());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message("서버 오류가 발생했습니다: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping("/EventStorage/{submissionId}")
    public ResponseEntity<ApiResponse> getEventStorageRequest(@PathVariable String submissionId) {
        try {
            var eventStorage = eventStorageService.getEventStorageBySubmissionId(submissionId);

            if (eventStorage == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .data(eventStorage)
                    .build());

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message("조회 중 오류가 발생했습니다: " + e.getMessage())
                    .build());
        }
    }
}