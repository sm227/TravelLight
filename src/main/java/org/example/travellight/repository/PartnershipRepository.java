package org.example.travellight.repository;

import org.example.travellight.entity.Partnership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PartnershipRepository extends JpaRepository<Partnership, Long> {
    Optional<Partnership> findBySubmissionId(String submissionId);
}