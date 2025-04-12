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
import java.util.Map;

@RestController
@RequestMapping("/api/partnership")
public class PartnershipController {

    @Autowired
    private PartnershipService partnershipService;

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

            // 저장된 위도 경도 확인
//            System.out.println("ID: " + savedPartnership.getId());
//            System.out.println("제출 ID: " + savedPartnership.getSubmissionId());
            System.out.println("위도: " + savedPartnership.getLatitude());
            System.out.println("경도: " + savedPartnership.getLongitude());

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
}