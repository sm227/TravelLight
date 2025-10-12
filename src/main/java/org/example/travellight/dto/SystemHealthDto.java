package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemHealthDto {
    private List<ServerServiceStatusDto> services;
    private SystemMetricsDto metrics;
    private String lastUpdated;
    private Long uptimeSeconds; // 서버 업타임 (초)
    private Integer threadCount; // 현재 활성 스레드 수
} 