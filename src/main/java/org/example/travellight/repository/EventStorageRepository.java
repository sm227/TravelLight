package org.example.travellight.repository;

import org.example.travellight.entity.EventStorage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventStorageRepository extends JpaRepository<EventStorage, Long> {
    EventStorage findBySubmissionId(String submissionId);

    // 통합 검색 - 이벤트명, 주최자명, 이메일, 제출ID로 검색
    @Query("SELECT e FROM EventStorage e " +
           "WHERE LOWER(e.eventName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(e.organizerName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(e.submissionId) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<EventStorage> searchEvents(@Param("query") String query, Pageable pageable);
}