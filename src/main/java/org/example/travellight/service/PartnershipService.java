package org.example.travellight.service;

import org.example.travellight.dto.PartnershipDto;
import org.example.travellight.entity.Partnership;
import org.example.travellight.repository.PartnershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class PartnershipService {

    @Autowired
    private PartnershipRepository partnershipRepository;

    @Transactional
    public Partnership createPartnership(PartnershipDto dto) {
        Partnership partnership = new Partnership();

        // 기본 정보 설정
        partnership.setBusinessName(dto.getBusinessName());
        partnership.setOwnerName(dto.getOwnerName());
        partnership.setEmail(dto.getEmail());
        partnership.setPhone(dto.getPhone());
        partnership.setAddress(dto.getAddress());
        partnership.setBusinessType(dto.getBusinessType());
        partnership.setSpaceSize(dto.getSpaceSize());
        partnership.setAdditionalInfo(dto.getAdditionalInfo());
        partnership.setAgreeTerms(dto.isAgreeTerms());
        partnership.setIs24Hours(dto.isIs24Hours());

        // 영업시간 정보 변환 및 설정
        Map<String, String> businessHoursMap = new HashMap<>();
        if (dto.getBusinessHours() != null) {
            for (Map.Entry<String, PartnershipDto.BusinessHourDto> entry : dto.getBusinessHours().entrySet()) {
                String day = entry.getKey();
                PartnershipDto.BusinessHourDto hourDto = entry.getValue();

                // 24시간 영업이거나 해당 요일이 활성화된 경우만 저장
                if (dto.isIs24Hours()) {
                    businessHoursMap.put(day, "24시간");
                } else if (hourDto.isEnabled()) {
                    businessHoursMap.put(day, hourDto.getOpen() + "-" + hourDto.getClose());
                }
            }
        }
        partnership.setBusinessHours(businessHoursMap);

        // 고유 신청 ID 생성
        String submissionId = generateSubmissionId();
        partnership.setSubmissionId(submissionId);

        // 저장 및 반환
        return partnershipRepository.save(partnership);
    }

    private String generateSubmissionId() {
        // "PN" + 현재 시간 기반으로 고유 ID 생성
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyMMddHHmmss"));
        return "PN" + timestamp;
    }

    public Partnership getPartnershipBySubmissionId(String submissionId) {
        return partnershipRepository.findBySubmissionId(submissionId)
                .orElseThrow(() -> new RuntimeException("제휴 신청 정보를 찾을 수 없습니다: " + submissionId));
    }
}