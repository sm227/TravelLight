package org.example.travellight.repository;

import org.example.travellight.entity.TalentPool;
import org.example.travellight.entity.TalentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TalentPoolRepository extends JpaRepository<TalentPool, Long> {
    List<TalentPool> findByStatus(TalentStatus status);
    List<TalentPool> findByField(String field);
    List<TalentPool> findByEmail(String email);
    long countByStatus(TalentStatus status);
}