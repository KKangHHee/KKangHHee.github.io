---
title: Security Ticket Platform
description: 정보보호 컴플라이언스 점검을 디지털화한 웹 기반 관리 플랫폼
---

# 🔐 Security Ticket Platform

> **정보보호 컴플라이언스(ISMS-P, ISO27001) 점검 프로세스를  
> Excel·이메일 중심의 수동 방식에서 벗어나  
> 웹 기반 디지털 전환을 실현한 보안 검증 관리 플랫폼**

---

## 📌 프로젝트 개요

| 항목              | 내용                                                |
| ----------------- | --------------------------------------------------- |
| **기간**          | 2025.04 ~ 2025.05 (2개월)                           |
| **팀 구성**       | BE 8명 (A팀 4명, B팀 4명), FE 3명                   |
| **역할**          | Backend Developer (B팀)                             |
| **프로젝트 성격** | SK플래닛 T아카데미 웹 풀스택 과정 7기 최종 프로젝트 |

---

## 🎯 핵심 문제 인식

기존 정보보호 컴플라이언스 점검은 **Excel 문서와 이메일 기반의 수동 프로세스**로 운영되어 다음과 같은 문제가 발생했습니다:

- ❌ 점검 이력 관리 및 추적의 어려움
- ❌ 진행 상태에 대한 실시간 파악 불가
- ❌ 역할(관리자/고객사) 기반 접근 제어 미흡
- ❌ 반복적인 커뮤니케이션으로 인한 업무 비효율

---

## 💡 해결 방향

✅ **검증 프로세스의 웹 기반 표준화**  
✅ **역할 기반 권한 관리 및 접근 제어**  
✅ **점검 상태 시각화 및 자동 알림 제공**  
✅ **반복 업무 최소화를 위한 템플릿 기반 검증 흐름**

---

## 🏗️ 주요 기능

### 1. 인증/인가 시스템

- 세션 기반 커스텀 로그인 (JSON 요청 처리)
- 역할별 접근 제어 (최고 관리자, 관리자, 고객사)
- 동시 로그인 제한 및 세션 관리

### 2. 관리자/고객사 회원 관리

- 복합 조건 검색 (기간, 키워드, 상태 등)
- 페이징 및 정렬 지원
- 계정 상태 관리

### 3. 컴플라이언스 검증 프로세스

- 고객사 보안 점검 요청 접수
- 관리자 표준 문항 기반 검증 진행
- 진행 상태 추적 및 일정 알림

---

## 🛠️ 기술 스택

| 분야          | 기술                                                        |
| ------------- | ----------------------------------------------------------- |
| **Backend**   | Java 17, Spring Boot 3.x, JPA, MyBatis, Spring Security     |
| **Database**  | MySQL, Redis                                                |
| **Frontend**  | React, TypeScript, Vite, Tailwind CSS, Zustand, React Query |
| **Infra**     | Docker, GitLab, NginX, AWS EC2                              |
| **협업 도구** | Notion, Slack, Figma, Swagger                               |

### 하이브리드 ORM 전략

- **JPA**: 기본 CRUD 및 엔티티 관계 활용
- **MyBatis**: 복잡한 동적 쿼리 및 성능 튜닝

---

## 👨‍💻 담당 역할

### Backend 핵심 기능 구현

#### 1. 세션 기반 커스텀 인증/인가 구조 설계

- 표준 FormLogin 대신 Controller + Service 레이어에서 인증 처리
- `SessionAuthenticationStrategy`를 수동 호출하여 세션 정책 적용
- `SessionRegistry` 기반 활성 세션 관리 및 중복 로그인 제어

**핵심 구현**

```java
// Spring Security 인증 플로우를 Service에서 직접 제어
private void performSecurityAuthentication(LoginDto req, User user,
    HttpServletRequest request, HttpServletResponse response) {

    // 1. 인증 토큰 생성 및 인증
    Authentication authentication = authenticationManager.authenticate(authToken);

    // 2. 세션 정책 수동 적용 (중복 로그인 제어, 세션 고정 방지)
    sessionAuthenticationStrategy.onAuthentication(authentication, request, response);

    // 3. SecurityContext 생성 및 저장
    SecurityContext context = securityContextHolderStrategy.createEmptyContext();
    context.setAuthentication(authentication);
    securityContextRepository.saveContext(context, request, response);
}
```

#### 2. 복잡한 검색 기능 성능 최적화

- JPA Specification에서 MyBatis 동적 SQL로 전환
- COUNT 쿼리를 `JOIN` 방식에서 `EXISTS` 서브쿼리로 개선
- 동적 조건을 OR 기반으로 통합하여 쿼리 템플릿 고정화

**개선 전략**

```xml
  ...
  OR EXISTS (
	  SELECT 1 FROM clients c
	  WHERE c.client_id = u.client_id
	  AND c.phone_number LIKE CONCAT('%', #{keyword}, '%')
  )
  ...
```

#### 3. API 표준화 및 협업 구조 구축

- 공통 Response/Exception 구조 설계
- Swagger 기반 API 문서 자동화
- 코드 컨벤션 정의 및 팀 내 공유

---

## 📊 주요 성과

### 🚀 성능 개선

| 개선 항목         | Before  | After   | 개선율      |
| ----------------- | ------- | ------- | ----------- |
| **평균 응답시간** | 24.56ms | 15.51ms | **36.8% ↓** |
| **최대 응답시간** | 473ms   | 54ms    | **88.5% ↓** |
| **처리량 (TPS)**  | 66.7    | 273.34  | **309% ↑**  |

### 🔐 보안 강화

- 세션 기반 인증/인가 커스텀 구현
- 계정 잠금, 실패 횟수, 첫 로그인 체크 등 비즈니스 로직 통합
- `SessionRegistry`를 활용한 활성 세션 관리

### 🤝 협업 효율성

- API 표준화로 FE 연동 시간 **30% 단축** (팀 피드백 기반)
- Swagger 문서 자동화로 커뮤니케이션 비용 감소

---

## 💡 기술적 의사결정

### 1. 왜 MyBatis를 도입했는가?

**문제 상황**

- JPA Specification으로 복잡한 검색 조건 구현 시:
  - Java 코드와 SQL 로직이 혼재되어 가독성 저하
  - 동적 조건 추가 시 코드 복잡도 증가
  - 쿼리 튜닝이 어려움

**해결 방법**

- **단순 CRUD는 JPA**, **복잡한 검색은 MyBatis**로 분리
- MyBatis 동적 SQL로 조건별 쿼리 최적화
- COUNT 쿼리를 EXISTS 서브쿼리로 변경하여 불필요한 JOIN 제거

**결과**

- 검색 API 평균 응답시간 **35% 개선**
- TPS **23% 향상**

### 2. 왜 커스텀 세션 인증을 구현했는가?

**문제 상황**

- 표준 FormLogin 필터로는:
  - 계정 잠금, 실패 횟수 증가, 첫 로그인 체크 등 복잡한 비즈니스 로직 처리 어려움
  - Admin/Customer 타입별 다른 응답 포맷 필요
  - JSON 기반 로그인 요청 처리 불가

**해결 방법**

- Controller + Service 레이어에서 인증 플로우 직접 제어
- `SessionAuthenticationStrategy`를 수동 호출하여 세션 정책 적용
- `SessionRegistry`로 활성 세션 추적

**결과**

- 비즈니스 로직을 서비스 레이어에서 유연하게 처리
- Admin/Customer별 커스텀 응답 가능
- 활성 세션 UI 제공

---

## 📚 배운 점

### 1. 기술 선택은 "문제 해결" 중심이어야 한다

- JPA가 항상 최선은 아니라는 점을 경험
- **문제 성격에 맞는 기술 선택의 중요성** 체감
- 복잡한 조회 로직에서는 SQL 중심 접근이 더 효율적임을 학습

### 2. 성능 문제는 구조에서 시작된다

- 단순한 쿼리 튜닝보다:
  - 도메인 설계
  - 조회 책임 분리
  - 적절한 계층화
- 이러한 구조적 접근이 성능 개선의 핵심

### 3. "동작하는 코드"와 "운영 가능한 코드"는 다르다

- 예외 처리, 인증, 로그, 확장성을 고려해야  
  실제 서비스에 가까운 코드가 된다는 점을 체감
- 관리자 서비스 특성상 **안정성과 가독성**이 중요함을 학습

### 4. Spring Security 내부 동작 이해

- 표준 필터 체인을 벗어나 커스텀 인증 구현 경험
- `SessionAuthenticationStrategy`, `SecurityContextRepository` 등  
  핵심 컴포넌트의 역할과 연계 방식 이해

---

## 🔗 상세 문서

각 항목의 상세 내용은 아래 링크에서 확인하실 수 있습니다:

- [프로젝트 상세 개요](./overview)
- [기술 스택 및 선택 이유](./tech-stack)
- [시스템 아키텍처](./architecture)
- [주요 기능](./features)
- [담당 역할 상세](./my-role)
- [성과 및 배운 점](./achievements)

### 트러블슈팅

- [세션 기반 커스텀 인증 구현](./troubleshooting/custom-session-implementation)
- [MyBatis 도입을 통한 검색 성능 개선](./troubleshooting/mybatis-dynamic-query-performance)

---

## 👥 협업 방식

### Notion 기반 애자일 스프린트

- 주간 스프린트 계획 및 회고
- 클라이언트 미팅 진행 및 요구사항 관리
- 팀별 일정 및 이슈 트래킹
- API 명세서 공유 (Swagger 통합)

### 코드 리뷰 문화

- GitLab을 통한 코드 리뷰
- 공통 코드 컨벤션 준수
- 기술 공유 세션 운영

---

## 📞 프로젝트 관련 문의

프로젝트에 대한 자세한 내용은 이력서의 연락처를 통해 문의해 주세요.
