package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.travellight.entity.InquiryStatus;
import org.example.travellight.entity.InquiryType;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class InquiryDto {
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InquiryRequest {
        @NotNull(message = "문의 유형은 필수입니다")
        private InquiryType inquiryType;
        
        @NotBlank(message = "제목은 필수입니다")
        @Size(max = 200, message = "제목은 200자 이하여야 합니다")
        private String subject;
        
        @NotBlank(message = "내용은 필수입니다")
        @Size(min = 10, max = 2000, message = "내용은 10자 이상 2000자 이하여야 합니다")
        private String content;
        
        @NotBlank(message = "이메일은 필수입니다")
        @Email(message = "유효한 이메일 주소를 입력해주세요")
        private String email;
        
        private String phone;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InquiryResponse {
        private Long id;
        private InquiryType inquiryType;
        private String inquiryTypeName;
        private String subject;
        private String content;
        private String email;
        private String phone;
        private InquiryStatus status;
        private String statusName;
        private String adminReply;
        private LocalDateTime repliedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        // 사용자 정보
        private UserInfo user;
        
        // 관리자 정보
        private UserInfo adminUser;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminReplyRequest {
        @NotBlank(message = "답변 내용은 필수입니다")
        @Size(max = 2000, message = "답변은 2000자 이하여야 합니다")
        private String adminReply;
    }
}





