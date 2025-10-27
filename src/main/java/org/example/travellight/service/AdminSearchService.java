package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.SearchResultDto;
import org.example.travellight.entity.*;
import org.example.travellight.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 관리자 통합 검색 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminSearchService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final PartnershipRepository partnershipRepository;
    private final EventStorageRepository eventStorageRepository;
    private final InquiryRepository inquiryRepository;
    private final ReviewRepository reviewRepository;
    private final FaqRepository faqRepository;

    /**
     * 통합 검색
     *
     * @param query 검색어
     * @param types 검색할 타입 목록 (null이면 전체 검색)
     * @return 검색 결과
     */
    public SearchResultDto.SearchResponse search(String query, List<SearchType> types) {
        log.info("통합 검색 시작 - 검색어: {}, 타입: {}", query, types);

        List<SearchResultDto> results = new ArrayList<>();
        SearchResultDto.TypeCounts.TypeCountsBuilder countsBuilder = SearchResultDto.TypeCounts.builder();

        // 검색어가 비어있으면 빈 결과 반환
        if (query == null || query.trim().isEmpty()) {
            return SearchResultDto.SearchResponse.builder()
                    .totalCount(0)
                    .results(results)
                    .typeCounts(countsBuilder
                            .reservations(0)
                            .users(0)
                            .partnerships(0)
                            .events(0)
                            .inquiries(0)
                            .reviews(0)
                            .faqs(0)
                            .build())
                    .build();
        }

        String searchQuery = query.trim();

        // 타입이 지정되지 않았거나 포함되어 있으면 검색 실행
        if (types == null || types.contains(SearchType.RESERVATION)) {
            List<SearchResultDto> reservationResults = searchReservations(searchQuery);
            results.addAll(reservationResults);
            countsBuilder.reservations(reservationResults.size());
        }

        if (types == null || types.contains(SearchType.USER)) {
            List<SearchResultDto> userResults = searchUsers(searchQuery);
            results.addAll(userResults);
            countsBuilder.users(userResults.size());
        }

        if (types == null || types.contains(SearchType.PARTNERSHIP)) {
            List<SearchResultDto> partnershipResults = searchPartnerships(searchQuery);
            results.addAll(partnershipResults);
            countsBuilder.partnerships(partnershipResults.size());
        }

        if (types == null || types.contains(SearchType.EVENT)) {
            List<SearchResultDto> eventResults = searchEvents(searchQuery);
            results.addAll(eventResults);
            countsBuilder.events(eventResults.size());
        }

        if (types == null || types.contains(SearchType.INQUIRY)) {
            List<SearchResultDto> inquiryResults = searchInquiries(searchQuery);
            results.addAll(inquiryResults);
            countsBuilder.inquiries(inquiryResults.size());
        }

        if (types == null || types.contains(SearchType.REVIEW)) {
            List<SearchResultDto> reviewResults = searchReviews(searchQuery);
            results.addAll(reviewResults);
            countsBuilder.reviews(reviewResults.size());
        }

        if (types == null || types.contains(SearchType.FAQ)) {
            List<SearchResultDto> faqResults = searchFaqs(searchQuery);
            results.addAll(faqResults);
            countsBuilder.faqs(faqResults.size());
        }

        log.info("통합 검색 완료 - 총 결과: {}", results.size());

        return SearchResultDto.SearchResponse.builder()
                .totalCount(results.size())
                .results(results)
                .typeCounts(countsBuilder.build())
                .build();
    }

    /**
     * 예약 검색
     */
    private List<SearchResultDto> searchReservations(String query) {
        try {
            Pageable pageable = PageRequest.of(0, 10);
            List<Reservation> reservations = reservationRepository.searchReservations(query, pageable);
            return reservations.stream()
                    .map(r -> SearchResultDto.builder()
                            .type(SearchType.RESERVATION)
                            .id(r.getId())
                            .title(r.getReservationNumber())
                            .subtitle(r.getPlaceName() + " - " + (r.getUser() != null ? r.getUser().getName() : ""))
                            .status(r.getStatus() != null ? r.getStatus() : "RESERVED")
                            .meta("₩" + (r.getTotalPrice() != null ? r.getTotalPrice().toString() : "0"))
                            .detailUrl("/admin/orders")
                            .build())
                    .toList();
        } catch (Exception e) {
            log.error("예약 검색 중 오류 발생", e);
            return new ArrayList<>();
        }
    }

    /**
     * 사용자 검색
     */
    private List<SearchResultDto> searchUsers(String query) {
        try {
            Pageable pageable = PageRequest.of(0, 10);
            List<User> users = userRepository.searchUsers(query, pageable);
            return users.stream()
                    .map(u -> SearchResultDto.builder()
                            .type(SearchType.USER)
                            .id(u.getId())
                            .title(u.getName())
                            .subtitle(u.getEmail())
                            .status(u.getRole() != null ? u.getRole().toString() : "USER")
                            .meta("")
                            .detailUrl("/admin/users/" + u.getId())
                            .build())
                    .toList();
        } catch (Exception e) {
            log.error("사용자 검색 중 오류 발생", e);
            return new ArrayList<>();
        }
    }

    /**
     * 제휴점 검색
     */
    private List<SearchResultDto> searchPartnerships(String query) {
        try {
            Pageable pageable = PageRequest.of(0, 10);
            List<Partnership> partnerships = partnershipRepository.searchPartnerships(query, pageable);
            return partnerships.stream()
                    .map(p -> SearchResultDto.builder()
                            .type(SearchType.PARTNERSHIP)
                            .id(p.getId())
                            .title(p.getBusinessName())
                            .subtitle(p.getAddress())
                            .status(p.getStatus())
                            .meta(p.getPhone() != null ? p.getPhone() : "")
                            .detailUrl("/admin/partnerships/" + p.getId())
                            .build())
                    .toList();
        } catch (Exception e) {
            log.error("제휴점 검색 중 오류 발생", e);
            return new ArrayList<>();
        }
    }

    /**
     * 이벤트 보관 검색
     */
    private List<SearchResultDto> searchEvents(String query) {
        try {
            Pageable pageable = PageRequest.of(0, 10);
            List<EventStorage> events = eventStorageRepository.searchEvents(query, pageable);
            return events.stream()
                    .map(e -> SearchResultDto.builder()
                            .type(SearchType.EVENT)
                            .id(e.getId())
                            .title(e.getEventName())
                            .subtitle(e.getOrganizerName() + " - " + e.getEventVenue())
                            .status(e.getStatus() != null ? e.getStatus() : "PENDING")
                            .meta(e.getEventDate() != null ? e.getEventDate().toString() : "")
                            .detailUrl("/admin/event-storage")
                            .build())
                    .toList();
        } catch (Exception e) {
            log.error("이벤트 검색 중 오류 발생", e);
            return new ArrayList<>();
        }
    }

    /**
     * 문의 검색
     */
    private List<SearchResultDto> searchInquiries(String query) {
        try {
            Pageable pageable = PageRequest.of(0, 10);
            List<Inquiry> inquiries = inquiryRepository.searchInquiries(query, pageable);
            return inquiries.stream()
                    .map(i -> SearchResultDto.builder()
                            .type(SearchType.INQUIRY)
                            .id(i.getId())
                            .title(i.getSubject())
                            .subtitle(i.getInquiryType().toString() + " - " + (i.getUser() != null ? i.getUser().getName() : ""))
                            .status(i.getStatus() != null ? i.getStatus().toString() : "PENDING")
                            .meta(i.getCreatedAt() != null ? i.getCreatedAt().toString().substring(0, 10) : "")
                            .detailUrl("/admin/inquiries")
                            .build())
                    .toList();
        } catch (Exception e) {
            log.error("문의 검색 중 오류 발생", e);
            return new ArrayList<>();
        }
    }

    /**
     * 리뷰 검색
     */
    private List<SearchResultDto> searchReviews(String query) {
        try {
            Pageable pageable = PageRequest.of(0, 10);
            List<Review> reviews = reviewRepository.searchReviews(query, pageable);
            return reviews.stream()
                    .map(r -> SearchResultDto.builder()
                            .type(SearchType.REVIEW)
                            .id(r.getId())
                            .title(r.getPlaceName())
                            .subtitle((r.getUser() != null ? r.getUser().getName() : "") + " - " + r.getRating() + "점")
                            .status(r.getStatus() != null ? r.getStatus().toString() : "ACTIVE")
                            .meta(r.getContent() != null && r.getContent().length() > 30 ? r.getContent().substring(0, 30) + "..." : (r.getContent() != null ? r.getContent() : ""))
                            .detailUrl("/admin/reviews")
                            .build())
                    .toList();
        } catch (Exception e) {
            log.error("리뷰 검색 중 오류 발생", e);
            return new ArrayList<>();
        }
    }

    /**
     * FAQ 검색
     */
    private List<SearchResultDto> searchFaqs(String query) {
        try {
            Pageable pageable = PageRequest.of(0, 10);
            List<Faq> faqs = faqRepository.searchFaqs(query, pageable);
            return faqs.stream()
                    .map(f -> SearchResultDto.builder()
                            .type(SearchType.FAQ)
                            .id(f.getId())
                            .title(f.getQuestion())
                            .subtitle(f.getCategory().toString())
                            .status(f.getIsActive() ? "ACTIVE" : "INACTIVE")
                            .meta(f.getAnswer() != null && f.getAnswer().length() > 30 ? f.getAnswer().substring(0, 30) + "..." : (f.getAnswer() != null ? f.getAnswer() : ""))
                            .detailUrl("/admin/faqs")
                            .build())
                    .toList();
        } catch (Exception e) {
            log.error("FAQ 검색 중 오류 발생", e);
            return new ArrayList<>();
        }
    }
}
