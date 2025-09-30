package org.example.travellight.repository;

import org.example.travellight.entity.Claim;
import org.example.travellight.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    
    // 특정 사용자의 클레임 목록 조회
    List<Claim> findByUserOrderByCreatedAtDesc(User user);
    
    // 특정 사용자 ID로 클레임 목록 조회
    List<Claim> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // 담당자별 클레임 목록 조회
    List<Claim> findByAssigneeOrderByCreatedAtDesc(String assignee);
    
    // 상태별 클레임 목록 조회
    List<Claim> findByStatusOrderByCreatedAtDesc(org.example.travellight.entity.ClaimStatus status);
    
    // 페이징된 클레임 목록 조회
    Page<Claim> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // 특정 사용자의 페이징된 클레임 목록 조회
    Page<Claim> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // 클레임 검색 (담당자, 내용으로 검색)
    @Query("SELECT c FROM Claim c WHERE c.assignee LIKE %:keyword% OR c.content LIKE %:keyword% ORDER BY c.createdAt DESC")
    List<Claim> searchClaims(@Param("keyword") String keyword);
}
