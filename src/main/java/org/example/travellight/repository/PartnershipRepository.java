package org.example.travellight.repository;

import org.example.travellight.entity.Partnership;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartnershipRepository extends JpaRepository<Partnership, Long> {
    Optional<Partnership> findBySubmissionId(String submissionId);

    // 통합 검색 - 사업체명, 주소, 이메일, 전화번호, 제출ID로 검색
    @Query("SELECT p FROM Partnership p " +
           "WHERE LOWER(p.businessName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.address) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.phone) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.submissionId) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Partnership> searchPartnerships(@Param("query") String query, Pageable pageable);
}