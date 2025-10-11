package org.example.travellight.service;

import org.example.travellight.dto.InquiryDto;
import org.example.travellight.entity.InquiryStatus;
import org.example.travellight.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface InquiryService {
    
    // 사용자용 API
    
    /**
     * 문의 생성
     */
    InquiryDto.InquiryResponse createInquiry(InquiryDto.InquiryRequest request, User user);
    
    /**
     * 내 문의 목록 조회
     */
    List<InquiryDto.InquiryResponse> getMyInquiries(User user);
    
    /**
     * 내 문의 상세 조회
     */
    InquiryDto.InquiryResponse getInquiry(Long inquiryId, User user);
    
    /**
     * 내 답변 대기 중인 문의 개수
     */
    Long getMyPendingCount(User user);
    
    // 관리자용 API
    
    /**
     * 모든 문의 조회 (관리자용)
     */
    Page<InquiryDto.InquiryResponse> getAllInquiries(Pageable pageable);
    
    /**
     * 상태별 문의 조회 (관리자용)
     */
    Page<InquiryDto.InquiryResponse> getInquiriesByStatus(InquiryStatus status, Pageable pageable);
    
    /**
     * 관리자 답변 추가
     */
    InquiryDto.InquiryResponse addAdminReply(Long inquiryId, InquiryDto.AdminReplyRequest request, User admin);
    
    /**
     * 문의 상태 변경
     */
    InquiryDto.InquiryResponse updateInquiryStatus(Long inquiryId, InquiryStatus status, User admin);
    
    /**
     * 답변 대기 중인 문의 개수
     */
    Long getPendingCount();
}

