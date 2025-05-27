package org.example.travellight.service;

import org.example.travellight.dto.PartnershipDto;
import org.example.travellight.entity.Partnership;
import org.example.travellight.entity.Reservation;
import org.example.travellight.repository.PartnershipRepository;
import org.example.travellight.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PartnershipService {

    @Autowired
    private PartnershipRepository partnershipRepository;
    
    @Autowired
    private ReservationRepository reservationRepository;

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

        // 가방 보관 가능 개수 매핑
        partnership.setSmallBagsAvailable(dto.getSmallBagsAvailable());
        partnership.setMediumBagsAvailable(dto.getMediumBagsAvailable());
        partnership.setLargeBagsAvailable(dto.getLargeBagsAvailable());

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

        // 사용자 역할을 WAIT으로 설정
        try {
            userService.updateUserRoleByEmail(dto.getEmail(), "WAIT");
            System.out.println("사용자 역할이 WAIT으로 업데이트되었습니다: " + dto.getEmail());
        } catch (Exception e) {
            System.err.println("사용자 역할 업데이트 중 오류 발생: " + e.getMessage());
            // 역할 업데이트 실패해도 파트너십 상태는 설정
        }

        // 저장 및 반환
        return partnershipRepository.save(partnership);
    }

    private String generateSubmissionId() {
        String uuid = UUID.randomUUID().toString().toUpperCase().replace("-", "");
        return "PT-" + uuid.substring(0, 4) + "-" + uuid.substring(4, 8);
    }

    public List<Partnership> getAllPartnerships() {
        return partnershipRepository.findAll();
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

    public Partnership getPartnershipById(Long id) {
        return partnershipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("제휴점을 찾을 수 없습니다: " + id));
    }

    public Partnership save(Partnership partnership) {
        return partnershipRepository.save(partnership);
    }

    // 매장명과 주소로 Partnership 찾기
    public Partnership findByBusinessNameAndAddress(String businessName, String address) {
        List<Partnership> partnerships = partnershipRepository.findAll();
        return partnerships.stream()
                .filter(p -> p.getBusinessName().equals(businessName) && p.getAddress().equals(address))
                .findFirst()
                .orElse(null);
    }
    
    // 현재 사용 중인 보관량 계산
    public Map<String, Integer> getCurrentUsedCapacity(String businessName, String address) {
        List<Reservation> activeReservations = reservationRepository.findByPlaceNameAndPlaceAddress(businessName, address)
                .stream()
                .filter(r -> "RESERVED".equals(r.getStatus()) || "IN_USE".equals(r.getStatus()))
                .collect(Collectors.toList());
        
        int usedSmallBags = activeReservations.stream()
                .mapToInt(r -> r.getSmallBags() != null ? r.getSmallBags() : 0)
                .sum();
        
        int usedMediumBags = activeReservations.stream()
                .mapToInt(r -> r.getMediumBags() != null ? r.getMediumBags() : 0)
                .sum();
        
        int usedLargeBags = activeReservations.stream()
                .mapToInt(r -> r.getLargeBags() != null ? r.getLargeBags() : 0)
                .sum();
        
        Map<String, Integer> usedCapacity = new HashMap<>();
        usedCapacity.put("smallBags", usedSmallBags);
        usedCapacity.put("mediumBags", usedMediumBags);
        usedCapacity.put("largeBags", usedLargeBags);
        
        return usedCapacity;
    }
    
    // 모든 승인된 파트너십의 보관함 현황 조회 (관리자 대시보드용)
    public List<Map<String, Object>> getAllStorageStatus() {
        List<Partnership> approvedPartnerships = partnershipRepository.findAll()
                .stream()
                .filter(p -> "APPROVED".equals(p.getStatus()))
                .collect(Collectors.toList());
        
        return approvedPartnerships.stream()
                .map(partnership -> {
                    Map<String, Integer> currentUsage = getCurrentUsedCapacity(
                        partnership.getBusinessName(), 
                        partnership.getAddress()
                    );
                    
                    int maxSmallBags = partnership.getSmallBagsAvailable() != null ? partnership.getSmallBagsAvailable() : 0;
                    int maxMediumBags = partnership.getMediumBagsAvailable() != null ? partnership.getMediumBagsAvailable() : 0;
                    int maxLargeBags = partnership.getLargeBagsAvailable() != null ? partnership.getLargeBagsAvailable() : 0;
                    
                    int usedSmallBags = currentUsage.get("smallBags");
                    int usedMediumBags = currentUsage.get("mediumBags");
                    int usedLargeBags = currentUsage.get("largeBags");
                    
                    int totalCapacity = maxSmallBags + maxMediumBags + maxLargeBags;
                    int totalUsed = usedSmallBags + usedMediumBags + usedLargeBags;
                    
                    double usagePercentage = totalCapacity > 0 ? (double) totalUsed / totalCapacity * 100 : 0;
                    
                    Map<String, Object> storageStatus = new HashMap<>();
                    storageStatus.put("name", partnership.getBusinessName());
                    storageStatus.put("address", partnership.getAddress());
                    storageStatus.put("usage", Math.round(usagePercentage));
                    storageStatus.put("total", totalCapacity);
                    storageStatus.put("used", totalUsed);
                    storageStatus.put("소형", usedSmallBags);
                    storageStatus.put("중형", usedMediumBags);
                    storageStatus.put("대형", usedLargeBags);
                    storageStatus.put("maxSmall", maxSmallBags);
                    storageStatus.put("maxMedium", maxMediumBags);
                    storageStatus.put("maxLarge", maxLargeBags);
                    
                    return storageStatus;
                })
                .collect(Collectors.toList());
    }
}