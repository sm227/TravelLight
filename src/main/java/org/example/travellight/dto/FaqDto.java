package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.travellight.entity.FaqCategory;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class FaqDto {
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FaqRequest {
        @NotNull(message = "카테고리는 필수입니다")
        private FaqCategory category;
        
        @NotBlank(message = "질문은 필수입니다")
        @Size(max = 500, message = "질문은 500자 이하여야 합니다")
        private String question;
        
        @NotBlank(message = "답변은 필수입니다")
        @Size(max = 2000, message = "답변은 2000자 이하여야 합니다")
        private String answer;
        
        @Min(value = 0, message = "정렬 순서는 0 이상이어야 합니다")
        private Integer sortOrder;
        
        @Builder.Default
        private Boolean isActive = true;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FaqResponse {
        private Long id;
        private FaqCategory category;
        private String categoryName;
        private String question;
        private String answer;
        private Integer sortOrder;
        private Boolean isActive;
        private Integer viewCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private UserInfo createdBy;
        private UserInfo updatedBy;
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
    public static class FaqUpdateRequest {
        private FaqCategory category;
        
        @Size(max = 500, message = "질문은 500자 이하여야 합니다")
        private String question;
        
        @Size(max = 2000, message = "답변은 2000자 이하여야 합니다")
        private String answer;
        
        @Min(value = 0, message = "정렬 순서는 0 이상이어야 합니다")
        private Integer sortOrder;
        
        private Boolean isActive;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FaqCategoryInfo {
        private String code;
        private String name;
        private Long count; // 해당 카테고리의 FAQ 개수
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FaqSearchRequest {
        private String keyword; // 검색어
        private FaqCategory category; // 카테고리 필터
        private Boolean isActive; // 활성화 여부 필터
    }
}

