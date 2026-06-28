import { ProjectProps } from "@site/src/components/resume/projectItem/ProjectItemType";

export const PROJECTS: ProjectProps[] = [
  // ✅ 1. Bargain Hunter
  {
    organization: "인턴 과제",
    title: "사내 메시지 발송 관리 서비스 마이그레이션 (Full Stack)",
    period: "2026.03.03 ~ 2026.06.02 (3개월)",
    role: "Java 백엔드 인턴 — 레거시 마이그레이션 및 기능 보강 (풀스택 수행)",
    stack:
      "Java 17, Spring Boot, Thymeleaf, JPA, QueryDSL, MariaDB, Oracle, Alpine.js",
    members: "3인",
    service: "SMS/알림톡 발송 내역을 관리하는 사내 웹서비스",
    flows: [
      {
        title: "멀티 데이터소스 환경에서의 발송 이력 조회",
        domain: "멀티 DB(Oracle + MariaDB) 발송 이력 조회",
        problem:
          "메타데이터(MariaDB)와 발송 이력(Oracle)이 분리되어 단일 쿼리 조인 불가",
        solution:
          "메타데이터 단일 DB 중앙화 및 데이터 규모 기반 IN절 인메모리 조인 채택으로",
        result: "메모리에서 조인 및 저장 트랜잭션 복잡도 최소화",
      },
      {
        title: "수기 운영 데이터의 정합성 문제 해소",
        domain: "조직/사용자 데이터 운영",
        problem: "논리적 FK와 수기 관리로 인한 상·하위 활성 상태 불일치",
        solution: "메타데이터 단일 DB 중앙화 및 계단식 soft-delete 자동화로",
        result: "정합성 불일치 87건(부서 245건 중) 해소 및 운영 휴먼에러 차단",
      },
    ],
    extras: [
      "레거시 스택(JSP + MyBatis) → Spring Boot + Thymeleaf + JPA/QueryDSL 마이그레이션 및 JSON API 기반 뷰 분리 설계",
      "평문 저장 비밀번호를 BCrypt로 일괄 마이그레이션하여 보안 취약점 해소",
      "@JsonView + ResponseBodyAdvice로 역할별 응답 필드 제어 (서버 단일 방어)",
      "Mockito 서비스 단위 테스트 및 Testcontainers/검증 DB로 Oracle 방언·bulk 처리 검증",
    ],
  },
  {
    organization: "팀 프로젝트",
    title: "Bargain Hunter (Full Stack)",
    period: "2025.07 ~ 2025.10 (4개월)",
    role: "인증/인가 마이크로서비스 설계 주도 및 사용자 도메인 담당",
    stack: "Java, Spring Boot, PostgreSQL, Redis, Docker, K8s",
    members: "4인",
    service: "지도를 활용한 국내 관광지 정보 제공 및 LLM 기반 가격 비교 서비스",
    flows: [
      {
        title: "비동기 이벤트 처리를 통한 이메일 인증 성능 최적화",
        domain: "이메일 인증 API",
        problem: "SMTP 연동 시 블로킹 발생으로 인한 응답 지연(2.5s)",
        solution: "Spring Event + @Async 비동기 처리 도입으로",
        result: "응답 시간 92% 개선 (0.2s) 및 처리량 10배 향상",
      },
    ],
    extras: [
      "Spring Cloud Gateway를 통한 중앙 집중형 JWT 검증 및 서비스 오버헤드 최소화",
      "Auth Service 담당자로서 전체 인증/인가 아키텍처 설계 주도",
      "OAuth2 PKCE 플로우 적용으로 인증 코드 가로채기 방지 및 보안 무결성 강화",
      "Redis HINCRBY을 활용한 동시성 제어",
    ],
  },

  // ✅ 2. Security Ticket
  {
    organization: "교육 내 팀 프로젝트",
    title: "Security Ticket (Back-End)",
    period: "2025.04 ~ 2025.05 (2개월)",
    role: "백엔드 API 설계 및 사용자 관리 도메인 개발",
    stack: "Java, Spring Boot, MySQL, MyBatis, Redis, Docker",
    members: "BE 8인, FE 3인",
    service: "수동 점검 프로세스를 디지털화한 웹 기반 관리 시스템",
    flows: [
      {
        title: "영속성 프레임워크 하이브리드 운영 및 쿼리 최적화",
        domain: "복합 조건 검색",
        problem: "JPA Specification 사용 시 쿼리 가독성 저하 및 성능 한계",
        solution: "MyBatis 하이브리드 도입 및 EXISTS 서브쿼리 최적화로",
        result: "평균 응답 시간 36% 개선 및 최대 응답 시간 88.5% 단축",
      },
    ],
    extras: [
      "Spring Security 커스텀 제어를 통해 복잡한 로그인 비즈니스 로직(잠금 등) 해결",
      "코드 컨벤션 정의, 공통 응답 및 예외 처리 표준화 주도",
      "팀 내 통합 API 규약 문서 작성 → BE/FE 협업 속도 및 구현 일관성 향상",
    ],
  },

  // ✅ 3. ReadyVery
  {
    organization: "교내 팀 프로젝트",
    title: "ReadyVery (Front-End)",
    period: "2023.12 ~ 2024.05 (5개월)",
    role: "프론트엔드 개발 및 API 인터페이스 설계",
    stack: "React, TypeScript, Recoil, Axios, React Query, Toss Payments SDK",
    members: "BE 2인, FE 4인",
    service: "로컬 카페용 패스트오더 서비스",
    extras: [
      "결제 SDK 라이프사이클 최적화 및 useRef 관리로 결제 로딩 시간 70% 단축(3s→1s)",
      "결제 모듈 연동 과정에서 데이터 정합성의 중요성을 체감하여 백엔드로 전향하는 계기 형성 ",
    ],
  },
];
