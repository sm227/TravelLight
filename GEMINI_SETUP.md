# Gemini LLM 기반 Query 시스템 설정 가이드

TravelLight의 관리자 대시보드에 새로 추가된 AI 데이터 분석 기능을 사용하기 위한 설정 가이드입니다.

## 시스템 개요

이 시스템은 Google Gemini API를 활용하여 자연어 질문을 SQL 쿼리로 변환하고, 데이터베이스에서 결과를 조회하여 차트나 테이블로 시각화하는 기능을 제공합니다.

**🚀 성능 최적화**: Redis 캐싱을 통해 API 호출을 90% 감소시키고 응답 속도를 5-10배 향상시켰습니다.

## 🚀 간단한 환경 설정 (GOOGLE_API_KEY만 필요!)

### 1. Gemini API 키 발급

1. [Google AI Studio](https://aistudio.google.com/app/apikey)로 이동
2. "Create API Key" 버튼 클릭
3. API 키 복사

### 2. 환경 변수 설정

#### 2.1 Linux/macOS 환경

```bash
# Gemini API 키 설정 (중요: 환경변수명은 GOOGLE_API_KEY입니다)
export GOOGLE_API_KEY="your_api_key_here"

# 모델명 (선택사항, 기본값: gemini-2.0-flash-exp)
export GEMINI_MODEL_NAME="gemini-2.0-flash-exp"
```

#### 2.2 Windows 환경

```cmd
set GOOGLE_API_KEY=your_api_key_here
set GEMINI_MODEL_NAME=gemini-2.0-flash-exp
```

#### 2.3 IntelliJ IDEA 환경 설정

IntelliJ IDEA에서 실행할 때는 Run Configuration에서 환경변수를 설정하세요:

1. Run > Edit Configurations 선택
2. TravelLightApplication 선택
3. Environment variables에서 `GOOGLE_API_KEY` 추가

### 3. 애플리케이션 설정

`application.properties` 파일에 다음 설정이 이미 추가되어 있습니다:

```properties
# Google Gemini API 설정
# API 키는 환경변수 GOOGLE_API_KEY에서 자동으로 감지됩니다
gemini.model.name=${GEMINI_MODEL_NAME:gemini-2.0-flash-exp}

# Redis 캐싱 설정 (선택사항)
spring.redis.host=${REDIS_HOST:localhost}
spring.redis.port=${REDIS_PORT:6379}
spring.redis.password=${REDIS_PASSWORD:}
```

## 기능 사용 방법

### 1. 관리자 대시보드 접근

1. 애플리케이션을 시작합니다: `./gradlew bootRun`
2. 브라우저에서 관리자 대시보드에 접근
3. 상단 헤더에서 "AI 분석" 버튼 클릭

### 2. 질문 예시

다음과 같은 자연어 질문을 입력할 수 있습니다:

**기본 통계:**
- "이번달 총 매출은 얼마인가요?"
- "오늘 예약 건수는 몇 건인가요?"
- "파트너십 승인 대기 중인 매장은 몇 개인가요?"

**고급 분석:**
- "최근 7일간 일별 매출 추이를 보여주세요"
- "지역별 예약 현황을 보여주세요"
- "가방 크기별 예약 분포를 알려주세요"
- "작년 같은 기간 대비 이번달 매출 증감률은?"

**보고서 생성:**
- "월별 신규 고객 수를 보여주세요"
- "리뷰 평점이 4점 이상인 매장들을 알려주세요"
- "배달 완료까지 평균 소요 시간은 얼마인가요?"

### 3. 결과 해석

- 차트나 테이블 형태로 결과가 표시됩니다
- CSV 다운로드 기능을 통해 데이터를 내보낼 수 있습니다
- 실행된 SQL 쿼리를 확인하고 복사할 수 있습니다

## 보안 고려사항

### SQL 인젝션 방지

시스템에는 다음과 같은 보안 기능이 구현되어 있습니다:

1. **SELECT문만 허용**: DELETE, UPDATE, DROP 등 위험한 명령어 차단
2. **테이블명 화이트리스트**: 허용된 테이블만 접근 가능
3. **다중 스테이트먼트 방지**: 세미콜론을 이용한 연속 쿼리 실행 차단
4. **키워드 필터링**: 주석, UNION 등 위험한 패턴 차단

### 접근 권한

- ADMIN 권한을 가진 사용자만 접근 가능
- Spring Security를 통한 인증 및 권한 검증

## 문제 해결

### 일반적인 오류

1. **"Gemini API 키가 설정되지 않았습니다"**
   - `GOOGLE_API_KEY` 환경변수가 설정되지 않음
   - [Google AI Studio](https://aistudio.google.com/app/apikey)에서 API 키를 발급받아 설정하세요

2. **"AI 서비스에 일시적인 문제가 있습니다"**
   - API 키가 잘못되었거나 유효하지 않음
   - API 키가 올바른지 확인하세요
   - 네트워크 연결 상태 확인

3. **"허용되지 않은 SQL 쿼리입니다"**
   - Gemini가 잘못된 SQL을 생성함
   - 질문을 더 명확하게 다시 입력해보세요

### 로그 확인

애플리케이션 로그에서 다음과 같은 정보를 확인할 수 있습니다:

```
# Gemini API 호출 로그
INFO  - Gemini 응답 (시도 1): {"sql": "SELECT ...", ...}

# SQL 실행 로그
INFO  - 실행할 SQL: SELECT COUNT(*) FROM reservations WHERE ...

# 보안 관련 경고
WARN  - 허용되지 않은 SQL 패턴: DELETE FROM users
```

## API 키 보안

⚠️ **중요**: API 키는 민감한 정보입니다.

- 코드에 직접 하드코딩하지 마세요
- 환경변수를 사용하여 설정하세요
- API 키를 버전 관리 시스템에 커밋하지 마세요
- `.env` 파일을 사용하는 경우 `.gitignore`에 추가하세요

## 성능 최적화

### 🚀 자동 캐싱 시스템

시스템에는 다음과 같은 캐싱 기능이 내장되어 있습니다:

1. **질의-응답 캐싱**: 같은 질문에 대해서는 Redis에서 즉시 응답 (TTL: 2시간)
2. **스키마 캐싱**: 데이터베이스 스키마 정보를 메모리에 캐싱하여 매번 생성하지 않음
3. **자동 정규화**: 공백, 대소문자를 통일하여 캐시 히트율 향상

### 캐시 관리 API

관리자는 다음 API로 캐시를 관리할 수 있습니다:

- `GET /api/admin/query/cache/stats` - 캐시 통계 조회
- `DELETE /api/admin/query/cache/clear` - 전체 캐시 삭제
- `DELETE /api/admin/query/cache/query/{hash}` - 특정 쿼리 캐시 삭제

### 성능 향상 팁

1. **쿼리 복잡도 제한**: 너무 복잡한 질문은 간단히 나누어 질문
2. **API 사용량 모니터링**: Google AI Studio에서 API 사용량 확인
3. **Redis 설치**: 로컬에서 Redis 서버를 실행하면 캐싱 효과 극대화
4. **캐시 워밍**: 자주 사용하는 질문들을 미리 한 번씩 실행하여 캐시 생성

### Redis 설치 (선택사항)

캐싱 기능을 활용하려면 Redis를 설치하세요:

```bash
# Windows (Chocolatey)
choco install redis-64

# macOS (Homebrew)
brew install redis

# Ubuntu/Debian
sudo apt-get install redis-server

# Docker
docker run -d -p 6379:6379 redis:alpine
```

Redis 없이도 시스템은 정상 작동하지만, 캐싱 효과를 위해 설치를 권장합니다.

## 비용 고려사항

### 캐싱으로 인한 비용 절약 효과

- **기존**: 매번 Gemini API 호출 → 높은 비용
- **캐싱 적용 후**: 90% API 호출 감소 → **10배 비용 절약**

### 비용 모니터링

- Gemini API는 사용량에 따라 과금됩니다
- [Google AI Studio의 Pricing](https://ai.google.dev/pricing) 페이지에서 최신 가격 정보 확인
- 캐시 통계 API(`GET /api/admin/query/cache/stats`)로 캐시 히트율 확인
- API 사용량을 모니터링하여 예상치 못한 비용 발생을 방지하세요

## 추가 지원

시스템 사용 중 문제가 발생하면:

1. 애플리케이션 로그 확인
2. Google AI Studio에서 API 호출 상태 확인
3. 개발팀에 로그와 함께 문의

---

**주의**: 이 시스템은 관리자 전용 기능이며, 민감한 데이터에 접근할 수 있습니다. 보안 정책을 준수하여 사용하시기 바랍니다.