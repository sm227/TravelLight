package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class HrDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobApplicationRequest {
        private String positionTitle;
        private String department;
        private String applicantName;
        private String email;
        private String phone;
        private String coverLetter;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobApplicationResponse {
        private Long id;
        private String positionTitle;
        private String department;
        private String applicantName;
        private String email;
        private String phone;
        private String coverLetter;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TalentPoolRequest {
        private String name;
        private String email;
        private String phone;
        private String field;
        private String experience;
        private String introduction;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TalentPoolResponse {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String field;
        private String experience;
        private String introduction;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HrStatsResponse {
        private long totalApplications;
        private long pendingApplications;
        private long underReviewApplications;
        private long totalTalentPool;
        private long activeTalentPool;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        private String status;
    }
}