# ELK 스택 설정 가이드

TravelLight 애플리케이션에 ELK(Elasticsearch, Logstash, Kibana) 스택을 통합하여 로그를 수집, 분석 및 시각화하는 방법을 안내합니다.

## 목차
1. [개요](#개요)
2. [아키텍처](#아키텍처)
3. [설치 및 실행](#설치-및-실행)
4. [Kibana 설정](#kibana-설정)
5. [로그 확인](#로그-확인)
6. [대시보드 생성](#대시보드-생성)
7. [문제 해결](#문제-해결)

## 개요

### ELK 스택이란?

- **Elasticsearch**: 강력한 검색 및 분석 엔진
- **Logstash**: 로그 수집 및 처리 파이프라인
- **Kibana**: 데이터 시각화 및 대시보드 도구

### 통합 구성

```
Spring Boot App → Logstash → Elasticsearch → Kibana
       ↓
   Log Files
```

## 아키텍처

### 로그 흐름

1. **Spring Boot 애플리케이션**
   - Logback을 통해 JSON 포맷으로 로그 생성
   - `/logs` 디렉토리에 파일로 저장
   - TCP 5000 포트로 Logstash에 직접 전송

2. **Logstash**
   - TCP 5000 포트로 실시간 로그 수신
   - 파일에서도 로그 읽기
   - 로그 파싱 및 필터링
   - Elasticsearch로 인덱싱

3. **Elasticsearch**
   - 로그 데이터 저장 및 인덱싱
   - 9200 포트로 REST API 제공

4. **Kibana**
   - 5601 포트로 웹 UI 제공
   - 로그 검색 및 시각화

## 설치 및 실행

### 1. 필요 사항

- Docker & Docker Compose 설치
- 최소 4GB RAM (권장: 8GB)
- 디스크 여유 공간 10GB 이상

### 2. ELK 스택 시작

```bash
# ELK 스택만 시작
docker-compose -f docker-compose.elk.yml up -d elasticsearch logstash kibana

# 전체 스택 시작 (애플리케이션 포함)
docker-compose -f docker-compose.elk.yml up -d

# 로그 확인
docker-compose -f docker-compose.elk.yml logs -f

# 특정 서비스 로그만 확인
docker-compose -f docker-compose.elk.yml logs -f logstash
```

### 3. 서비스 상태 확인

```bash
# Elasticsearch 상태 확인
curl http://localhost:9200/_cluster/health?pretty

# Logstash 상태 확인
curl http://localhost:9600/_node/stats?pretty

# Kibana 접속 (브라우저)
# http://localhost:5601
```

### 4. 서비스 중지

```bash
# 전체 중지
docker-compose -f docker-compose.elk.yml down

# 볼륨까지 삭제 (데이터 완전 삭제)
docker-compose -f docker-compose.elk.yml down -v
```

## Kibana 설정

### 1. Kibana 접속

브라우저에서 http://localhost:5601 접속

### 2. 인덱스 패턴 생성

1. 좌측 메뉴에서 **Management** → **Stack Management** 클릭
2. **Kibana** → **Index Patterns** 클릭
3. **Create index pattern** 클릭
4. Index pattern name: `travellight-logs-*` 입력
5. **Next step** 클릭
6. Time field: `@timestamp` 선택
7. **Create index pattern** 클릭

### 3. Discover에서 로그 확인

1. 좌측 메뉴에서 **Discover** 클릭
2. 상단에서 생성한 인덱스 패턴(`travellight-logs-*`) 선택
3. 시간 범위 조정 (우측 상단)
4. 로그 검색 및 필터링

## 로그 확인

### Discover에서 로그 검색

#### 기본 검색 쿼리

```
# 특정 레벨 로그 검색
level: "ERROR"

# 특정 로거 검색
logger: "org.example.travellight.controller.*"

# 여러 조건 조합
level: "ERROR" AND logger: "UserController"

# 시간 범위 지정 (상단 시간 선택기 사용)
Last 15 minutes, Last 1 hour, Last 24 hours 등
```

#### 필드 기반 필터링

좌측 **Available fields**에서 원하는 필드 클릭:
- `level`: 로그 레벨 (INFO, ERROR, WARN, DEBUG)
- `logger`: 로거 이름
- `thread`: 스레드 이름
- `message`: 로그 메시지
- `service`: 서비스 이름 (travellight)
- `environment`: 환경 (local, docker, production)

### 유용한 검색 예제

```
# 에러 로그만 보기
level: "ERROR"

# 특정 사용자 관련 로그
mdc_userId: "user123"

# HTTP 요청 로그
message: *"HTTP"*

# 예외 스택 트레이스 포함
stack_trace: *"Exception"*

# 특정 시간대 로그
@timestamp: [2025-10-10T00:00:00 TO 2025-10-10T23:59:59]
```

## 대시보드 생성

### 1. Visualization 생성

#### 로그 레벨별 분포 (Pie Chart)

1. **Visualize** → **Create visualization** 클릭
2. **Pie** 선택
3. 인덱스 패턴: `travellight-logs-*` 선택
4. Buckets 설정:
   - **Split slices** 클릭
   - Aggregation: **Terms**
   - Field: **level.keyword**
   - Size: 10
5. **Update** 클릭
6. 상단 **Save** 클릭, 이름: "Log Level Distribution"

#### 시간별 로그 발생 추이 (Line Chart)

1. **Visualize** → **Create visualization** 클릭
2. **Line** 선택
3. 인덱스 패턴: `travellight-logs-*` 선택
4. Metrics:
   - Y-axis: **Count**
5. Buckets:
   - X-axis → Aggregation: **Date Histogram**
   - Field: **@timestamp**
   - Interval: **Auto**
6. **Update** 클릭
7. **Save** 클릭, 이름: "Log Timeline"

#### 에러 로그 테이블

1. **Visualize** → **Create visualization** 클릭
2. **Data Table** 선택
3. Add filter: `level: "ERROR"`
4. Buckets:
   - Split rows → Terms → **logger.keyword**
5. **Update** → **Save**, 이름: "Error Logs by Logger"

### 2. Dashboard 생성

1. **Dashboard** → **Create dashboard** 클릭
2. **Add** 클릭하여 위에서 만든 Visualization 추가
3. 레이아웃 조정 (드래그 앤 드롭)
4. **Save** 클릭, 이름: "TravelLight Monitoring Dashboard"

### 3. 권장 대시보드 구성

- **로그 레벨 분포** (Pie Chart)
- **시간별 로그 추이** (Line Chart)
- **에러 로그 Top 10** (Data Table)
- **로거별 로그 수** (Bar Chart)
- **최근 에러 로그** (Data Table, 시간 역순)

## 로그 활용 팁

### 1. 애플리케이션 로깅 Best Practice

#### MDC (Mapped Diagnostic Context) 활용

```java
import org.slf4j.MDC;

// 사용자 ID 추가
MDC.put("userId", user.getId());
log.info("User logged in");
MDC.clear();

// 요청 ID 추가 (Filter에서)
MDC.put("requestId", UUID.randomUUID().toString());
```

#### 구조화된 로그 메시지

```java
// 좋은 예
log.info("User {} successfully logged in from IP {}", userId, clientIp);

// 나쁜 예
log.info("User login success");
```

### 2. Kibana 알림 설정

Kibana Alerting을 사용하여 특정 조건 발생 시 알림:

1. **Stack Management** → **Alerts and Insights** → **Rules**
2. **Create rule** 클릭
3. 조건 설정 (예: ERROR 로그 10개 이상 발생)
4. 알림 방식 설정 (Slack, Email 등)

## 문제 해결

### Elasticsearch가 시작되지 않음

**문제**: `max virtual memory areas vm.max_map_count [65530] is too low`

**해결**:
```bash
# Linux
sudo sysctl -w vm.max_map_count=262144

# Docker Desktop (Windows/Mac)
# Docker Desktop → Settings → Resources → Advanced
# Memory: 최소 4GB 할당
```

### Logstash가 Elasticsearch에 연결되지 않음

**확인 사항**:
```bash
# Elasticsearch 상태 확인
curl http://localhost:9200/_cluster/health

# Logstash 로그 확인
docker-compose -f docker-compose.elk.yml logs logstash

# 네트워크 연결 확인
docker network ls
docker network inspect travellight_elk
```

### Kibana에 로그가 표시되지 않음

**확인 순서**:

1. Elasticsearch에 인덱스가 생성되었는지 확인:
   ```bash
   curl http://localhost:9200/_cat/indices?v
   ```

2. 로그 파일이 생성되고 있는지 확인:
   ```bash
   ls -lh logs/
   ```

3. 애플리케이션이 Logstash에 연결되었는지 확인:
   ```bash
   docker-compose -f docker-compose.elk.yml logs app | grep -i logstash
   ```

4. Kibana 인덱스 패턴이 올바른지 확인:
   - Management → Index Patterns
   - `travellight-logs-*` 패턴 확인

### 로그가 너무 많이 쌓임

**디스크 공간 관리**:

```bash
# 오래된 인덱스 삭제 (30일 이전)
curl -X DELETE "localhost:9200/travellight-logs-2025.09.*"

# Index Lifecycle Management (ILM) 설정
# Kibana → Stack Management → Index Lifecycle Policies
```

## 성능 최적화

### 1. Logback 비동기 로깅

`logback-spring.xml`에 이미 AsyncAppender가 설정되어 있습니다.

### 2. Elasticsearch 샤드 설정

프로덕션 환경에서는 인덱스 템플릿 설정:

```bash
curl -X PUT "localhost:9200/_index_template/travellight-logs" -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["travellight-logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "refresh_interval": "5s"
    }
  }
}'
```

### 3. Logstash 파이프라인 워커 수 조정

`logstash/pipeline/logstash.conf` 상단에 추가:
```
pipeline.workers: 2
pipeline.batch.size: 125
```

## 프로덕션 배포 시 고려사항

1. **보안**:
   - Elasticsearch 인증 활성화 (X-Pack Security)
   - Kibana HTTPS 설정
   - Logstash 입력 포트 방화벽 설정

2. **고가용성**:
   - Elasticsearch 클러스터 구성 (최소 3노드)
   - Logstash 다중 인스턴스
   - 로드밸런서 추가

3. **백업**:
   - Elasticsearch 스냅샷 설정
   - S3 또는 NFS 백업 스토리지

4. **모니터링**:
   - Metricbeat로 ELK 스택 자체 모니터링
   - Prometheus + Grafana 연동

## 참고 자료

- [Elasticsearch 공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Logstash 공식 문서](https://www.elastic.co/guide/en/logstash/current/index.html)
- [Kibana 공식 문서](https://www.elastic.co/guide/en/kibana/current/index.html)
- [Logback 공식 문서](http://logback.qos.ch/documentation.html)
- [Logstash Logback Encoder](https://github.com/logfellow/logstash-logback-encoder)

## 라이센스 및 버전

- Elasticsearch 7.17.22 (Apache 2.0 License)
- Logstash 7.17.22 (Apache 2.0 License)
- Kibana 7.17.22 (Elastic License)
- Logstash Logback Encoder 7.4 (Apache 2.0 License)

---

**작성일**: 2025-10-10
**버전**: 1.0.0
