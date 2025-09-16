package org.example.travellight.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservationSchedulerService {
    
    private static final Logger logger = LoggerFactory.getLogger(ReservationSchedulerService.class);
    
    @Autowired
    private ReservationService reservationService;
    
    @Autowired
    private PartnershipService partnershipService;
    
    /**
     * 백업용 만료 예약 일괄 정리 스케줄러
     * 매 10분마다 실행되어 혹시 놓친 만료된 예약들을 정리합니다.
     */
    @Scheduled(fixedRate = 600000) // 10분마다 실행 (600,000ms)
    public void processAllExpiredReservations() {
        logger.info("백업용 만료 예약 일괄 정리 스케줄러 시작");
        
        try {
            // 모든 승인된 제휴점 조회
            List<org.example.travellight.entity.Partnership> partnerships = partnershipService.getAllPartnerships()
                .stream()
                .filter(p -> "APPROVED".equals(p.getStatus()))
                .toList();
            
            int processedStores = 0;
            int totalProcessedReservations = 0;
            
            // 각 매장별로 만료된 예약 정리
            for (org.example.travellight.entity.Partnership partnership : partnerships) {
                try {
                    // 매장별 만료 예약 처리 (캐시 메커니즘 포함)
                    reservationService.processExpiredReservationsForStore(
                        partnership.getBusinessName(), 
                        partnership.getAddress()
                    );
                    processedStores++;
                    
                } catch (Exception e) {
                    logger.error("매장별 만료 예약 처리 중 오류: businessName={}, address={}", 
                               partnership.getBusinessName(), partnership.getAddress(), e);
                    // 개별 매장 처리 실패해도 전체 스케줄러는 계속 실행
                }
            }
            
            logger.info("백업용 만료 예약 일괄 정리 완료: 처리된매장수={}/{}", 
                       processedStores, partnerships.size());
            
        } catch (Exception e) {
            logger.error("백업용 만료 예약 일괄 정리 스케줄러 실행 중 오류", e);
        }
    }
    
    /**
     * 일일 통계 및 정리 작업 스케줄러
     * 매일 새벽 3시에 실행되어 전체적인 데이터 정리 및 통계를 수집합니다.
     */
    @Scheduled(cron = "0 0 3 * * *") // 매일 새벽 3시 실행
    public void dailyCleanupAndStats() {
        logger.info("일일 정리 및 통계 수집 스케줄러 시작");
        
        try {
            // 모든 승인된 제휴점에 대해 전체 정리
            List<org.example.travellight.entity.Partnership> partnerships = partnershipService.getAllPartnerships()
                .stream()
                .filter(p -> "APPROVED".equals(p.getStatus()))
                .toList();
            
            int totalStores = partnerships.size();
            int processedStores = 0;
            int totalExpiredReservations = 0;
            
            for (org.example.travellight.entity.Partnership partnership : partnerships) {
                try {
                    // 캐시 우회하여 강제 처리 (일일 정리이므로)
                    reservationService.processExpiredReservationsForStore(
                        partnership.getBusinessName(), 
                        partnership.getAddress()
                    );
                    processedStores++;
                    
                } catch (Exception e) {
                    logger.error("일일 정리 중 매장별 처리 오류: businessName={}, address={}", 
                               partnership.getBusinessName(), partnership.getAddress(), e);
                }
            }
            
            logger.info("일일 정리 및 통계 수집 완료: 전체매장수={}, 처리완료매장수={}", 
                       totalStores, processedStores);
            
        } catch (Exception e) {
            logger.error("일일 정리 및 통계 수집 스케줄러 실행 중 오류", e);
        }
    }
}