package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AWSServiceStatusDto {
    private String serviceName;
    private String status; // healthy, degraded, unhealthy
    private Integer responseTime;
    private String lastChecked;
    private String endpoint;
    private String region;
} 