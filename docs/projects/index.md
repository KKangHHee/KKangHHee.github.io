---
sidebar_position: 0
title: 프로젝트 포트폴리오
---

# 프로젝트 포트폴리오

실무 수준의 팀 프로젝트 경험을 통해 **백엔드 개발**, **성능 최적화**, **보안 구현** 역량을 쌓아왔습니다.

---

## 📊 프로젝트 한눈에 비교하기

| 프로젝트                                           | 기간                    | 핵심 기술                                                                | 주요 성과                                                                                                                                                                           |
| -------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Bargain Hunter](./projects/bargain-hunter/)**   | 25.07~25.10<br/>(4개월) | - Java, Spring Boot 3+<br/>- PostgreSQL, Redis<br/> - docker, Kubernetes | • 이메일 발송 **API 응답 92% 개선** (2.5s → 0.2s)<br/>• Redis HINCRBY 원자적 연산으로 동시성 제어<br/>• PKCE 적용으로 OAuth2 보안 강화                                              |
| **[Security Ticket](./projects/security-ticket/)** | 25.04~25.05<br/>(2개월) | - Java, Spring Boot 3+<br/>- MySQL, Redis<br/>- JPA + MyBatis            | • 복합 검색 **평균 응답시간 36% 개선** (24.45ms → 15.51ms)<br/>• EXISTS 서브쿼리로 **최대 응답시간 88.5% 감소** (473ms → 54ms)<br/>• 커스텀 세션 인증으로 비즈니스 로직 유연성 확보 |
| **[ReadyBerry](./projects/readyberry/)**           | 23.12~24.05<br/>(5개월) | - React, TossPayments                                                    | • **교내 축제 및 카페 2곳 실사용 배포**<br/>• Toss SDK useEffect 최적화로 **결제 로딩 70% 단축**<br/>• 백엔드 개발 전환 계기                                                        |

---

## 🎯 핵심 강점

### 1. 성능 최적화

- **이벤트 기반 아키텍처**: 비동기 처리로 API 응답 속도 극대화
- **쿼리 튜닝**: MyBatis 동적 SQL + EXISTS 패턴으로 검색 성능 개선
- **동시성 제어**: Redis 원자적 연산으로 Race Condition 방지(HINCRBY 활용)

### 2. 보안 구현

- **OAuth2 + PKCE**: Authorization Code Interception 공격 방지
- **Refresh Token 관리**: DB 저장으로 토큰 탈취 시 즉시 대응
- **세션 기반 인증**: Spring Security 커스텀 구현으로 비즈니스 로직 통합

### 3. 아키텍처 설계

- **MSA**: Gateway를 통한 인증 중앙화 및 서비스별 독립 배포
- **하이브리드 ORM**: JPA(CRUD) + MyBatis(복잡 검색) 전략
- **CI/CD**: GitHub Actions + Kubernetes 자동 배포 파이프라인

### 4. 협업 및 커뮤니케이션

- API 명세서 작성 및 표준화
- 코드 리뷰 문화 구축
- 애자일 스프린트 운영
- 팀 간 기술 공유

---

## 📂 프로젝트 상세 보기

- [Bargain Hunter - MSA 기반 여행 플랫폼](./bargain-hunter/)
- [Security Ticket - 컴플라이언스 관리 시스템](./security-ticket/)
- [ReadyBerry - 선결제 테이크아웃 서비스](./readyberry/)

---
