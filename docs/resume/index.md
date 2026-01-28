ㅠ# 신강희 | 백엔드 개발자 (Shin Kang-hee)

> **"프론트엔드 최적화 경험을 바탕으로, 시스템 전체의 병목을 해결하는 백엔드 개발자입니다."** <br/>
> 실사용 서비스 운영을 통해 데이터 정합성의 중요성을 체감하고 백엔드로 전향하였습니다.

---

## 📬 Contact

- **Email:** skh8609@naver.com
- **Links:** [GitHub](https://github.com/...) | [Blog](https://...) | [Portfolio Site](https://...)

---

## 🛠 Skills

- **Backend:** Java 17, Spring Boot 3.x, Spring Cloud Gateway, JPA, MyBatis
- **Data:** PostgreSQL, MySQL, Redis (Atomic Operation)
- **Infra:** Docker, Kubernetes (NCP), GitHub Actions CI/CD
- **Frontend:** React, Recoil, React-Query

---

## 🚀 Core Projects

### 1. Bargain Hunter (백엔드 / 팀) | 2025.07 ~ 2025.10

**MSA 기반 국내 관광 지도 플랫폼**

- **성과:** 이메일 발송 API 응답 시간 **92% 개선** (2.5s → 0.2s)
- **핵심 기술:**
  - Spring Event + `@Async` 비동기 구조로 메일 발송 로직 분리
  - Redis `HINCRBY` 원자적 연산을 적용해 분산 환경 동시성 이슈(Race Condition) 해결
  - OAuth2 **PKCE 플로우** 도입으로 보안성 강화

### 2. Security Ticket (백엔드 / 팀) | 2025.04 ~ 2025.05

**티켓 기반 보안 점검 서비스**

- **성과:** 복합 검색 평균 응답 시간 **36% 개선** (24.45ms → 15.51ms)
- **핵심 기술:**
  - JPA의 한계를 **MyBatis 동적 SQL**로 보완하여 복잡한 조건 분기 최적화
  - `EXISTS` 서브쿼리 및 인덱스 전략 개선으로 최대 응답 시간 **88.5% 감소** (473ms → 54ms)
  - Spring Security 커스텀 필터 구현으로 인증 구조 유연성 확보

### 3. ReadyBerry (프론트엔드 / 팀) | 2023.12 ~ 2024.05

**선결제 테이크아웃 서비스 (교내 축제 및 카페 2곳 실사용)**

- **성과:** 결제 페이지 로딩 시간 **70% 단축**
- **핵심 기술:** `useEffect`, `useRef` 구조 개선으로 Toss SDK 초기화 횟수 최소화 (8~12회 → 1회)
- **전향 계기:** 결제 트랜잭션과 데이터 무결성의 중요성을 인지하고 백엔드로 전문성 확장

---

## 🎓 Education & Others

- **학력:** [학교명] [전공] (졸업/예정)
- **수상:** [수상 내역]
