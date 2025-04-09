package org.example.travellight.repository;

import org.example.travellight.entity.EventStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventStorageRepository extends JpaRepository<EventStorage, Long> {
    EventStorage findBySubmissionId(String submissionId);
}