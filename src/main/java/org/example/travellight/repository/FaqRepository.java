package org.example.travellight.repository;

import org.example.travellight.entity.Faq;
import org.example.travellight.entity.FaqCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqRepository extends JpaRepository<Faq, Long> {
    
    // 카테고리별 활성화된 FAQ 조회 (정렬 순서대로)
    List<Faq> findByCategoryAndIsActiveTrueOrderBySortOrderAsc(FaqCategory category);
    
    // 모든 활성화된 FAQ 조회 (정렬 순서대로)
    List<Faq> findByIsActiveTrueOrderBySortOrderAsc();
    
    // 카테고리별 FAQ 조회 (관리자용, 비활성화 포함)
    List<Faq> findByCategoryOrderBySortOrderAsc(FaqCategory category);
    
    // 모든 FAQ 조회 (관리자용, 정렬 순서대로)
    List<Faq> findAllByOrderBySortOrderAsc();
    
    // 검색어로 FAQ 검색 (질문 또는 답변에 포함)
    @Query("SELECT f FROM Faq f WHERE f.isActive = true AND " +
           "(LOWER(f.question) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(f.answer) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY f.sortOrder ASC")
    List<Faq> searchByKeyword(@Param("keyword") String keyword);
    
    // 카테고리 + 검색어로 FAQ 검색
    @Query("SELECT f FROM Faq f WHERE f.isActive = true AND f.category = :category AND " +
           "(LOWER(f.question) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(f.answer) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY f.sortOrder ASC")
    List<Faq> searchByCategoryAndKeyword(@Param("category") FaqCategory category, 
                                         @Param("keyword") String keyword);
    
    // 카테고리별 FAQ 개수 조회
    Long countByCategory(FaqCategory category);
    
    // 활성화된 FAQ 개수 조회
    Long countByIsActiveTrue();
    
    // 카테고리별 활성화된 FAQ 개수 조회
    Long countByCategoryAndIsActiveTrue(FaqCategory category);
    
    // 페이징 처리된 FAQ 조회 (관리자용)
    Page<Faq> findAllByOrderBySortOrderAsc(Pageable pageable);
    
    // 카테고리별 페이징 처리된 FAQ 조회
    Page<Faq> findByCategoryOrderBySortOrderAsc(FaqCategory category, Pageable pageable);
    
    // 조회수가 높은 FAQ 조회
    @Query("SELECT f FROM Faq f WHERE f.isActive = true ORDER BY f.viewCount DESC")
    List<Faq> findTopByViewCount(Pageable pageable);
}


