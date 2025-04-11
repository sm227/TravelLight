package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import org.example.travellight.dto.EventStorageDto;
import org.example.travellight.entity.EventStorage;
import org.example.travellight.repository.EventStorageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventStorageService {

    private final EventStorageRepository eventStorageRepository;

    @Transactional
    public String createEventStorageRequest(EventStorageDto dto) {
        // 고유한 신청번호 생성 (yyyyMMdd-UUID 형식)
        String submissionId = LocalDate.now().toString().replace("-", "") +
                "-" + UUID.randomUUID().toString().substring(0, 8);

        // DTO를 Entity로 변환
        EventStorage eventStorage = EventStorage.builder()
                .submissionId(submissionId)
                .eventName(dto.getEventName())
                .organizerName(dto.getOrganizerName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .eventType(dto.getEventType())
                .expectedAttendees(dto.getExpectedAttendees())
                .estimatedStorage(dto.getEstimatedStorage())
                .eventVenue(dto.getEventVenue())
                .eventAddress(dto.getEventAddress())
                .eventDate(dto.getEventDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .setupTime(dto.getSetupTime())
                .additionalRequirements(dto.getAdditionalRequirements())
                .agreeTerms(dto.isAgreeTerms())
                .createdAt(LocalDate.now())
                .status("접수")
                .build();

        eventStorageRepository.save(eventStorage);

        // 신청번호 반환
        return submissionId;
    }

    public EventStorage getEventStorageBySubmissionId(String submissionId) {
        return eventStorageRepository.findBySubmissionId(submissionId);
    }

    @Transactional(readOnly = true)
    public List<EventStorage> getAllEventStorages() {
        return eventStorageRepository.findAll();
    }

    @Transactional
    public boolean updateEventStorageStatus(Long id, String newStatus) {
        Optional<EventStorage> eventStorageOpt = eventStorageRepository.findById(id);
        
        if (eventStorageOpt.isPresent()) {
            EventStorage eventStorage = eventStorageOpt.get();
            eventStorage.setStatus(newStatus);
            eventStorageRepository.save(eventStorage);
            return true;
        }
        
        return false;
    }

    @Transactional(readOnly = true)
    public boolean validateSubmission(EventStorageDto dto) {
        // 기본 유효성 검증 로직
        if (dto.getEventName() == null || dto.getEventName().trim().isEmpty()) {
            return false;
        }
        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            return false;
        }
        if (dto.getPhone() == null || dto.getPhone().trim().isEmpty()) {
            return false;
        }
        if (dto.getEventDate() == null) {
            return false;
        }
        if (!dto.isAgreeTerms()) {
            return false;
        }

        return true;
    }
}