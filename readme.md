# TravelLight

## 📜 소개

TravelLight는 여행자들의 짐을 안전하게 보관하고 원하는 곳으로 편리하게 배송해주는 서비스입니다. 무거운 짐으로부터 벗어나 더욱 가볍고 자유로운 여행을 즐길 수 있도록 돕는 것을 목표로 합니다.

이 프로젝트는 **Spring Boot** 기반의 신뢰도 높은 백엔드 시스템과 **React (TypeScript)** 기반의 사용자 친화적인 프론트엔드 인터페이스를 통해 원활한 짐 보관 및 배송 신청, 관리, 추적 기능을 제공합니다.

## ✨ 주요 기능

*   **사용자 인증 및 관리**:
    *   Spring Security를 이용한 안전한 회원가입, 로그인, 개인정보 관리 기능을 제공합니다.
    *   MUI 기반의 직관적인 UI를 통해 사용자 프로필 및 서비스 이용 내역을 쉽게 확인할 수 있습니다.
*   **짐 보관 신청 및 관리**:
    *   사용자는 여행 일정에 맞춰 편리하게 짐 보관 서비스를 신청할 수 있습니다.
    *   보관할 짐의 종류, 크기, 수량 등을 등록하고, 가까운 보관소 또는 제휴 지점을 지도에서 선택하거나 검색할 수 있습니다. (기능 확장 시)
    *   보관 중인 짐의 상태를 실시간으로 확인하고, 보관 기간을 연장하거나 변경할 수 있습니다.
*   **짐 배송 요청 및 추적**:
    *   보관된 짐을 원하는 날짜와 장소(숙소, 공항, 다음 여행지 등)로 배송 요청할 수 있습니다.
    *   출발지와 도착지 주소를 입력하고, 배송 옵션(일반, 특급 등)을 선택할 수 있습니다.
    *   배송 중인 짐의 현재 위치와 예상 도착 시간을 실시간으로 추적할 수 있습니다. (택배사 API 연동 또는 자체 시스템 구현 필요)
*   **예약 및 결제 시스템**:
    *   짐 보관 및 배송 서비스에 대한 간편한 예약 및 결제 기능을 제공합니다. (결제 PG 연동 필요)
    *   다양한 결제 수단을 지원하고, 예약 내역 및 영수증을 확인할 수 있습니다.
*   **알림 서비스**: 
    *   이메일 또는 SMS(구현 시)를 통해 예약 확정, 짐 입고/출고, 배송 시작/완료 등 주요 상태 변경에 대한 알림을 제공합니다.
*   **관리자 대시보드**:
    *   Recharts 등을 활용하여 서비스 운영 현황(예약 건수, 매출, 사용자 통계 등)을 시각적으로 보여주는 관리자 기능을 제공할 수 있습니다.
*   **API 문서**: Swagger (Springdoc OpenAPI)를 통해 백엔드 API 문서를 자동으로 생성하여 개발 및 연동 편의성을 높입니다.

## 🛠️ 기술 스택

### 🌐 프론트엔드 (src/main/travellight)

*   **언어**: TypeScript
*   **프레임워크/라이브러리**: React 19
*   **UI**: MUI (Material-UI), Emotion, styled-components, framer-motion (애니메이션)
*   **라우팅**: React Router DOM
*   **상태 관리/HTTP**: Axios (필요에 따라 Context API, Recoil, Zustand 등 사용 가능)
*   **날짜/시간**: date-fns, @mui/x-date-pickers
*   **다국어**: i18next, react-i18next
*   **차트**: recharts
*   **빌드 도구**: Vite
*   **기타**: ESLint (코드 린팅)

### ⚙️ 백엔드

*   **언어**: Java 21
*   **프레임워크**: Spring Boot 3.4.3
*   **데이터베이스**: PostgreSQL
*   **주요 라이브러리 및 도구**:
    *   Spring Web, Spring Security, Spring Data JPA
    *   Lombok
    *   Spring Boot Starter Mail
    *   org.json (JSON 처리)
    *   Springdoc OpenAPI (Swagger)
    *   Gradle

## 🚀 시작하기

### 사전 설치 항목

*   **프론트엔드**:
    *   Node.js (v18 이상 권장, `package.json`의 `engines` 필드 확인 필요)
    *   npm 또는 yarn
*   **백엔드**:
    *   Java Development Kit (JDK) 21 또는 이상
    *   Gradle (최신 버전 권장)
    *   PostgreSQL 데이터베이스

### 설치 및 실행

1.  **저장소 복제**:
    ```bash
    git clone https://github.com/your-username/TravelLight.git  # 실제 저장소 URL로 변경해주세요.
    cd TravelLight
    ```

2.  **백엔드 설정 및 실행**:
    *   PostgreSQL 데이터베이스를 설치하고 실행합니다.
    *   `src/main/resources/application.properties` (또는 `application.yml`) 파일에 데이터베이스 연결 정보를 설정합니다.
    *   터미널에서 프로젝트 루트 디렉토리로 이동 후 실행:
        ```bash
        ./gradlew build
        java -jar build/libs/TravelLight-0.0.1-SNAPSHOT.jar
        ```
    *   백엔드 서버는 기본적으로 `http://localhost:8080` 에서 실행됩니다.

3.  **프론트엔드 설정 및 실행**:
    *   프론트엔드 디렉토리로 이동:
        ```bash
        cd src/main/travellight 
        ```
    *   의존성 설치:
        ```bash
        npm install 
        ```
    *   개발 서버 실행:
        ```bash
        npm run dev
        ```
    *   프론트엔드 개발 서버는 기본적으로 `http://localhost:5173` (Vite 기본 포트)에서 실행됩니다.
    *   백엔드 API 프록시 설정: `src/main/travellight/vite.config.ts` 파일에 백엔드 서버(`http://localhost:8080`)로의 API 요청을 위한 프록시 설정이 필요할 수 있습니다. (예: `http-proxy-middleware` 사용)

## 🤝 기여 방법

TravelLight 프로젝트에 기여하고 싶으신 분들을 환영합니다! 다음 절차를 따라주세요:

1.  이 저장소를 Fork 합니다.
2.  새로운 기능 또는 버그 수정을 위한 브랜치를 생성합니다 (`git checkout -b feature/새로운기능` 또는 `bugfix/이슈번호`).
3.  변경 사항을 커밋합니다 (`git commit -m 'Feat: 새로운 기능 추가'`). (커밋 메시지 컨벤션을 지켜주시면 좋습니다.)
4.  브랜치에 푸시합니다 (`git push origin feature/새로운기능`).
5.  Pull Request를 생성하여 변경 사항에 대해 논의합니다.

자세한 기여 가이드라인은 `CONTRIBUTING.md` 파일(생성 예정)을 참고해주세요.

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참고해주세요.

---

