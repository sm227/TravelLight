package org.example.travellight.repository;

import org.example.travellight.entity.ApplicationStatus;
import org.example.travellight.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByStatus(ApplicationStatus status);
    List<JobApplication> findByDepartment(String department);
    List<JobApplication> findByEmail(String email);
    long countByStatus(ApplicationStatus status);
}