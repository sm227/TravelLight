package org.example.travellight.controller;

import org.example.travellight.dto.ApiResponse;
import org.example.travellight.dto.PartnershipDto;
import org.example.travellight.entity.Partnership;
import org.example.travellight.service.PartnershipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/partnership")
public class PartnershipController {

    @Autowired
    private PartnershipService partnershipService;

    @GetMapping
    public ResponseEntity<?> getAllPartnerships() {
        try {
            List<Partnership> partnerships = partnershipService.getAllPartnerships();
            return ResponseEntity.ok(ApiResponse.success("모든 제휴점 정보를 조회했습니다.", partnerships));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("제휴점 정보 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createPartnership(@RequestBody PartnershipDto partnershipDto) {
        try {
            // 간단한 유효성 검사
            if (partnershipDto.getBusinessName() == null || partnershipDto.getBusinessName().isEmpty() ||
                    partnershipDto.getEmail() == null || partnershipDto.getEmail().isEmpty() ||
                    partnershipDto.getPhone() == null || partnershipDto.getPhone().isEmpty() ||
                    !partnershipDto.isAgreeTerms()) {

                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("필수 항목이 누락되었습니다."));
            }

            // 서비스를 통해 데이터 저장
            Partnership savedPartnership = partnershipService.createPartnership(partnershipDto);

            // 클라이언트에 전달할 응답 데이터
            Map<String, Object> data = new HashMap<>();
            data.put("id", savedPartnership.getId());
            data.put("submissionId", savedPartnership.getSubmissionId());

            return ResponseEntity.ok(ApiResponse.success("제휴 신청이 성공적으로 접수되었습니다.", data));
        } catch (Exception e) {
            System.out.println("제휴 신청 처리 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("제출 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    @GetMapping("/{submissionId}")
    public ResponseEntity<?> getPartnershipBySubmissionId(@PathVariable String submissionId) {
        try {
            Partnership partnership = partnershipService.getPartnershipBySubmissionId(submissionId);
            return ResponseEntity.ok(ApiResponse.success("제휴 신청 정보를 찾았습니다.", partnership));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updatePartnershipStatus(
            @PathVariable(name = "id") Long id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || !List.of("APPROVED", "REJECTED").contains(newStatus)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 상태입니다. APPROVED 또는 REJECTED만 가능합니다."));
            }

            Partnership updatedPartnership = partnershipService.updatePartnershipStatus(id, newStatus);
            return ResponseEntity.ok(ApiResponse.success(
                "제휴점 상태가 " + (newStatus.equals("APPROVED") ? "승인" : "거절") + "되었습니다.", 
                updatedPartnership
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("상태 업데이트 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}