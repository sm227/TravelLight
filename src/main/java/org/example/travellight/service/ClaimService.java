package org.example.travellight.service;

import org.example.travellight.dto.ClaimDto;
import org.example.travellight.entity.Claim;
import org.example.travellight.entity.User;
import org.example.travellight.repository.ClaimRepository;
import org.example.travellight.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ClaimService {
    
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;
    
    // 클레임 생성
    public ClaimDto.ClaimResponse createClaim(ClaimDto.ClaimRequest request, User adminUser) {
        log.info("클레임 생성 요청 - 사용자 ID: {}, 담당자: {}", request.getUserId(), request.getAssignee());
        
        // 사용자 조회
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // 클레임 생성
        Claim claim = Claim.builder()
            .user(user)
            .assignee(request.getAssignee())
            .content(request.getContent())
            .createdByAdmin(adminUser)
            .build();
        
        Claim savedClaim = claimRepository.save(claim);
        log.info("클레임 생성 완료 - ID: {}", savedClaim.getId());
        
        return convertToResponse(savedClaim);
    }
    
    // 특정 사용자의 클레임 목록 조회
    @Transactional(readOnly = true)
    public List<ClaimDto.ClaimResponse> getClaimsByUserId(Long userId) {
        log.info("사용자 클레임 목록 조회 - 사용자 ID: {}", userId);
        
        List<Claim> claims = claimRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return claims.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    // 모든 클레임 목록 조회
    @Transactional(readOnly = true)
    public List<ClaimDto.ClaimResponse> getAllClaims() {
        log.info("전체 클레임 목록 조회");
        
        List<Claim> claims = claimRepository.findAll();
        return claims.stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    // 클레임 상세 조회
    @Transactional(readOnly = true)
    public ClaimDto.ClaimResponse getClaimById(Long claimId) {
        log.info("클레임 상세 조회 - ID: {}", claimId);
        
        Claim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new RuntimeException("클레임을 찾을 수 없습니다."));
        
        return convertToResponse(claim);
    }
    
    // 클레임 수정
    public ClaimDto.ClaimResponse updateClaim(Long claimId, ClaimDto.ClaimUpdateRequest request) {
        log.info("클레임 수정 요청 - ID: {}", claimId);
        
        Claim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new RuntimeException("클레임을 찾을 수 없습니다."));
        
        // 필드 업데이트
        if (request.getAssignee() != null) {
            claim.setAssignee(request.getAssignee());
        }
        if (request.getContent() != null) {
            claim.setContent(request.getContent());
        }
        if (request.getStatus() != null) {
            claim.setStatus(request.getStatus());
        }
        if (request.getResolution() != null) {
            claim.setResolution(request.getResolution());
        }
        
        Claim updatedClaim = claimRepository.save(claim);
        log.info("클레임 수정 완료 - ID: {}", updatedClaim.getId());
        
        return convertToResponse(updatedClaim);
    }
    
    // 클레임 삭제
    public void deleteClaim(Long claimId) {
        log.info("클레임 삭제 요청 - ID: {}", claimId);
        
        if (!claimRepository.existsById(claimId)) {
            throw new RuntimeException("클레임을 찾을 수 없습니다.");
        }
        
        claimRepository.deleteById(claimId);
        log.info("클레임 삭제 완료 - ID: {}", claimId);
    }
    
    // 클레임 해결 처리
    public ClaimDto.ClaimResponse resolveClaim(Long claimId, String resolution) {
        log.info("클레임 해결 처리 - ID: {}, 해결 내용: {}", claimId, resolution);
        
        Claim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new RuntimeException("클레임을 찾을 수 없습니다."));
        
        claim.resolve(resolution);
        Claim resolvedClaim = claimRepository.save(claim);
        
        log.info("클레임 해결 완료 - ID: {}", resolvedClaim.getId());
        return convertToResponse(resolvedClaim);
    }
    
    // Entity를 Response DTO로 변환
    private ClaimDto.ClaimResponse convertToResponse(Claim claim) {
        return ClaimDto.ClaimResponse.builder()
            .id(claim.getId())
            .userId(claim.getUser().getId())
            .userName(claim.getUser().getName())
            .userEmail(claim.getUser().getEmail())
            .assignee(claim.getAssignee())
            .content(claim.getContent())
            .status(claim.getStatus())
            .createdByAdminName(claim.getCreatedByAdmin() != null ? claim.getCreatedByAdmin().getName() : null)
            .createdAt(claim.getCreatedAt())
            .updatedAt(claim.getUpdatedAt())
            .resolvedAt(claim.getResolvedAt())
            .resolution(claim.getResolution())
            .build();
    }
}
