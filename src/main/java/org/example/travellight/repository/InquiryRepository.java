package org.example.travellight.repository;

import org.example.travellight.entity.Inquiry;
import org.example.travellight.entity.InquiryStatus;
import org.example.travellight.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    
    // 사용자별 문의 목록 조회 (최신순)
    List<Inquiry> findByUserOrderByCreatedAtDesc(User user);
    
    // 사용자별 문의 목록 조회 (페이징)
    Page<Inquiry> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // 상태별 문의 목록 조회
    List<Inquiry> findByStatusOrderByCreatedAtDesc(InquiryStatus status);
    
    // 상태별 문의 목록 조회 (페이징)
    Page<Inquiry> findByStatusOrderByCreatedAtDesc(InquiryStatus status, Pageable pageable);
    
    // 모든 문의 목록 조회 (최신순, 페이징)
    Page<Inquiry> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // 사용자별 답변 대기 중인 문의 개수
    Long countByUserAndStatus(User user, InquiryStatus status);
    
    // 전체 답변 대기 중인 문의 개수
    Long countByStatus(InquiryStatus status);

    // 통합 검색 - 제목, 내용, 사용자명으로 검색
    @org.springframework.data.jpa.repository.Query("SELECT i FROM Inquiry i JOIN i.user u " +
           "WHERE LOWER(i.subject) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(i.content) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Inquiry> searchInquiries(@org.springframework.data.repository.query.Param("query") String query, Pageable pageable);
}





