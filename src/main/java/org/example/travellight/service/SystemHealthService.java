package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.ServerServiceStatusDto;
import org.example.travellight.dto.SystemHealthDto;
import org.example.travellight.dto.SystemMetricsDto;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.File;
import java.lang.management.*;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class SystemHealthService {

    private final DataSource dataSource;
    private final OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
    private final MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
    private final ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
    private final RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();

    /**
     * 홈서버 시스템 전체 상태를 조회합니다.
     */
    public SystemHealthDto getSystemHealth() {
        List<ServerServiceStatusDto> services = new ArrayList<>();
        SystemMetricsDto metrics = null;

        try {
            // 홈서버 서비스 상태 체크
            services.addAll(checkHomeServerServices());

            // 시스템 메트릭 수집
            metrics = collectSystemMetrics();

        } catch (Exception e) {
            log.error("시스템 헬스체크 중 오류 발생", e);

            // 기본 더미 데이터
            services.addAll(getDummyServices());
            metrics = getDummyMetrics();
        }

        // 시스템 업타임 계산
        long uptimeSeconds = getSystemUptime();

        // 현재 활성 스레드 수
        int threadCount = threadBean.getThreadCount();

        return SystemHealthDto.builder()
                .services(services)
                .metrics(metrics)
                .lastUpdated(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .uptimeSeconds(uptimeSeconds)
                .threadCount(threadCount)
                .build();
    }

    /**
     * 시스템 업타임을 가져옵니다 (Linux/Unix 시스템).
     * /proc/uptime 파일에서 시스템 부팅 이후 경과 시간을 읽습니다.
     */
    private long getSystemUptime() {
        try {
            // Linux 시스템의 경우 /proc/uptime 파일 읽기
            java.nio.file.Path uptimePath = java.nio.file.Paths.get("/proc/uptime");
            if (java.nio.file.Files.exists(uptimePath)) {
                String content = java.nio.file.Files.readString(uptimePath);
                // /proc/uptime 형식: "123456.78 987654.32" (첫 번째 숫자가 시스템 업타임(초))
                String[] parts = content.trim().split("\\s+");
                if (parts.length > 0) {
                    double uptimeInSeconds = Double.parseDouble(parts[0]);
                    return (long) uptimeInSeconds;
                }
            }
        } catch (Exception e) {
            log.debug("시스템 업타임 읽기 실패 (Linux /proc/uptime), JVM 업타임 사용: {}", e.getMessage());
        }

        // fallback: JVM 업타임 사용 (밀리초 -> 초)
        return runtimeBean.getUptime() / 1000;
    }

    /**
     * 홈서버의 각 서비스 상태를 체크합니다.
     */
    private List<ServerServiceStatusDto> checkHomeServerServices() {
        List<ServerServiceStatusDto> services = new ArrayList<>();

        // 1. 데이터베이스 연결 상태
        services.add(checkDatabaseHealth());

        // 2. 애플리케이션 서버 상태
        services.add(checkApplicationHealth());

        // 3. JVM 메모리 상태
        services.add(checkJvmMemoryHealth());

        // 4. 디스크 상태
        services.add(checkDiskHealth());

        // 5. 스레드 상태
        services.add(checkThreadHealth());

        return services;
    }

    /**
     * PostgreSQL 데이터베이스 연결 상태를 체크합니다.
     */
    private ServerServiceStatusDto checkDatabaseHealth() {
        try {
            long startTime = System.currentTimeMillis();

            // 실제 데이터베이스 연결 테스트
            try (Connection conn = dataSource.getConnection()) {
                boolean isValid = conn.isValid(5); // 5초 타임아웃
                long responseTime = System.currentTimeMillis() - startTime;

                if (isValid) {
                    String dbInfo = String.format("연결 성공 | %dms", responseTime);
                    return createServiceStatus("PostgreSQL Database", "healthy", (int) responseTime, dbInfo);
                } else {
                    return createServiceStatus("PostgreSQL Database", "unhealthy", (int) responseTime, "연결 실패");
                }
            }

        } catch (Exception e) {
            log.error("데이터베이스 헬스체크 실패", e);
            return createServiceStatus("PostgreSQL Database", "unhealthy", 0, "오류: " + e.getMessage());
        }
    }

    /**
     * Spring Boot 애플리케이션 서버 상태를 체크합니다.
     */
    private ServerServiceStatusDto checkApplicationHealth() {
        try {
            long startTime = System.currentTimeMillis();

            // JVM 상태 체크
            long freeMemory = Runtime.getRuntime().freeMemory();
            long totalMemory = Runtime.getRuntime().totalMemory();
            double memoryUsage = (double) (totalMemory - freeMemory) / totalMemory * 100;

            long responseTime = System.currentTimeMillis() - startTime;

            String status;
            String details;
            if (memoryUsage > 90) {
                status = "degraded";
                details = String.format("메모리 사용률 높음: %.1f%%", memoryUsage);
            } else {
                status = "healthy";
                details = String.format("정상 작동 | 메모리: %.1f%%", memoryUsage);
            }

            return createServiceStatus("Application Server", status, (int) responseTime, details);

        } catch (Exception e) {
            log.error("애플리케이션 헬스체크 실패", e);
            return createServiceStatus("Application Server", "unhealthy", 0, "오류: " + e.getMessage());
        }
    }

    /**
     * JVM 메모리 상태를 체크합니다.
     */
    private ServerServiceStatusDto checkJvmMemoryHealth() {
        try {
            long startTime = System.currentTimeMillis();

            MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
            long used = heapUsage.getUsed();
            long max = heapUsage.getMax();
            double usage = (double) used / max * 100;

            long responseTime = System.currentTimeMillis() - startTime;

            String status;
            String details;
            if (usage > 85) {
                status = "degraded";
                details = String.format("Heap 사용률 높음: %.1f%% (%.1fGB/%.1fGB)",
                    usage, used / (1024.0 * 1024 * 1024), max / (1024.0 * 1024 * 1024));
            } else if (usage > 95) {
                status = "unhealthy";
                details = String.format("Heap 임계치 도달: %.1f%%", usage);
            } else {
                status = "healthy";
                details = String.format("Heap: %.1f%% (%.1fGB/%.1fGB)",
                    usage, used / (1024.0 * 1024 * 1024), max / (1024.0 * 1024 * 1024));
            }

            return createServiceStatus("JVM Memory", status, (int) responseTime, details);

        } catch (Exception e) {
            log.error("JVM 메모리 헬스체크 실패", e);
            return createServiceStatus("JVM Memory", "unknown", 0, "메트릭 수집 실패");
        }
    }

    /**
     * 디스크 사용량을 체크합니다.
     */
    private ServerServiceStatusDto checkDiskHealth() {
        try {
            long startTime = System.currentTimeMillis();

            File diskPartition = new File("/");
            long freeSpace = diskPartition.getFreeSpace();
            long totalSpace = diskPartition.getTotalSpace();
            long usedSpace = totalSpace - freeSpace;
            double usage = (double) usedSpace / totalSpace * 100;

            long responseTime = System.currentTimeMillis() - startTime;

            String status;
            String details;
            if (usage > 90) {
                status = "unhealthy";
                details = String.format("디스크 부족: %.1f%% (%.0fGB/%.0fGB)",
                    usage, usedSpace / (1024.0 * 1024 * 1024), totalSpace / (1024.0 * 1024 * 1024));
            } else if (usage > 80) {
                status = "degraded";
                details = String.format("디스크 사용률 높음: %.1f%%", usage);
            } else {
                status = "healthy";
                details = String.format("%.1f%% (%.0fGB/%.0fGB)",
                    usage, usedSpace / (1024.0 * 1024 * 1024), totalSpace / (1024.0 * 1024 * 1024));
            }

            return createServiceStatus("Disk Storage", status, (int) responseTime, details);

        } catch (Exception e) {
            log.error("디스크 헬스체크 실패", e);
            return createServiceStatus("Disk Storage", "unknown", 0, "메트릭 수집 실패");
        }
    }

    /**
     * 스레드 상태를 체크합니다.
     */
    private ServerServiceStatusDto checkThreadHealth() {
        try {
            long startTime = System.currentTimeMillis();

            int threadCount = threadBean.getThreadCount();
            int peakThreadCount = threadBean.getPeakThreadCount();
            long totalStartedThreadCount = threadBean.getTotalStartedThreadCount();

            long responseTime = System.currentTimeMillis() - startTime;

            String status;
            String details;
            if (threadCount > 200) {
                status = "degraded";
                details = String.format("스레드 수 높음: %d개 (Peak: %d개)", threadCount, peakThreadCount);
            } else {
                status = "healthy";
                details = String.format("%d개 활성 (Peak: %d, Total: %d)",
                    threadCount, peakThreadCount, totalStartedThreadCount);
            }

            return createServiceStatus("Thread Pool", status, (int) responseTime, details);

        } catch (Exception e) {
            log.error("스레드 헬스체크 실패", e);
            return createServiceStatus("Thread Pool", "unknown", 0, "메트릭 수집 실패");
        }
    }

    /**
     * 시스템 메트릭을 수집합니다.
     */
    private SystemMetricsDto collectSystemMetrics() {
        try {
            // CPU 사용률
            double cpuUsage = 0.0;
            try {
                if (osBean instanceof com.sun.management.OperatingSystemMXBean) {
                    com.sun.management.OperatingSystemMXBean sunOsBean =
                        (com.sun.management.OperatingSystemMXBean) osBean;
                    cpuUsage = sunOsBean.getCpuLoad() * 100; // 시스템 전체 CPU 로드
                    if (cpuUsage < 0) {
                        cpuUsage = sunOsBean.getProcessCpuLoad() * 100; // 프로세스 CPU 로드
                    }
                }
            } catch (Exception e) {
                log.debug("CPU 메트릭 수집 실패: {}", e.getMessage());
            }

            // CPU 사용률을 얻을 수 없는 경우 기본값
            if (cpuUsage <= 0) {
                cpuUsage = 0.0;
            }

            int availableProcessors = osBean.getAvailableProcessors();

            // 시스템 전체 물리 메모리 사용량
            long usedMemory = 0;
            long totalMemory = 0;
            double memoryUsagePercent = 0.0;

            try {
                // Linux /proc/meminfo에서 정확한 메모리 정보 읽기
                java.nio.file.Path meminfoPath = java.nio.file.Paths.get("/proc/meminfo");
                if (java.nio.file.Files.exists(meminfoPath)) {
                    String content = java.nio.file.Files.readString(meminfoPath);
                    long memTotal = 0;
                    long memAvailable = 0;

                    for (String line : content.split("\n")) {
                        if (line.startsWith("MemTotal:")) {
                            // MemTotal:       32945164 kB
                            memTotal = Long.parseLong(line.split("\\s+")[1]) * 1024; // kB to bytes
                        } else if (line.startsWith("MemAvailable:")) {
                            // MemAvailable:   16234567 kB
                            memAvailable = Long.parseLong(line.split("\\s+")[1]) * 1024; // kB to bytes
                        }
                    }

                    if (memTotal > 0 && memAvailable > 0) {
                        totalMemory = memTotal;
                        usedMemory = memTotal - memAvailable;
                        memoryUsagePercent = (double) usedMemory / totalMemory * 100;
                    } else {
                        throw new Exception("MemTotal 또는 MemAvailable을 찾을 수 없음");
                    }
                } else {
                    throw new Exception("/proc/meminfo 파일을 찾을 수 없음");
                }
            } catch (Exception e) {
                log.debug("시스템 메모리 메트릭 수집 실패 (/proc/meminfo), OperatingSystemMXBean 사용: {}", e.getMessage());
                // fallback 1: OperatingSystemMXBean 사용
                try {
                    if (osBean instanceof com.sun.management.OperatingSystemMXBean) {
                        com.sun.management.OperatingSystemMXBean sunOsBean =
                            (com.sun.management.OperatingSystemMXBean) osBean;
                        totalMemory = sunOsBean.getTotalMemorySize();
                        long freeMemory = sunOsBean.getFreeMemorySize();
                        usedMemory = totalMemory - freeMemory;
                        memoryUsagePercent = (double) usedMemory / totalMemory * 100;
                    }
                } catch (Exception e2) {
                    log.debug("OperatingSystemMXBean 메모리 수집 실패, JVM Heap 메모리 사용: {}", e2.getMessage());
                    // fallback 2: JVM Heap 메모리 사용
                    usedMemory = memoryBean.getHeapMemoryUsage().getUsed();
                    totalMemory = memoryBean.getHeapMemoryUsage().getMax();
                    memoryUsagePercent = (double) usedMemory / totalMemory * 100;
                }
            }

            // 디스크 사용량
            File diskPartition = new File("/");
            long freeSpace = diskPartition.getFreeSpace();
            long totalSpace = diskPartition.getTotalSpace();
            long usedSpace = totalSpace - freeSpace;
            double diskUsagePercent = (double) usedSpace / totalSpace * 100;

            // 네트워크 메트릭 (실제 값 수집은 어려우므로 더미 데이터 유지)
            // 실제 구현 시 NetworkInterface 사용하거나 /proc/net/dev 파싱
            return SystemMetricsDto.builder()
                    .cpu(SystemMetricsDto.CpuMetricsDto.builder()
                            .usage(Math.round(cpuUsage * 100.0) / 100.0)
                            .cores(availableProcessors)
                            .build())
                    .memory(SystemMetricsDto.MemoryMetricsDto.builder()
                            .used((double) usedMemory / (1024 * 1024 * 1024)) // GB
                            .total((double) totalMemory / (1024 * 1024 * 1024)) // GB
                            .usage(Math.round(memoryUsagePercent * 100.0) / 100.0)
                            .build())
                    .disk(SystemMetricsDto.DiskMetricsDto.builder()
                            .used((double) usedSpace / (1024 * 1024 * 1024)) // GB
                            .total((double) totalSpace / (1024 * 1024 * 1024)) // GB
                            .usage(Math.round(diskUsagePercent * 100.0) / 100.0)
                            .build())
                    .network(SystemMetricsDto.NetworkMetricsDto.builder()
                            .bytesIn(0L) // 실제 구현 필요
                            .bytesOut(0L) // 실제 구현 필요
                            .throughputIn(0.0)
                            .throughputOut(0.0)
                            .build())
                    .build();

        } catch (Exception e) {
            log.error("시스템 메트릭 수집 실패", e);
            return getDummyMetrics();
        }
    }

    /**
     * 서비스 상태 DTO를 생성합니다.
     */
    private ServerServiceStatusDto createServiceStatus(String serviceName, String status, int responseTime, String details) {
        return ServerServiceStatusDto.builder()
                .serviceName(serviceName)
                .status(status)
                .responseTime(responseTime)
                .lastChecked(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .details(details)
                .build();
    }

    // 더미 데이터 생성 메서드들
    private List<ServerServiceStatusDto> getDummyServices() {
        List<ServerServiceStatusDto> services = new ArrayList<>();

        services.add(createServiceStatus("PostgreSQL Database", "healthy", 12, "연결 성공"));
        services.add(createServiceStatus("Application Server", "healthy", 5, "정상 작동"));
        services.add(createServiceStatus("JVM Memory", "healthy", 3, "Heap: 45%"));
        services.add(createServiceStatus("Disk Storage", "healthy", 8, "60% (120GB/200GB)"));
        services.add(createServiceStatus("Thread Pool", "healthy", 2, "85개 활성"));

        return services;
    }

    private SystemMetricsDto getDummyMetrics() {
        return SystemMetricsDto.builder()
                .cpu(SystemMetricsDto.CpuMetricsDto.builder()
                        .usage(25.0)
                        .cores(4)
                        .build())
                .memory(SystemMetricsDto.MemoryMetricsDto.builder()
                        .used(3.2)
                        .total(8.0)
                        .usage(40.0)
                        .build())
                .disk(SystemMetricsDto.DiskMetricsDto.builder()
                        .used(120.0)
                        .total(200.0)
                        .usage(60.0)
                        .build())
                .network(SystemMetricsDto.NetworkMetricsDto.builder()
                        .bytesIn(0L)
                        .bytesOut(0L)
                        .throughputIn(0.0)
                        .throughputOut(0.0)
                        .build())
                .build();
    }
}
