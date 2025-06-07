package org.example.travellight.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.SystemHealthDto;
import org.example.travellight.service.SystemHealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/system")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin System", description = "관리자 시스템 모니터링 API")
public class AdminSystemController {

    private final SystemHealthService systemHealthService;

    @GetMapping("/health")
    @Operation(summary = "시스템 헬스체크", description = "AWS 서버 상태 및 시스템 메트릭을 조회합니다")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        try {
            SystemHealthDto healthData = systemHealthService.getSystemHealth();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "시스템 상태 조회 성공",
                "data", healthData
            ));
            
        } catch (Exception e) {
            log.error("시스템 상태 조회 실패", e);
            
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "시스템 상태 조회 실패: " + e.getMessage(),
                "data", null
            ));
        }
    }

    @GetMapping("/health/summary")
    @Operation(summary = "시스템 상태 요약", description = "간단한 시스템 상태 요약 정보를 조회합니다")
    public ResponseEntity<Map<String, Object>> getHealthSummary() {
        try {
            SystemHealthDto healthData = systemHealthService.getSystemHealth();
            
            // 서비스 상태 요약
            long healthyServices = healthData.getServices().stream()
                    .filter(service -> "healthy".equals(service.getStatus()))
                    .count();
            
            long totalServices = healthData.getServices().size();
            
            // 전체 상태 판단
            String overallStatus;
            if (healthyServices == totalServices) {
                overallStatus = "healthy";
            } else if (healthyServices > totalServices / 2) {
                overallStatus = "degraded";
            } else {
                overallStatus = "unhealthy";
            }
            
            Map<String, Object> summary = Map.of(
                "overallStatus", overallStatus,
                "healthyServices", healthyServices,
                "totalServices", totalServices,
                "cpuUsage", healthData.getMetrics() != null ? 
                    healthData.getMetrics().getCpu().getUsage() : 0,
                "memoryUsage", healthData.getMetrics() != null ? 
                    healthData.getMetrics().getMemory().getUsage() : 0,
                "lastUpdated", healthData.getLastUpdated()
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "시스템 상태 요약 조회 성공",
                "data", summary
            ));
            
        } catch (Exception e) {
            log.error("시스템 상태 요약 조회 실패", e);
            
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "시스템 상태 요약 조회 실패: " + e.getMessage(),
                "data", null
            ));
        }
    }

    @PostMapping("/health/refresh")
    @Operation(summary = "시스템 상태 강제 새로고침", description = "캐시를 무시하고 시스템 상태를 강제로 새로고침합니다")
    public ResponseEntity<Map<String, Object>> refreshSystemHealth() {
        try {
            SystemHealthDto healthData = systemHealthService.getSystemHealth();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "시스템 상태 새로고침 완료",
                "data", healthData
            ));
            
        } catch (Exception e) {
            log.error("시스템 상태 새로고침 실패", e);
            
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "시스템 상태 새로고침 실패: " + e.getMessage(),
                "data", null
            ));
        }
    }
} 