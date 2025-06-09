package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemMetricsDto {
    private CpuMetricsDto cpu;
    private MemoryMetricsDto memory;
    private DiskMetricsDto disk;
    private NetworkMetricsDto network;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CpuMetricsDto {
        private Double usage;
        private Integer cores;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemoryMetricsDto {
        private Double used;
        private Double total;
        private Double usage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiskMetricsDto {
        private Double used;
        private Double total;
        private Double usage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NetworkMetricsDto {
        private Long bytesIn;
        private Long bytesOut;
        private Double throughputIn;
        private Double throughputOut;
    }
} 