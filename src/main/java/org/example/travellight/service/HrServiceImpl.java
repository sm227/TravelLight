package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import org.example.travellight.dto.HrDto;
import org.example.travellight.entity.*;
import org.example.travellight.repository.JobApplicationRepository;
import org.example.travellight.repository.TalentPoolRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HrServiceImpl implements HrService {
    
    private final JobApplicationRepository jobApplicationRepository;
    private final TalentPoolRepository talentPoolRepository;
    
    @Override
    @Transactional
    public HrDto.JobApplicationResponse submitJobApplication(HrDto.JobApplicationRequest request) {
        JobApplication jobApplication = JobApplication.builder()
                .positionTitle(request.getPositionTitle())
                .department(request.getDepartment())
                .applicantName(request.getApplicantName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .coverLetter(request.getCoverLetter())
                .build();
        
        JobApplication saved = jobApplicationRepository.save(jobApplication);
        return convertToJobApplicationResponse(saved);
    }
    
    @Override
    @Transactional
    public HrDto.TalentPoolResponse submitTalentPoolApplication(HrDto.TalentPoolRequest request) {
        TalentPool talentPool = TalentPool.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .field(request.getField())
                .experience(request.getExperience())
                .introduction(request.getIntroduction())
                .build();
        
        TalentPool saved = talentPoolRepository.save(talentPool);
        return convertToTalentPoolResponse(saved);
    }
    
    @Override
    public Page<HrDto.JobApplicationResponse> getAllJobApplications(Pageable pageable) {
        return jobApplicationRepository.findAll(pageable)
                .map(this::convertToJobApplicationResponse);
    }
    
    @Override
    public Page<HrDto.TalentPoolResponse> getAllTalentPool(Pageable pageable) {
        return talentPoolRepository.findAll(pageable)
                .map(this::convertToTalentPoolResponse);
    }
    
    @Override
    @Transactional
    public HrDto.JobApplicationResponse updateApplicationStatus(Long applicationId, String status) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Job application not found"));
        
        application.setStatus(ApplicationStatus.valueOf(status.toUpperCase()));
        JobApplication updated = jobApplicationRepository.save(application);
        return convertToJobApplicationResponse(updated);
    }
    
    @Override
    @Transactional
    public HrDto.TalentPoolResponse updateTalentStatus(Long talentId, String status) {
        TalentPool talent = talentPoolRepository.findById(talentId)
                .orElseThrow(() -> new RuntimeException("Talent pool entry not found"));
        
        talent.setStatus(TalentStatus.valueOf(status.toUpperCase()));
        TalentPool updated = talentPoolRepository.save(talent);
        return convertToTalentPoolResponse(updated);
    }
    
    @Override
    @Transactional
    public void deleteJobApplication(Long applicationId) {
        jobApplicationRepository.deleteById(applicationId);
    }
    
    @Override
    @Transactional
    public void deleteTalentPoolEntry(Long talentId) {
        talentPoolRepository.deleteById(talentId);
    }
    
    @Override
    public HrDto.HrStatsResponse getHrStats() {
        long totalApplications = jobApplicationRepository.count();
        long pendingApplications = jobApplicationRepository.countByStatus(ApplicationStatus.PENDING);
        long underReviewApplications = jobApplicationRepository.countByStatus(ApplicationStatus.UNDER_REVIEW);
        long totalTalentPool = talentPoolRepository.count();
        long activeTalentPool = talentPoolRepository.countByStatus(TalentStatus.ACTIVE);
        
        return HrDto.HrStatsResponse.builder()
                .totalApplications(totalApplications)
                .pendingApplications(pendingApplications)
                .underReviewApplications(underReviewApplications)
                .totalTalentPool(totalTalentPool)
                .activeTalentPool(activeTalentPool)
                .build();
    }
    
    private HrDto.JobApplicationResponse convertToJobApplicationResponse(JobApplication jobApplication) {
        return HrDto.JobApplicationResponse.builder()
                .id(jobApplication.getId())
                .positionTitle(jobApplication.getPositionTitle())
                .department(jobApplication.getDepartment())
                .applicantName(jobApplication.getApplicantName())
                .email(jobApplication.getEmail())
                .phone(jobApplication.getPhone())
                .coverLetter(jobApplication.getCoverLetter())
                .status(jobApplication.getStatus().name())
                .createdAt(jobApplication.getCreatedAt())
                .updatedAt(jobApplication.getUpdatedAt())
                .build();
    }
    
    private HrDto.TalentPoolResponse convertToTalentPoolResponse(TalentPool talentPool) {
        return HrDto.TalentPoolResponse.builder()
                .id(talentPool.getId())
                .name(talentPool.getName())
                .email(talentPool.getEmail())
                .phone(talentPool.getPhone())
                .field(talentPool.getField())
                .experience(talentPool.getExperience())
                .introduction(talentPool.getIntroduction())
                .status(talentPool.getStatus().name())
                .createdAt(talentPool.getCreatedAt())
                .updatedAt(talentPool.getUpdatedAt())
                .build();
    }
}