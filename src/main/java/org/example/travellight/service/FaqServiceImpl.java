package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.FaqDto;
import org.example.travellight.entity.Faq;
import org.example.travellight.entity.FaqCategory;
import org.example.travellight.entity.User;
import org.example.travellight.exception.CustomException;
import org.example.travellight.repository.FaqRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FaqServiceImpl implements FaqService {
    
    private final FaqRepository faqRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<FaqDto.FaqResponse> getAllFaqs() {
        List<Faq> faqs = faqRepository.findByIsActiveTrueOrderBySortOrderAsc();
        return faqs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FaqDto.FaqResponse> getFaqsByCategory(FaqCategory category) {
        if (category == FaqCategory.ALL) {
            return getAllFaqs();
        }
        
        List<Faq> faqs = faqRepository.findByCategoryAndIsActiveTrueOrderBySortOrderAsc(category);
        return faqs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public FaqDto.FaqResponse getFaq(Long faqId) {
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new CustomException("FAQ를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        // 조회수 증가
        faq.incrementViewCount();
        faqRepository.save(faq);
        
        return convertToResponse(faq);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FaqDto.FaqResponse> searchFaqs(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllFaqs();
        }
        
        List<Faq> faqs = faqRepository.searchByKeyword(keyword.trim());
        return faqs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FaqDto.FaqResponse> searchFaqsByCategoryAndKeyword(FaqCategory category, String keyword) {
        if (category == FaqCategory.ALL) {
            return searchFaqs(keyword);
        }
        
        if (keyword == null || keyword.trim().isEmpty()) {
            return getFaqsByCategory(category);
        }
        
        List<Faq> faqs = faqRepository.searchByCategoryAndKeyword(category, keyword.trim());
        return faqs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FaqDto.FaqCategoryInfo> getAllCategories() {
        return Arrays.stream(FaqCategory.values())
                .filter(category -> category != FaqCategory.ALL)
                .map(category -> {
                    Long count = faqRepository.countByCategoryAndIsActiveTrue(category);
                    return FaqDto.FaqCategoryInfo.builder()
                            .code(category.getCode())
                            .name(category.getDisplayName())
                            .count(count)
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FaqDto.FaqResponse> getPopularFaqs(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Faq> faqs = faqRepository.findTopByViewCount(pageable);
        return faqs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public FaqDto.FaqResponse createFaq(FaqDto.FaqRequest request, User admin) {
        log.info("Creating FAQ by admin: {}", admin.getEmail());
        
        Faq faq = Faq.builder()
                .category(request.getCategory())
                .question(request.getQuestion())
                .answer(request.getAnswer())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .createdBy(admin)
                .updatedBy(admin)
                .build();
        
        Faq savedFaq = faqRepository.save(faq);
        log.info("FAQ created successfully with ID: {}", savedFaq.getId());
        
        return convertToResponse(savedFaq);
    }
    
    @Override
    @Transactional
    public FaqDto.FaqResponse updateFaq(Long faqId, FaqDto.FaqUpdateRequest request, User admin) {
        log.info("Updating FAQ ID: {} by admin: {}", faqId, admin.getEmail());
        
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new CustomException("FAQ를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        if (request.getCategory() != null) {
            faq.setCategory(request.getCategory());
        }
        if (request.getQuestion() != null) {
            faq.setQuestion(request.getQuestion());
        }
        if (request.getAnswer() != null) {
            faq.setAnswer(request.getAnswer());
        }
        if (request.getSortOrder() != null) {
            faq.setSortOrder(request.getSortOrder());
        }
        if (request.getIsActive() != null) {
            faq.setIsActive(request.getIsActive());
        }
        
        faq.setUpdatedBy(admin);
        
        Faq updatedFaq = faqRepository.save(faq);
        log.info("FAQ updated successfully: {}", updatedFaq.getId());
        
        return convertToResponse(updatedFaq);
    }
    
    @Override
    @Transactional
    public void deleteFaq(Long faqId, User admin) {
        log.info("Deleting FAQ ID: {} by admin: {}", faqId, admin.getEmail());
        
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new CustomException("FAQ를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        faqRepository.delete(faq);
        log.info("FAQ deleted successfully: {}", faqId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<FaqDto.FaqResponse> getAllFaqsForAdmin(Pageable pageable) {
        Page<Faq> faqPage = faqRepository.findAllByOrderBySortOrderAsc(pageable);
        return faqPage.map(this::convertToResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FaqDto.FaqResponse> getFaqsByCategoryForAdmin(FaqCategory category) {
        List<Faq> faqs = faqRepository.findByCategoryOrderBySortOrderAsc(category);
        return faqs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public FaqDto.FaqResponse toggleFaqActive(Long faqId, User admin) {
        log.info("Toggling FAQ active status ID: {} by admin: {}", faqId, admin.getEmail());
        
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new CustomException("FAQ를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        faq.setIsActive(!faq.getIsActive());
        faq.setUpdatedBy(admin);
        
        Faq updatedFaq = faqRepository.save(faq);
        log.info("FAQ active status toggled: {} -> {}", faqId, updatedFaq.getIsActive());
        
        return convertToResponse(updatedFaq);
    }
    
    @Override
    @Transactional
    public FaqDto.FaqResponse updateFaqOrder(Long faqId, Integer newOrder, User admin) {
        log.info("Updating FAQ order ID: {} to {} by admin: {}", faqId, newOrder, admin.getEmail());
        
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new CustomException("FAQ를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        faq.setSortOrder(newOrder);
        faq.setUpdatedBy(admin);
        
        Faq updatedFaq = faqRepository.save(faq);
        log.info("FAQ order updated successfully: {} -> {}", faqId, newOrder);
        
        return convertToResponse(updatedFaq);
    }
    
    // Private helper methods
    
    private FaqDto.FaqResponse convertToResponse(Faq faq) {
        FaqDto.FaqResponse.FaqResponseBuilder builder = FaqDto.FaqResponse.builder()
                .id(faq.getId())
                .category(faq.getCategory())
                .categoryName(faq.getCategory().getDisplayName())
                .question(faq.getQuestion())
                .answer(faq.getAnswer())
                .sortOrder(faq.getSortOrder())
                .isActive(faq.getIsActive())
                .viewCount(faq.getViewCount())
                .createdAt(faq.getCreatedAt())
                .updatedAt(faq.getUpdatedAt());
        
        if (faq.getCreatedBy() != null) {
            builder.createdBy(FaqDto.UserInfo.builder()
                    .id(faq.getCreatedBy().getId())
                    .name(faq.getCreatedBy().getName())
                    .email(faq.getCreatedBy().getEmail())
                    .build());
        }
        
        if (faq.getUpdatedBy() != null) {
            builder.updatedBy(FaqDto.UserInfo.builder()
                    .id(faq.getUpdatedBy().getId())
                    .name(faq.getUpdatedBy().getName())
                    .email(faq.getUpdatedBy().getEmail())
                    .build());
        }
        
        return builder.build();
    }
}

