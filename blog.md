# Spring Boot에 ELK 스택 통합하기

**Elasticsearch, Logstash, Kibana를 활용한 로그 수집 및 시각화 시스템 구축**

## 들어가며

애플리케이션이 운영 환경에서 실행될 때, 로그는 시스템의 상태를 파악하고 문제를 진단하는 가장 중요한 도구입니다. 하지만 로그 파일을 직접 열어서 확인하는 것은 비효율적이며, 여러 서버에 분산된 로그를 통합적으로 관리하기는 더욱 어렵습니다.

이번 글에서는 TravelLight 프로젝트에 ELK(Elasticsearch, Logstash, Kibana) 스택을 통합하여 강력한 로그 수집 및 시각화 시스템을 구축한 과정을 공유합니다.

## ELK 스택이란?

ELK 스택은 세 가지 오픈소스 프로젝트의 조합입니다:

### Elasticsearch
분산형 검색 및 분석 엔진으로, 대량의 로그 데이터를 저장하고 실시간으로 검색할 수 있습니다. RESTful API를 통해 강력한 쿼리 기능을 제공하며, 수평적 확장이 가능합니다.

### Logstash
다양한 소스에서 데이터를 수집하고, 변환하며, 원하는 목적지로 전송하는 파이프라인 도구입니다. 로그를 파싱하고 필터링하여 Elasticsearch에 적합한 형태로 가공합니다.

### Kibana
Elasticsearch에 저장된 데이터를 시각화하는 웹 인터페이스입니다. 대시보드, 차트, 그래프를 통해 로그 데이터를 직관적으로 분석할 수 있습니다.

## 시스템 아키텍처

전체 로그 수집 파이프라인은 다음과 같이 구성됩니다:

```
Spring Boot Application
    |
    |-- Logback (JSON 포맷)
    |     |
    |     +-- File System (logs/*.json, logs/*.log)
    |     |
    |     +-- TCP Socket (port 5000)
    |
    v
Logstash
    |
    |-- Input: TCP/File
    |-- Filter: 파싱, 변환, 필터링
    |-- Output: Elasticsearch
    |
    v
Elasticsearch
    |
    |-- Index: travellight-logs-YYYY.MM.dd
    |
    v
Kibana (http://localhost:5601)
    |
    +-- Discover (로그 검색)
    +-- Visualize (시각화)
    +-- Dashboard (대시보드)
```

이러한 구조를 통해 애플리케이션에서 생성된 로그가 실시간으로 Elasticsearch에 인덱싱되고, Kibana를 통해 즉시 확인할 수 있습니다.

## Docker Compose를 통한 ELK 스택 구성

먼저 Docker Compose를 사용하여 ELK 스택을 구성합니다. `docker-compose.elk.yml` 파일에 모든 서비스를 정의했습니다.

### Elasticsearch 설정

```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:7.17.22
  container_name: travellight-elasticsearch
  environment:
    - discovery.type=single-node
    - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    - xpack.security.enabled=false
  ports:
    - "9200:9200"
    - "9300:9300"
  volumes:
    - elasticsearch_data:/usr/share/elasticsearch/data
  healthcheck:
    test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
    interval: 30s
    timeout: 10s
    retries: 5
```

단일 노드 모드로 구성하고, 개발 환경이므로 X-Pack 보안 기능은 비활성화했습니다. Heap 메모리는 512MB로 설정하여 로컬 개발 환경에서도 부담 없이 실행할 수 있습니다.

### Logstash 설정

```yaml
logstash:
  image: docker.elastic.co/logstash/logstash:7.17.22
  container_name: travellight-logstash
  volumes:
    - ./logstash/pipeline:/usr/share/logstash/pipeline:ro
    - ./logs:/logs:ro
  ports:
    - "5000:5000/tcp"
    - "9600:9600"
  environment:
    - "LS_JAVA_OPTS=-Xmx256m -Xms256m"
    - "ELASTICSEARCH_HOSTS=http://elasticsearch:9200"
  depends_on:
    elasticsearch:
      condition: service_healthy
```

Logstash는 Spring Boot 애플리케이션으로부터 TCP 5000 포트로 로그를 받고, 파일 시스템의 로그도 함께 읽어들입니다. Elasticsearch가 정상 동작할 때까지 대기하도록 health check를 활용했습니다.

### Kibana 설정

```yaml
kibana:
  image: docker.elastic.co/kibana/kibana:7.17.22
  container_name: travellight-kibana
  ports:
    - "5601:5601"
  environment:
    - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
  depends_on:
    elasticsearch:
      condition: service_healthy
```

Kibana는 5601 포트로 웹 UI를 제공하며, Elasticsearch와 연동됩니다.

## Spring Boot Logback 설정

Spring Boot에서 로그를 ELK 스택으로 전송하기 위해 Logback을 설정했습니다. 핵심은 JSON 포맷으로 로그를 출력하고, Logstash와 TCP 연결을 통해 실시간으로 전송하는 것입니다.

### Gradle 의존성 추가

먼저 Logstash Logback Encoder를 추가합니다:

```gradle
// Logstash Logback Encoder - ELK 스택 로그 연동
implementation 'net.logstash.logback:logstash-logback-encoder:7.4'
```

### Logback 설정 파일

`src/main/resources/logback-spring.xml` 파일을 생성하여 다양한 Appender를 구성했습니다.

#### JSON 파일 Appender

```xml
<appender name="FILE_JSON" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${LOG_PATH}/${LOG_FILE}.json</file>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
        <includeMdcKeyName>userId</includeMdcKeyName>
        <includeMdcKeyName>requestId</includeMdcKeyName>
        <includeMdcKeyName>sessionId</includeMdcKeyName>
        <includeMdcKeyName>clientIp</includeMdcKeyName>
        <customFields>{"service":"travellight","environment":"${SPRING_PROFILES_ACTIVE:-local}"}</customFields>
    </encoder>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <fileNamePattern>${LOG_PATH}/${LOG_FILE}.%d{yyyy-MM-dd}.json</fileNamePattern>
        <maxHistory>30</maxHistory>
        <totalSizeCap>3GB</totalSizeCap>
    </rollingPolicy>
</appender>
```

LogstashEncoder를 사용하여 로그를 JSON 포맷으로 출력합니다. MDC(Mapped Diagnostic Context)를 통해 userId, requestId 등의 컨텍스트 정보를 함께 기록하며, 날짜별로 로그 파일을 롤링합니다.

#### Logstash TCP Appender

```xml
<appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
    <destination>${LOGSTASH_HOST:-localhost}:${LOGSTASH_PORT:-5000}</destination>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
        <includeMdcKeyName>userId</includeMdcKeyName>
        <includeMdcKeyName>requestId</includeMdcKeyName>
        <includeMdcKeyName>sessionId</includeMdcKeyName>
        <includeMdcKeyName>clientIp</includeMdcKeyName>
        <customFields>{"service":"travellight","environment":"${SPRING_PROFILES_ACTIVE:-local}"}</customFields>
    </encoder>
    <keepAliveDuration>5 minutes</keepAliveDuration>
    <reconnectionDelay>10 seconds</reconnectionDelay>
</appender>
```

LogstashTcpSocketAppender를 통해 로그를 실시간으로 Logstash에 전송합니다. 연결이 끊어지면 10초 후 재연결을 시도합니다.

#### 비동기 Appender

성능 최적화를 위해 비동기 Appender를 사용합니다:

```xml
<appender name="ASYNC_LOGSTASH" class="ch.qos.logback.classic.AsyncAppender">
    <appender-ref ref="LOGSTASH"/>
    <queueSize>512</queueSize>
    <discardingThreshold>0</discardingThreshold>
    <includeCallerData>false</includeCallerData>
</appender>
```

로그를 큐에 넣고 별도 스레드에서 처리하므로, 애플리케이션의 메인 로직에 영향을 주지 않습니다.

#### 프로파일별 설정

```xml
<springProfile name="docker, production">
    <logger name="org.example.travellight" level="INFO"/>
    <logger name="org.springframework.web" level="INFO"/>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="ASYNC_FILE_JSON"/>
        <appender-ref ref="FILE_ERROR"/>
        <appender-ref ref="ASYNC_LOGSTASH"/>
    </root>
</springProfile>
```

운영 환경에서는 Logstash TCP Appender를 활성화하고, 에러 로그는 별도 파일로 저장합니다.

## Logstash 파이프라인 구성

Logstash는 Input, Filter, Output 세 단계로 구성됩니다. `logstash/pipeline/logstash.conf` 파일에 파이프라인을 정의했습니다.

### Input 설정

```conf
input {
  # TCP input for direct Logstash appender from Spring Boot
  tcp {
    port => 5000
    codec => json_lines
    tags => ["spring-boot-tcp"]
  }

  # JSON log files
  file {
    path => "/logs/*.json"
    start_position => "beginning"
    sincedb_path => "/dev/null"
    codec => json
    tags => ["spring-boot-json"]
  }
}
```

TCP 5000 포트로 들어오는 실시간 로그와 파일 시스템의 JSON 로그 파일을 모두 수집합니다. 각 입력 소스에 태그를 붙여 나중에 구분할 수 있습니다.

### Filter 설정

```conf
filter {
  # Handle JSON logs from TCP or file
  if [level] {
    mutate {
      uppercase => ["level"]
    }
  }

  # Extract service name
  mutate {
    add_field => { "service" => "travellight" }
    add_field => { "environment" => "development" }
  }

  # Extract user information from MDC
  if [mdc] {
    ruby {
      code => "
        mdc = event.get('mdc')
        if mdc.is_a?(Hash)
          mdc.each do |key, value|
            event.set('mdc_' + key, value)
          end
        end
      "
    }
  }

  # Add geo-location for IP addresses (if available)
  if [clientIp] {
    geoip {
      source => "clientIp"
      target => "geoip"
    }
  }
}
```

로그 레벨을 대문자로 통일하고, 서비스명과 환경 정보를 추가합니다. MDC 정보는 별도 필드로 추출하며, IP 주소가 있으면 지리적 위치 정보도 추가합니다.

### Output 설정

```conf
output {
  # Output to Elasticsearch
  elasticsearch {
    hosts => ["${ELASTICSEARCH_HOSTS:elasticsearch:9200}"]
    index => "travellight-logs-%{+YYYY.MM.dd}"
    document_type => "_doc"
  }

  # Debug output to stdout
  stdout {
    codec => rubydebug
  }
}
```

처리된 로그를 Elasticsearch에 인덱싱합니다. 인덱스명은 날짜별로 생성되어 관리가 용이합니다.

## Kibana를 통한 로그 시각화

### 인덱스 패턴 생성

Kibana에서 로그를 확인하려면 먼저 인덱스 패턴을 생성해야 합니다:

1. Kibana에 접속 (http://localhost:5601)
2. Management > Stack Management > Index Patterns 이동
3. Create index pattern 클릭
4. Index pattern name: `travellight-logs-*` 입력
5. Time field: `@timestamp` 선택

### Discover에서 로그 검색

Discover 메뉴에서 다양한 검색 쿼리를 사용할 수 있습니다:

```
# 에러 로그만 보기
level: "ERROR"

# 특정 사용자의 로그
mdc_userId: "user123"

# 특정 로거의 로그
logger: "org.example.travellight.controller.UserController"

# 여러 조건 조합
level: "ERROR" AND service: "travellight"
```

### 시각화 및 대시보드

Kibana의 Visualize 기능을 통해 다양한 차트를 만들 수 있습니다:

**로그 레벨별 분포 (Pie Chart)**
- 전체 로그 중 각 레벨(INFO, WARN, ERROR)이 차지하는 비율을 원형 차트로 표시

**시간별 로그 발생 추이 (Line Chart)**
- 시간 경과에 따른 로그 발생량을 라인 차트로 시각화하여 트래픽 패턴 파악

**에러 로그 Top 10 (Data Table)**
- 가장 많이 발생한 에러 로그를 로거별로 집계하여 테이블로 표시

이러한 시각화 요소들을 하나의 대시보드로 구성하면, 시스템 상태를 한눈에 파악할 수 있습니다.

## 실제 사용 예제

### MDC를 활용한 컨텍스트 로깅

애플리케이션 코드에서 MDC를 활용하면 로그에 추가 컨텍스트를 담을 수 있습니다:

```java
import org.slf4j.MDC;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
public class UserController {

    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // 사용자 ID를 MDC에 추가
        MDC.put("userId", user.getId());
        MDC.put("clientIp", request.getRemoteAddr());

        log.info("User logged in successfully");

        // 요청 처리 후 MDC 정리
        MDC.clear();

        return ResponseEntity.ok(response);
    }
}
```

이렇게 하면 Kibana에서 `mdc_userId` 필드로 특정 사용자의 모든 로그를 추적할 수 있습니다.

### 구조화된 로그 메시지

로그 메시지를 구조화하면 검색과 분석이 훨씬 쉬워집니다:

```java
// 좋은 예
log.info("User {} successfully logged in from IP {}", userId, clientIp);

// 나쁜 예
log.info("User login success");
```

### 에러 로그 및 스택 트레이스

예외 발생 시 스택 트레이스도 함께 기록하면, 문제 진단이 훨씬 수월합니다:

```java
try {
    // 비즈니스 로직
} catch (Exception e) {
    log.error("Failed to process user request for userId: {}", userId, e);
}
```

## 성능 고려사항

### 비동기 로깅

Logback의 AsyncAppender를 사용하여 로깅 작업이 애플리케이션 성능에 미치는 영향을 최소화했습니다. 로그는 큐에 쌓이고 별도 스레드에서 처리됩니다.

### 로그 파일 롤링

날짜별로 로그 파일을 롤링하고, 최대 보관 기간(30일)과 전체 용량(3GB)을 제한하여 디스크 공간을 효율적으로 관리합니다.

### Elasticsearch 인덱스 관리

일별로 인덱스를 생성하여 오래된 데이터는 쉽게 삭제할 수 있습니다. Index Lifecycle Management(ILM)를 활용하면 자동으로 오래된 인덱스를 삭제하거나 아카이브할 수 있습니다.

## 문제 해결 팁

### Elasticsearch가 시작되지 않는 경우

`vm.max_map_count` 설정이 낮을 수 있습니다:

```bash
# Linux
sudo sysctl -w vm.max_map_count=262144

# 영구 적용
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
```

### Logstash 연결 문제

애플리케이션이 Logstash에 연결되지 않으면, 환경 변수가 제대로 설정되었는지 확인합니다:

```bash
# Docker Compose 환경에서
docker-compose -f docker-compose.elk.yml logs app | grep -i logstash
```

### 로그가 Kibana에 표시되지 않는 경우

1. Elasticsearch에 인덱스가 생성되었는지 확인:
   ```bash
   curl http://localhost:9200/_cat/indices?v
   ```

2. 로그 파일이 생성되고 있는지 확인:
   ```bash
   ls -lh logs/
   ```

3. Kibana 인덱스 패턴이 올바른지 확인

4. 시간 범위를 적절히 조정

## 프로덕션 배포 고려사항

### 보안

운영 환경에서는 반드시 보안 설정을 활성화해야 합니다:

- Elasticsearch X-Pack Security 활성화 (인증/권한 관리)
- Kibana HTTPS 설정
- Logstash 입력 포트에 방화벽 규칙 적용
- 로그에 민감한 정보(비밀번호, 개인정보) 포함 금지

### 고가용성

- Elasticsearch 클러스터 구성 (최소 3노드)
- Logstash 다중 인스턴스 운영
- 로드밸런서를 통한 분산 처리

### 백업 및 복구

- Elasticsearch 스냅샷 정기적으로 생성
- S3 또는 NFS에 백업 저장
- 재해 복구 계획 수립

### 모니터링

- Metricbeat를 통한 ELK 스택 자체 모니터링
- Prometheus와 Grafana 연동
- 알림 설정 (Slack, Email 등)

## 결론

ELK 스택을 Spring Boot 애플리케이션에 통합하면 강력한 로그 관리 시스템을 구축할 수 있습니다. 실시간 로그 수집, 강력한 검색 기능, 직관적인 시각화를 통해 시스템 모니터링과 문제 진단이 훨씬 수월해집니다.

### 주요 이점

- **중앙 집중식 로그 관리**: 여러 서버의 로그를 한곳에서 통합 관리
- **실시간 모니터링**: 로그가 생성되는 즉시 Kibana에서 확인 가능
- **강력한 검색**: Elasticsearch의 풀텍스트 검색과 필터링 기능
- **시각화 및 분석**: 대시보드를 통한 직관적인 데이터 분석
- **확장성**: 트래픽 증가에 따라 수평적 확장 가능

### 향후 개선 방향

1. **Filebeat 도입**: Logstash보다 가벼운 Filebeat를 로그 수집기로 사용하여 리소스 효율성 향상

2. **APM 통합**: Elastic APM을 도입하여 애플리케이션 성능 모니터링 추가

3. **Machine Learning**: Kibana의 ML 기능을 활용하여 이상 징후 자동 감지

4. **알림 자동화**: Watcher 또는 Kibana Alerting을 통해 특정 조건 발생 시 자동 알림

5. **로그 보존 정책**: ILM을 통한 체계적인 로그 라이프사이클 관리

## 참고 자료

- [Elastic 공식 문서](https://www.elastic.co/guide/index.html)
- [Logstash Logback Encoder GitHub](https://github.com/logfellow/logstash-logback-encoder)
- [Spring Boot Logging 문서](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.logging)

---

**작성일**: 2025년 10월 10일
**프로젝트**: TravelLight
**기술 스택**: Spring Boot 3.4.3, ELK Stack 7.17.22, Docker Compose, Logback
