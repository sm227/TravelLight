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
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PartnershipService {

    @Autowired
    private PartnershipRepository partnershipRepository;

    private final AddressTsService addressTsService;
    
    @Autowired
    private UserService userService;

    public PartnershipService(PartnershipRepository partnershipRepository, AddressTsService addressTsService) {
        this.addressTsService = addressTsService;
    }

    @Transactional
    public Partnership createPartnership(PartnershipDto dto) {
        Partnership partnership = new Partnership();

        // 프론트엔드에서 전달된 위도/경도 값 사용
        double latitude = dto.getLatitude();
        double longitude = dto.getLongitude();
        
        // 위경도가 전달되지 않았거나 0인 경우에만 API로 변환 시도
        if (latitude == 0 || longitude == 0) {
            try {
                System.out.println("프론트엔드에서 좌표가 전달되지 않아 API로 변환 시도");
                // 주소 → 위도/경도 변환
                double[] latLng = addressTsService.getCoordinatesFromAddress(dto.getAddress());
                latitude = latLng[0];
                longitude = latLng[1];
                System.out.println("API 변환 좌표: [" + latitude + ", " + longitude + "]");
            } catch (Exception e) {
                System.out.println("API 좌표 변환 실패, 오류: " + e.getMessage());
                throw new RuntimeException("주소를 좌표로 변환할 수 없습니다: " + e.getMessage());
            }
        } else {
            System.out.println("프론트엔드에서 전달된 좌표 사용: [" + latitude + ", " + longitude + "]");
        }

        // 기본 정보 설정
        partnership.setBusinessName(dto.getBusinessName());
        partnership.setOwnerName(dto.getOwnerName());
        partnership.setEmail(dto.getEmail());
        partnership.setPhone(dto.getPhone());
        partnership.setAddress(dto.getAddress());

        // 좌표 설정
        partnership.setLatitude(latitude);
        partnership.setLongitude(longitude);

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
        partnership.setSubmissionId(generateSubmissionId());

        // 파트너십 신청 후 파트너로 등급 변경 DB 제약 조건 수정
        // 수정 사항에 대한 내용을 주석처리 해둠 + 이미 수정 사항이었다면 문제 없음.
        //ALTER TABLE users DROP CONSTRAINT users_role_check;
        //ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (
        //    role::text = ANY (ARRAY[
        //      'ADMIN'::character varying, 
        //      'USER'::character varying, 
        //      'PARTNER'::character varying, 
        //      'WAIT'::character varying
        //    ]::text[])
        //  );
        // 수정사항 - WAIT 상태 (USER로 기본 상태 유지중이지만 WAIT 상태 -> 파트너십 신청 후 파트너로 등급 변경)

        // 사용자 역할을 USER로 유지하고, 파트너십 상태만 PENDING으로 설정
        // 기본 상태는 이미 PENDING으로 설정되어 있음
        System.out.println("파트너십 신청이 접수되었습니다."); 

        // 저장 및 반환
        return partnershipRepository.save(partnership);
    }

    private String generateSubmissionId() {
        String uuid = UUID.randomUUID().toString().toUpperCase().replace("-", "");
        return "PT-" + uuid.substring(0, 4) + "-" + uuid.substring(4, 8);
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

    public List<Partnership> getAllPartnerships() {
        return partnershipRepository.findAll();
    }

    @Transactional
    public Partnership updatePartnershipStatus(Long id, String newStatus) {
        Partnership partnership = partnershipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("제휴점을 찾을 수 없습니다: " + id));
        
        // 현재 상태와 동일한 경우 예외 발생
        if (partnership.getStatus().equals(newStatus)) {
            throw new RuntimeException("이미 " + (newStatus.equals("APPROVED") ? "승인" : "거절") + "된 상태입니다.");
        }
        
        partnership.setStatus(newStatus);
        
        // APPROVED 상태로 변경되면 해당 사용자의 역할을 PARTNER로 업데이트
        if ("APPROVED".equals(newStatus)) {
            try {
                userService.updateUserRoleByEmail(partnership.getEmail(), "PARTNER");
                System.out.println("사용자 역할이 PARTNER로 업데이트되었습니다: " + partnership.getEmail());
            } catch (Exception e) {
                System.err.println("사용자 역할 업데이트 중 오류 발생: " + e.getMessage());
                // 역할 업데이트 실패해도 파트너십 상태는 변경
            }
        }
        
        return partnershipRepository.save(partnership);
    }
}