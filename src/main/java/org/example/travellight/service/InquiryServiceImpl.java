package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.InquiryDto;
import org.example.travellight.entity.Inquiry;
import org.example.travellight.entity.InquiryStatus;
import org.example.travellight.entity.User;
import org.example.travellight.exception.CustomException;
import org.example.travellight.repository.InquiryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InquiryServiceImpl implements InquiryService {
    
    private final InquiryRepository inquiryRepository;
    
    @Override
    @Transactional
    public InquiryDto.InquiryResponse createInquiry(InquiryDto.InquiryRequest request, User user) {
        log.info("Creating inquiry by user: {}", user.getEmail());
        
        Inquiry inquiry = Inquiry.builder()
                .user(user)
                .inquiryType(request.getInquiryType())
                .subject(request.getSubject())
                .content(request.getContent())
                .email(request.getEmail())
                .phone(request.getPhone())
                .status(InquiryStatus.PENDING)
                .build();
        
        Inquiry savedInquiry = inquiryRepository.save(inquiry);
        log.info("Inquiry created successfully with ID: {}", savedInquiry.getId());
        
        return convertToResponse(savedInquiry);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<InquiryDto.InquiryResponse> getMyInquiries(User user) {
        List<Inquiry> inquiries = inquiryRepository.findByUserOrderByCreatedAtDesc(user);
        return inquiries.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public InquiryDto.InquiryResponse getInquiry(Long inquiryId, User user) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new CustomException("문의를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        // 본인의 문의인지 확인
        if (!inquiry.getUser().getId().equals(user.getId())) {
            throw new CustomException("본인의 문의만 조회할 수 있습니다.", HttpStatus.FORBIDDEN);
        }
        
        return convertToResponse(inquiry);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long getMyPendingCount(User user) {
        return inquiryRepository.countByUserAndStatus(user, InquiryStatus.PENDING);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<InquiryDto.InquiryResponse> getAllInquiries(Pageable pageable) {
        Page<Inquiry> inquiries = inquiryRepository.findAllByOrderByCreatedAtDesc(pageable);
        return inquiries.map(this::convertToResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<InquiryDto.InquiryResponse> getInquiriesByStatus(InquiryStatus status, Pageable pageable) {
        Page<Inquiry> inquiries = inquiryRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        return inquiries.map(this::convertToResponse);
    }
    
    @Override
    @Transactional
    public InquiryDto.InquiryResponse addAdminReply(Long inquiryId, InquiryDto.AdminReplyRequest request, User admin) {
        log.info("Adding admin reply to inquiry ID: {} by admin: {}", inquiryId, admin.getEmail());
        
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new CustomException("문의를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        inquiry.addReply(request.getAdminReply(), admin);
        
        Inquiry updatedInquiry = inquiryRepository.save(inquiry);
        log.info("Admin reply added successfully to inquiry ID: {}", inquiryId);
        
        return convertToResponse(updatedInquiry);
    }
    
    @Override
    @Transactional
    public InquiryDto.InquiryResponse updateInquiryStatus(Long inquiryId, InquiryStatus status, User admin) {
        log.info("Updating inquiry status ID: {} to {} by admin: {}", inquiryId, status, admin.getEmail());
        
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new CustomException("문의를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        inquiry.setStatus(status);
        
        Inquiry updatedInquiry = inquiryRepository.save(inquiry);
        log.info("Inquiry status updated successfully: {}", inquiryId);
        
        return convertToResponse(updatedInquiry);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long getPendingCount() {
        return inquiryRepository.countByStatus(InquiryStatus.PENDING);
    }
    
    // Private helper methods
    
    private InquiryDto.InquiryResponse convertToResponse(Inquiry inquiry) {
        InquiryDto.InquiryResponse.InquiryResponseBuilder builder = InquiryDto.InquiryResponse.builder()
                .id(inquiry.getId())
                .inquiryType(inquiry.getInquiryType())
                .inquiryTypeName(inquiry.getInquiryType().getDisplayName())
                .subject(inquiry.getSubject())
                .content(inquiry.getContent())
                .email(inquiry.getEmail())
                .phone(inquiry.getPhone())
                .status(inquiry.getStatus())
                .statusName(inquiry.getStatus().getDisplayName())
                .adminReply(inquiry.getAdminReply())
                .repliedAt(inquiry.getRepliedAt())
                .createdAt(inquiry.getCreatedAt())
                .updatedAt(inquiry.getUpdatedAt());
        
        if (inquiry.getUser() != null) {
            builder.user(InquiryDto.UserInfo.builder()
                    .id(inquiry.getUser().getId())
                    .name(inquiry.getUser().getName())
                    .email(inquiry.getUser().getEmail())
                    .build());
        }
        
        if (inquiry.getAdminUser() != null) {
            builder.adminUser(InquiryDto.UserInfo.builder()
                    .id(inquiry.getAdminUser().getId())
                    .name(inquiry.getAdminUser().getName())
                    .email(inquiry.getAdminUser().getEmail())
                    .build());
        }
        
        return builder.build();
    }
}

