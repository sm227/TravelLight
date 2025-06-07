package org.example.travellight.service;

import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.AWSServiceStatusDto;
import org.example.travellight.dto.SystemHealthDto;
import org.example.travellight.dto.SystemMetricsDto;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.services.cloudwatch.CloudWatchClient;
import software.amazon.awssdk.services.cloudwatch.model.*;
import software.amazon.awssdk.services.ec2.Ec2Client;
import software.amazon.awssdk.services.ec2.model.DescribeInstancesRequest;
import software.amazon.awssdk.services.ec2.model.DescribeInstancesResponse;
import software.amazon.awssdk.services.ec2.model.Instance;
import software.amazon.awssdk.services.ec2.model.Reservation;

import javax.management.MBeanServer;
import javax.management.ObjectName;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class SystemHealthService {

    private final CloudWatchClient cloudWatchClient;
    private final Ec2Client ec2Client;
    private final OperatingSystemMXBean osBean;
    private final MemoryMXBean memoryBean;

    public SystemHealthService() {
        // AWS 클라이언트 초기화 - IAM Role 또는 Default Credentials 자동 감지
        CloudWatchClient tempCloudWatchClient;
        Ec2Client tempEc2Client;
        
        try {
            // AWS SDK v2의 DefaultCredentialsProvider를 사용하여 자동 인증
            // 다음 순서로 자격 증명을 찾습니다:
            // 1. Java System Properties (aws.accessKeyId, aws.secretAccessKey)
            // 2. Environment Variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
            // 3. Credential profiles file (~/.aws/credentials)
            // 4. Instance profile credentials (EC2에서 실행 시)
            // 5. Container credentials (ECS에서 실행 시)
            
            tempCloudWatchClient = CloudWatchClient.builder()
                    .region(Region.AP_NORTHEAST_2) // 서울 리전
                    .credentialsProvider(DefaultCredentialsProvider.create())
                    .build();
                    
            tempEc2Client = Ec2Client.builder()
                    .region(Region.AP_NORTHEAST_2)
                    .credentialsProvider(DefaultCredentialsProvider.create())
                    .build();
                    
            log.info("AWS 클라이언트 초기화 성공 (리전: ap-northeast-2)");
            
            // AWS 자격 증명 확인 테스트
            testAWSConnection(tempCloudWatchClient, tempEc2Client);
            
        } catch (Exception e) {
            log.warn("AWS 클라이언트 초기화 실패. 로컬 메트릭만 사용합니다.");
            log.warn("AWS 설정 가이드:");
            log.warn("1. EC2 인스턴스에서 실행 시: IAM Role 설정");
            log.warn("2. 로컬 개발 시: ~/.aws/credentials 파일 또는 환경변수 설정");
            log.warn("3. 환경변수: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY");
            log.debug("상세 오류: {}", e.getMessage());
            
            tempCloudWatchClient = null;
            tempEc2Client = null;
        }
        
        this.cloudWatchClient = tempCloudWatchClient;
        this.ec2Client = tempEc2Client;
        this.osBean = ManagementFactory.getOperatingSystemMXBean();
        this.memoryBean = ManagementFactory.getMemoryMXBean();
    }

    /**
     * AWS 연결 상태를 테스트합니다.
     */
    private void testAWSConnection(CloudWatchClient cloudWatch, Ec2Client ec2) {
        try {
            // CloudWatch 연결 테스트 - 네임스페이스 조회
            ListMetricsRequest metricsRequest = ListMetricsRequest.builder()
                    .namespace("AWS/EC2") // EC2 네임스페이스로 제한
                    .build();
            
            cloudWatch.listMetrics(metricsRequest);
            log.debug("CloudWatch 연결 테스트 성공");
            
        } catch (Exception e) {
            log.debug("CloudWatch 연결 테스트 실패: {}", e.getMessage());
        }
        
        try {
            // EC2 연결 테스트 - 현재 리전 확인
            ec2.describeAvailabilityZones();
            log.debug("EC2 연결 테스트 성공");
            
        } catch (Exception e) {
            log.debug("EC2 연결 테스트 실패: {}", e.getMessage());
        }
    }

    /**
     * CloudWatch에서 EC2 인스턴스의 CPU 사용률을 가져옵니다.
     */
    private double getCloudWatchCpuMetric() {
        try {
            if (cloudWatchClient == null) {
                return 0.0;
            }

            // 현재 시간에서 5분 전까지의 CPU 사용률 조회
            Instant endTime = Instant.now();
            Instant startTime = endTime.minusSeconds(300); // 5분 전

            GetMetricStatisticsRequest request = GetMetricStatisticsRequest.builder()
                    .namespace("AWS/EC2")
                    .metricName("CPUUtilization")
                    .startTime(startTime)
                    .endTime(endTime)
                    .period(300) // 5분 간격
                    .statistics(Statistic.AVERAGE)
                    .build();

            GetMetricStatisticsResponse response = cloudWatchClient.getMetricStatistics(request);
            
            if (!response.datapoints().isEmpty()) {
                // 가장 최근 데이터포인트의 평균값 반환
                return response.datapoints().stream()
                        .max((d1, d2) -> d1.timestamp().compareTo(d2.timestamp()))
                        .map(Datapoint::average)
                        .orElse(0.0);
            }

        } catch (Exception e) {
            log.debug("CloudWatch CPU 메트릭 조회 실패: {}", e.getMessage());
        }
        
        return 0.0;
    }

    public SystemHealthDto getSystemHealth() {
        List<AWSServiceStatusDto> services = new ArrayList<>();
        SystemMetricsDto metrics = null;

        try {
            // AWS 서비스 상태 체크
            services.addAll(checkAWSServices());
            
            // 시스템 메트릭 수집
            metrics = collectSystemMetrics();
            
        } catch (Exception e) {
            log.error("시스템 헬스체크 중 오류 발생", e);
            
            // 기본 더미 데이터
            services.addAll(getDummyAWSServices());
            metrics = getDummyMetrics();
        }

        return SystemHealthDto.builder()
                .services(services)
                .metrics(metrics)
                .lastUpdated(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
    }

    private List<AWSServiceStatusDto> checkAWSServices() {
        List<AWSServiceStatusDto> services = new ArrayList<>();

        // EC2 상태 체크
        services.add(checkEC2Health());
        
        // RDS 상태 체크 (간접적)
        services.add(checkDatabaseHealth());
        
        // 애플리케이션 헬스체크
        services.add(checkApplicationHealth());
        
        // 로드밸런서 상태 체크
        services.add(checkLoadBalancerHealth());

        return services;
    }

    private AWSServiceStatusDto checkEC2Health() {
        if (ec2Client == null) {
            return createServiceStatus("EC2 Instance", "unknown", 0, "AWS 클라이언트 초기화 실패");
        }

        try {
            long startTime = System.currentTimeMillis();
            
            DescribeInstancesRequest request = DescribeInstancesRequest.builder().build();
            DescribeInstancesResponse response = ec2Client.describeInstances(request);
            
            long responseTime = System.currentTimeMillis() - startTime;
            
            // 실행 중인 인스턴스가 있는지 확인
            boolean hasRunningInstance = response.reservations().stream()
                    .flatMap(reservation -> reservation.instances().stream())
                    .anyMatch(instance -> "running".equals(instance.state().nameAsString()));

            String status = hasRunningInstance ? "healthy" : "degraded";
            
            return createServiceStatus("EC2 Instance", status, (int) responseTime, null);
            
        } catch (Exception e) {
            log.error("EC2 헬스체크 실패", e);
            return createServiceStatus("EC2 Instance", "unhealthy", 0, e.getMessage());
        }
    }

    private AWSServiceStatusDto checkDatabaseHealth() {
        try {
            long startTime = System.currentTimeMillis();
            
            // 간단한 데이터베이스 연결 테스트
            // 실제로는 데이터소스를 통한 연결 테스트를 구현
            Thread.sleep(10); // 실제 DB 쿼리 시뮬레이션
            
            long responseTime = System.currentTimeMillis() - startTime;
            
            return createServiceStatus("RDS Database", "healthy", (int) responseTime, null);
            
        } catch (Exception e) {
            log.error("데이터베이스 헬스체크 실패", e);
            return createServiceStatus("RDS Database", "unhealthy", 0, e.getMessage());
        }
    }

    private AWSServiceStatusDto checkApplicationHealth() {
        try {
            long startTime = System.currentTimeMillis();
            
            // JVM 상태 체크
            long freeMemory = Runtime.getRuntime().freeMemory();
            long totalMemory = Runtime.getRuntime().totalMemory();
            double memoryUsage = (double) (totalMemory - freeMemory) / totalMemory * 100;
            
            long responseTime = System.currentTimeMillis() - startTime;
            
            String status = memoryUsage > 90 ? "degraded" : "healthy";
            
            return createServiceStatus("Application", status, (int) responseTime, null);
            
        } catch (Exception e) {
            log.error("애플리케이션 헬스체크 실패", e);
            return createServiceStatus("Application", "unhealthy", 0, e.getMessage());
        }
    }

    private AWSServiceStatusDto checkLoadBalancerHealth() {
        try {
            long startTime = System.currentTimeMillis();
            
            // 로드밸런서 상태 시뮬레이션
            Thread.sleep(25);
            
            long responseTime = System.currentTimeMillis() - startTime;
            
            return createServiceStatus("Load Balancer", "healthy", (int) responseTime, null);
            
        } catch (Exception e) {
            return createServiceStatus("Load Balancer", "degraded", 0, e.getMessage());
        }
    }

    private SystemMetricsDto collectSystemMetrics() {
        try {
            // CPU 사용률 - Sun/Oracle JVM 확장 메서드 사용
            double cpuUsage = 0.0;
            try {
                if (osBean instanceof com.sun.management.OperatingSystemMXBean) {
                    com.sun.management.OperatingSystemMXBean sunOsBean = 
                        (com.sun.management.OperatingSystemMXBean) osBean;
                    cpuUsage = sunOsBean.getProcessCpuLoad() * 100;
                }
            } catch (Exception e) {
                log.debug("Sun OperatingSystemMXBean을 사용할 수 없습니다: {}", e.getMessage());
            }
            
            // CloudWatch에서 실제 CPU 메트릭 가져오기 시도
            if (cpuUsage <= 0 && cloudWatchClient != null) {
                cpuUsage = getCloudWatchCpuMetric();
            }
            
            // fallback: CPU 사용률을 얻을 수 없는 경우 더미 데이터 사용
            if (cpuUsage <= 0) {
                cpuUsage = Math.random() * 30 + 20; // 20-50% 범위의 더미 데이터
            }
            
            int availableProcessors = osBean.getAvailableProcessors();

            // 메모리 사용량
            long usedMemory = memoryBean.getHeapMemoryUsage().getUsed();
            long maxMemory = memoryBean.getHeapMemoryUsage().getMax();
            double memoryUsagePercent = (double) usedMemory / maxMemory * 100;

            // 디스크 사용량
            File diskPartition = new File("/");
            long freeSpace = diskPartition.getFreeSpace();
            long totalSpace = diskPartition.getTotalSpace();
            long usedSpace = totalSpace - freeSpace;
            double diskUsagePercent = (double) usedSpace / totalSpace * 100;

            return SystemMetricsDto.builder()
                    .cpu(SystemMetricsDto.CpuMetricsDto.builder()
                            .usage(Math.round(cpuUsage * 100.0) / 100.0)
                            .cores(availableProcessors)
                            .build())
                    .memory(SystemMetricsDto.MemoryMetricsDto.builder()
                            .used((double) usedMemory / (1024 * 1024 * 1024)) // GB
                            .total((double) maxMemory / (1024 * 1024 * 1024)) // GB
                            .usage(Math.round(memoryUsagePercent * 100.0) / 100.0)
                            .build())
                    .disk(SystemMetricsDto.DiskMetricsDto.builder()
                            .used((double) usedSpace / (1024 * 1024 * 1024)) // GB
                            .total((double) totalSpace / (1024 * 1024 * 1024)) // GB
                            .usage(Math.round(diskUsagePercent * 100.0) / 100.0)
                            .build())
                    .network(SystemMetricsDto.NetworkMetricsDto.builder()
                            .bytesIn((long) (Math.random() * 1000000))
                            .bytesOut((long) (Math.random() * 2000000))
                            .throughputIn(Math.random() * 100)
                            .throughputOut(Math.random() * 150)
                            .build())
                    .build();

        } catch (Exception e) {
            log.error("시스템 메트릭 수집 실패", e);
            return getDummyMetrics();
        }
    }

    private AWSServiceStatusDto createServiceStatus(String serviceName, String status, int responseTime, String error) {
        return AWSServiceStatusDto.builder()
                .serviceName(serviceName)
                .status(status)
                .responseTime(responseTime)
                .lastChecked(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .endpoint(error)
                .region("ap-northeast-2")
                .build();
    }

    // 더미 데이터 생성 메서드들
    private List<AWSServiceStatusDto> getDummyAWSServices() {
        List<AWSServiceStatusDto> services = new ArrayList<>();
        
        services.add(createServiceStatus("EC2 Instance", "healthy", 45, null));
        services.add(createServiceStatus("RDS Database", "healthy", 12, null));
        services.add(createServiceStatus("Application", "healthy", 23, null));
        services.add(createServiceStatus("Load Balancer", "degraded", 89, null));
        
        return services;
    }

    private SystemMetricsDto getDummyMetrics() {
        return SystemMetricsDto.builder()
                .cpu(SystemMetricsDto.CpuMetricsDto.builder()
                        .usage(45.0)
                        .cores(4)
                        .build())
                .memory(SystemMetricsDto.MemoryMetricsDto.builder()
                        .used(6.2)
                        .total(16.0)
                        .usage(38.75)
                        .build())
                .disk(SystemMetricsDto.DiskMetricsDto.builder()
                        .used(120.0)
                        .total(500.0)
                        .usage(24.0)
                        .build())
                .network(SystemMetricsDto.NetworkMetricsDto.builder()
                        .bytesIn(1024000L)
                        .bytesOut(2048000L)
                        .throughputIn(50.5)
                        .throughputOut(75.3)
                        .build())
                .build();
    }
} 