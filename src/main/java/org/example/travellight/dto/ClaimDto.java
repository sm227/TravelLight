package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.travellight.entity.ClaimStatus;

import java.time.LocalDateTime;

public class ClaimDto {
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClaimRequest {
        private Long userId;
        private String assignee;
        private String content;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClaimResponse {
        private Long id;
        private Long userId;
        private String userName;
        private String userEmail;
        private String assignee;
        private String content;
        private ClaimStatus status;
        private String createdByAdminName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime resolvedAt;
        private String resolution;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClaimUpdateRequest {
        private String assignee;
        private String content;
        private ClaimStatus status;
        private String resolution;
    }
}
