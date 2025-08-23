package org.example.travellight.service;

import org.example.travellight.dto.HrDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface HrService {
    HrDto.JobApplicationResponse submitJobApplication(HrDto.JobApplicationRequest request);
    HrDto.TalentPoolResponse submitTalentPoolApplication(HrDto.TalentPoolRequest request);
    
    Page<HrDto.JobApplicationResponse> getAllJobApplications(Pageable pageable);
    Page<HrDto.TalentPoolResponse> getAllTalentPool(Pageable pageable);
    
    HrDto.JobApplicationResponse updateApplicationStatus(Long applicationId, String status);
    HrDto.TalentPoolResponse updateTalentStatus(Long talentId, String status);
    
    void deleteJobApplication(Long applicationId);
    void deleteTalentPoolEntry(Long talentId);
    
    HrDto.HrStatsResponse getHrStats();
}