package org.example.travellight.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.travellight.dto.CommonApiResponse;
import org.example.travellight.dto.PartnershipDto;
import org.example.travellight.entity.Partnership;
import org.example.travellight.service.PartnershipService;
import org.example.travellight.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "제휴점 관리", description = "제휴점 신청 및 관리 API")
@RestController
@RequestMapping("/api/partnership")
public class PartnershipController {

    @Autowired
    private PartnershipService partnershipService;
    
    @Autowired
    private ReservationService reservationService;

    @Operation(summary = "모든 제휴점 조회", description = "등록된 모든 제휴점의 정보를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "500", description = "서버 오류", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @GetMapping
    public ResponseEntity<?> getAllPartnerships() {
        try {
            List<Partnership> partnerships = partnershipService.getAllPartnerships();
            return ResponseEntity.ok(CommonApiResponse.success("모든 제휴점 정보를 조회했습니다.", partnerships));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("제휴점 정보 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    @Operation(summary = "제휴점 신청", description = "새로운 제휴점 신청을 등록합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "신청 성공", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "500", description = "서버 오류", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PostMapping
    public ResponseEntity<?> createPartnership(
            @Parameter(description = "제휴점 신청 정보", required = true)
            @RequestBody PartnershipDto partnershipDto) {
        try {
            // 간단한 유효성 검사
            if (partnershipDto.getBusinessName() == null || partnershipDto.getBusinessName().isEmpty() ||
                    partnershipDto.getEmail() == null || partnershipDto.getEmail().isEmpty() ||
                    partnershipDto.getPhone() == null || partnershipDto.getPhone().isEmpty() ||
                    !partnershipDto.isAgreeTerms()) {

                return ResponseEntity.badRequest()
                        .body(CommonApiResponse.error("필수 항목이 누락되었습니다."));
            }

            // 서비스를 통해 데이터 저장
            Partnership savedPartnership = partnershipService.createPartnership(partnershipDto);

            // 클라이언트에 전달할 응답 데이터
            Map<String, Object> data = new HashMap<>();
            data.put("id", savedPartnership.getId());
            data.put("submissionId", savedPartnership.getSubmissionId());

            return ResponseEntity.ok(CommonApiResponse.success("제휴 신청이 성공적으로 접수되었습니다.", data));
        } catch (Exception e) {
            System.out.println("제휴 신청 처리 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("제출 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    @Operation(summary = "제휴점 신청 조회", description = "제출 ID로 제휴점 신청 정보를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "404", description = "신청 정보를 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @GetMapping("/{submissionId}")
    public ResponseEntity<?> getPartnershipBySubmissionId(
            @Parameter(description = "제출 ID", required = true)
            @PathVariable String submissionId) {
        try {
            Partnership partnership = partnershipService.getPartnershipBySubmissionId(submissionId);
            return ResponseEntity.ok(CommonApiResponse.success("제휴 신청 정보를 찾았습니다.", partnership));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(CommonApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "제휴점 상태 업데이트", description = "제휴점 신청의 상태를 승인 또는 거절로 업데이트합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "상태 업데이트 성공", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 상태 값", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "500", description = "서버 오류", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updatePartnershipStatus(
            @Parameter(description = "제휴점 ID", required = true)
            @PathVariable(name = "id") Long id,
            @Parameter(description = "상태 업데이트 정보", required = true)
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || !List.of("APPROVED", "REJECTED").contains(newStatus)) {
                return ResponseEntity.badRequest()
                        .body(CommonApiResponse.error("유효하지 않은 상태입니다. APPROVED 또는 REJECTED만 가능합니다."));
            }

            String rejectionReason = statusUpdate.get("rejectionReason");
            Partnership updatedPartnership = partnershipService.updatePartnershipStatus(id, newStatus, rejectionReason);
            
            String successMessage = "APPROVED".equals(newStatus) 
                ? "제휴점이 승인되었습니다. 해당 사용자의 권한이 파트너로 업데이트되었습니다." 
                : "제휴 신청이 거절되었습니다. 거부 사유가 이메일로 전송되었습니다.";
                
            return ResponseEntity.ok(CommonApiResponse.success(successMessage, updatedPartnership));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("상태 업데이트 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/storage")
    public ResponseEntity<?> updateStorageCapacity(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Integer> storageUpdate) {
        try {
            Partnership partnership = partnershipService.getPartnershipById(id);
            if (storageUpdate.containsKey("smallBagsAvailable")) {
                partnership.setSmallBagsAvailable(storageUpdate.get("smallBagsAvailable"));
            }
            if (storageUpdate.containsKey("mediumBagsAvailable")) {
                partnership.setMediumBagsAvailable(storageUpdate.get("mediumBagsAvailable"));
            }
            if (storageUpdate.containsKey("largeBagsAvailable")) {
                partnership.setLargeBagsAvailable(storageUpdate.get("largeBagsAvailable"));
            }
            partnershipService.save(partnership);
            return ResponseEntity.ok(CommonApiResponse.success("보관 용량이 성공적으로 수정되었습니다.", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("보관 용량 수정 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/current-usage")
    public ResponseEntity<?> getCurrentUsage(@PathVariable("id") Long id) {
        try {
            Partnership partnership = partnershipService.getPartnershipById(id);
            Map<String, Integer> currentUsage = partnershipService.getCurrentUsedCapacity(
                partnership.getBusinessName(), 
                partnership.getAddress()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("maxCapacity", Map.of(
                "smallBags", partnership.getSmallBagsAvailable() != null ? partnership.getSmallBagsAvailable() : 0,
                "mediumBags", partnership.getMediumBagsAvailable() != null ? partnership.getMediumBagsAvailable() : 0,
                "largeBags", partnership.getLargeBagsAvailable() != null ? partnership.getLargeBagsAvailable() : 0
            ));
            response.put("currentUsage", currentUsage);
            response.put("availableCapacity", Map.of(
                "smallBags", Math.max(0, (partnership.getSmallBagsAvailable() != null ? partnership.getSmallBagsAvailable() : 0) - currentUsage.get("smallBags")),
                "mediumBags", Math.max(0, (partnership.getMediumBagsAvailable() != null ? partnership.getMediumBagsAvailable() : 0) - currentUsage.get("mediumBags")),
                "largeBags", Math.max(0, (partnership.getLargeBagsAvailable() != null ? partnership.getLargeBagsAvailable() : 0) - currentUsage.get("largeBags"))
            ));
            
            return ResponseEntity.ok(CommonApiResponse.success("현재 사용량 조회 성공", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("현재 사용량 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    @GetMapping("/available-capacity")
    public ResponseEntity<?> getAvailableCapacity(
            @RequestParam("businessName") String businessName,
            @RequestParam("address") String address) {
        try {
            // 1. 먼저 해당 매장의 만료된 예약들을 실시간으로 정리
            reservationService.processExpiredReservationsForStore(businessName, address);
            
            Partnership partnership = partnershipService.findByBusinessNameAndAddress(businessName, address);
            if (partnership == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(CommonApiResponse.error("해당 매장을 찾을 수 없습니다."));
            }
            
            // 2. 정리 후 정확한 용량 계산
            Map<String, Integer> currentUsage = partnershipService.getCurrentUsedCapacity(businessName, address);
            
            Map<String, Object> response = new HashMap<>();
            response.put("maxCapacity", Map.of(
                "smallBags", partnership.getSmallBagsAvailable() != null ? partnership.getSmallBagsAvailable() : 0,
                "mediumBags", partnership.getMediumBagsAvailable() != null ? partnership.getMediumBagsAvailable() : 0,
                "largeBags", partnership.getLargeBagsAvailable() != null ? partnership.getLargeBagsAvailable() : 0
            ));
            response.put("currentUsage", currentUsage);
            response.put("availableCapacity", Map.of(
                "smallBags", Math.max(0, (partnership.getSmallBagsAvailable() != null ? partnership.getSmallBagsAvailable() : 0) - currentUsage.get("smallBags")),
                "mediumBags", Math.max(0, (partnership.getMediumBagsAvailable() != null ? partnership.getMediumBagsAvailable() : 0) - currentUsage.get("mediumBags")),
                "largeBags", Math.max(0, (partnership.getLargeBagsAvailable() != null ? partnership.getLargeBagsAvailable() : 0) - currentUsage.get("largeBags"))
            ));
            
            return ResponseEntity.ok(CommonApiResponse.success("사용 가능한 용량 조회 성공", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("사용 가능한 용량 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    // 관리자 대시보드를 위한 전체 보관함 현황 조회
    @GetMapping("/storage-status")
    public ResponseEntity<?> getAllStorageStatus() {
        try {
            List<Map<String, Object>> storageStatusList = partnershipService.getAllStorageStatus();
            return ResponseEntity.ok(CommonApiResponse.success("전체 보관함 현황 조회 성공", storageStatusList));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("보관함 현황 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    // 한글 요일을 영어 요일로 변환하는 유틸리티 메서드 추가
    private String convertDayToEnglish(String koreanDay) {
        switch (koreanDay) {
            case "월": return "MONDAY";
            case "화": return "TUESDAY";
            case "수": return "WEDNESDAY";
            case "목": return "THURSDAY";
            case "금": return "FRIDAY";
            case "토": return "SATURDAY";
            case "일": return "SUNDAY";
            default: return koreanDay; // 이미 영어인 경우 그대로 반환
        }
    }

    @Operation(summary = "제휴점 영업시간 업데이트", description = "제휴점의 영업시간을 업데이트합니다.")
    @PutMapping("/{id}/business-hours")
    public ResponseEntity<?> updateBusinessHours(
        @PathVariable("id") Long id,
        @RequestBody Map<String, Object> businessHoursUpdate
    ) {
        try {
            // 로깅 추가
            System.out.println("Received business hours update for partnership ID: " + id);
            System.out.println("Full request body: " + businessHoursUpdate);

            // 비즈니스 시간 맵 추출
            Map<String, Map<String, Object>> businessHours = 
                (Map<String, Map<String, Object>>) businessHoursUpdate.get("businessHours");
            
            // 24시간 영업 여부 추출
            Boolean is24Hours = (Boolean) businessHoursUpdate.get("is24Hours");

            // 로깅 추가
            System.out.println("Is 24 Hours: " + is24Hours);
            System.out.println("Business Hours: " + businessHours);

            // 파트너십 조회
            Partnership partnership = partnershipService.getPartnershipById(id);
            
            // 24시간 영업 상태 업데이트
            partnership.setIs24Hours(is24Hours != null && is24Hours);

            // 비즈니스 시간 업데이트
            if (businessHours != null) {
                Map<String, String> formattedBusinessHours = new HashMap<>();
                
                // 24시간 영업인 경우 모든 요일을 '24시간'으로 설정
                if (Boolean.TRUE.equals(is24Hours)) {
                    formattedBusinessHours.put("MONDAY", "24시간");
                    formattedBusinessHours.put("TUESDAY", "24시간");
                    formattedBusinessHours.put("WEDNESDAY", "24시간");
                    formattedBusinessHours.put("THURSDAY", "24시간");
                    formattedBusinessHours.put("FRIDAY", "24시간");
                    formattedBusinessHours.put("SATURDAY", "24시간");
                    formattedBusinessHours.put("SUNDAY", "24시간");
                } else {
                    for (Map.Entry<String, Map<String, Object>> entry : businessHours.entrySet()) {
                        String day = convertDayToEnglish(entry.getKey());
                        Map<String, Object> dayHours = entry.getValue();
                        
                        // 해당 요일이 활성화되었는지 확인
                        Boolean enabled = (Boolean) dayHours.get("enabled");
                        String open = (String) dayHours.get("open");
                        String close = (String) dayHours.get("close");
                        
                        // 로깅 추가
                        System.out.println("Day: " + day + ", Enabled: " + enabled + ", Open: " + open + ", Close: " + close);
                        
                        // 활성화된 요일만 시간 포맷
                        if (Boolean.TRUE.equals(enabled)) {
                            formattedBusinessHours.put(day, open + "-" + close);
                        }
                    }
                }

                partnership.setBusinessHours(formattedBusinessHours);
            }

            // 저장
            partnershipService.save(partnership);

            return ResponseEntity.ok(CommonApiResponse.success("영업시간이 성공적으로 업데이트되었습니다.", null));
        } catch (Exception e) {
            // 상세 에러 로깅
            System.err.println("영업시간 업데이트 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("영업시간 업데이트 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    @Operation(summary = "제휴점 전체 정보 수정", description = "제휴점의 모든 정보를 수정합니다. (어드민 전용)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "수정 성공", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "404", description = "제휴점을 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "500", description = "서버 오류", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePartnership(
            @Parameter(description = "제휴점 ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "수정할 제휴점 정보", required = true)
            @RequestBody PartnershipDto partnershipDto) {
        try {
            Partnership updatedPartnership = partnershipService.updatePartnership(id, partnershipDto);
            return ResponseEntity.ok(CommonApiResponse.success("제휴점 정보가 성공적으로 수정되었습니다.", updatedPartnership));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(CommonApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            System.err.println("제휴점 정보 수정 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("제휴점 정보 수정 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    @Operation(summary = "제휴점 해제", description = "제휴점을 해제합니다. 상태가 TERMINATED로 변경되고 사용자 권한이 USER로 변경됩니다. (어드민 전용)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "해제 성공", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "404", description = "제휴점을 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))),
        @ApiResponse(responseCode = "500", description = "서버 오류", 
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class)))
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> terminatePartnership(
            @Parameter(description = "제휴점 ID", required = true)
            @PathVariable Long id) {
        try {
            Partnership terminatedPartnership = partnershipService.terminatePartnership(id);
            return ResponseEntity.ok(CommonApiResponse.success("제휴점이 성공적으로 해제되었습니다. 사용자 권한이 USER로 변경되었습니다.", terminatedPartnership));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(CommonApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            System.err.println("제휴점 해제 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("제휴점 해제 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}