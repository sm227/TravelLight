package org.example.travellight.service;

import org.example.travellight.dto.FaqDto;
import org.example.travellight.entity.FaqCategory;
import org.example.travellight.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FaqService {
    
    // 사용자용 API
    
    /**
     * FAQ 목록 조회 (활성화된 FAQ만)
     */
    List<FaqDto.FaqResponse> getAllFaqs();
    
    /**
     * 카테고리별 FAQ 목록 조회 (활성화된 FAQ만)
     */
    List<FaqDto.FaqResponse> getFaqsByCategory(FaqCategory category);
    
    /**
     * FAQ 상세 조회
     */
    FaqDto.FaqResponse getFaq(Long faqId);
    
    /**
     * FAQ 검색
     */
    List<FaqDto.FaqResponse> searchFaqs(String keyword);
    
    /**
     * 카테고리 + 검색어로 FAQ 검색
     */
    List<FaqDto.FaqResponse> searchFaqsByCategoryAndKeyword(FaqCategory category, String keyword);
    
    /**
     * 카테고리 목록 조회 (각 카테고리별 FAQ 개수 포함)
     */
    List<FaqDto.FaqCategoryInfo> getAllCategories();
    
    /**
     * 인기 FAQ 조회 (조회수 기준)
     */
    List<FaqDto.FaqResponse> getPopularFaqs(int limit);
    
    // 관리자용 API
    
    /**
     * FAQ 생성
     */
    FaqDto.FaqResponse createFaq(FaqDto.FaqRequest request, User admin);
    
    /**
     * FAQ 수정
     */
    FaqDto.FaqResponse updateFaq(Long faqId, FaqDto.FaqUpdateRequest request, User admin);
    
    /**
     * FAQ 삭제
     */
    void deleteFaq(Long faqId, User admin);
    
    /**
     * 모든 FAQ 조회 (관리자용 - 비활성화 포함)
     */
    Page<FaqDto.FaqResponse> getAllFaqsForAdmin(Pageable pageable);
    
    /**
     * 카테고리별 FAQ 조회 (관리자용 - 비활성화 포함)
     */
    List<FaqDto.FaqResponse> getFaqsByCategoryForAdmin(FaqCategory category);
    
    /**
     * FAQ 활성화/비활성화 토글
     */
    FaqDto.FaqResponse toggleFaqActive(Long faqId, User admin);
    
    /**
     * FAQ 순서 변경
     */
    FaqDto.FaqResponse updateFaqOrder(Long faqId, Integer newOrder, User admin);
}


