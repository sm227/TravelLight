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

    private final AddressTsService addressTsService;

    public PartnershipService(PartnershipRepository partnershipRepository, AddressTsService addressTsService) {
        this.addressTsService = addressTsService;
    }

    @Transactional
    public Partnership createPartnership(PartnershipDto dto) {
        Partnership partnership = new Partnership();

        // 주소 → 위도/경도 변환
        double[] latLng = addressTsService.getCoordinatesFromAddress(dto.getAddress());
        System.out.println("변환된 좌표: [" + latLng[0] + ", " + latLng[1] + "]");

        // 기본 정보 설정
        partnership.setBusinessName(dto.getBusinessName());
        partnership.setOwnerName(dto.getOwnerName());
        partnership.setEmail(dto.getEmail());
        partnership.setPhone(dto.getPhone());
        partnership.setAddress(dto.getAddress());

        // 좌표 설정
        partnership.setLatitude(latLng[0]); // 위도
        partnership.setLongitude(latLng[1]); // 경도

        partnership.setBusinessType(dto.getBusinessType());
        partnership.setSpaceSize(dto.getSpaceSize());
        partnership.setAdditionalInfo(dto.getAdditionalInfo());
        partnership.setAgreeTerms(dto.isAgreeTerms());
        partnership.setIs24Hours(dto.isIs24Hours());

        // 좌표 설정 전에 배열 길이 확인
        if (latLng.length >= 2) {
            partnership.setLatitude(latLng[0]);
            partnership.setLongitude(latLng[1]);
        } else {
            // 좌표를 얻지 못한 경우 기본값 설정이나 오류 처리
            partnership.setLatitude(0.0);  // 기본값 또는 적절한 처리
            partnership.setLongitude(0.0); // 기본값 또는 적절한 처리
            // 또는 오류 처리
            // throw new RuntimeException("주소에서 좌표를 얻을 수 없습니다: " + dto.getAddress());
        }

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

    public Partnership registerPartnership(PartnershipDto dto) {
        // 주소 → 좌표 변환은 AddressTsService에게 맡김
        double[] latLng = addressTsService.getCoordinatesFromAddress(dto.getAddress());

        Partnership partnership = new Partnership();
        partnership.setAddress(dto.getAddress());
        partnership.setLatitude(latLng[0]);
        partnership.setLongitude(latLng[1]);

        return partnershipRepository.save(partnership);
    }
}