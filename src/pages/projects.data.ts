import { ProjectProps } from "@site/src/components/resume/projectItem/ProjectItemType";

export const PROJECTS: ProjectProps[] = [
  // ✅ 1. Bargain Hunter
  {
    organization: "팀 프로젝트",
    title: "Bargain Hunter (Full Stack)",
    period: "2025.07 ~ 2025.10 (4개월)",
    role: "인증/인가 마이크로서비스 설계 주도 및 사용자 도메인 담당",
    stack:
      "Java, Spring Boot, PostgreSQL, Redis, Docker, Kubernetes, Spring Cloud Gateway",
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
      {
        title: "Redis 원자적 연산을 활용한 분산 환경 동시성 제어",
        domain: "인증 코드 검증",
        problem: "분산 환경에서 시도 횟수 카운팅 Race Condition",
        solution: "Redis Hash 구조 및 HINCRBY 원자적 연산 활용으로",
        result: "동시성 이슈 해결 및 데이터 정합성 보장",
      },
      {
        title: "보안 취약점 방어 및 즉시 토큰 무효화 아키텍처 구축",
        domain: "시스템 보안",
        problem: "JWT 탈취 시 무효화 불가 및 Auth Code 가로채기 위협",
        solution: "Refresh Token DB 저장 및 OAuth2 PKCE 플로우 적용으로",
        result: "보안 취약점 방어 및 즉시 토큰 무효화 체계 구축",
      },
    ],
    extras: [
      "Spring Cloud Gateway를 통한 중앙 집중형 JWT 검증 및 서비스 오버헤드 최소화",
      "Auth Service 담당자로서 전체 인증/인가 아키텍처 설계 주도",
    ],
  },

  // ✅ 2. Security Ticket
  {
    organization: "교육 내 팀 프로젝트",
    title: "Security Ticket (Back-End)",
    period: "2025.04 ~ 2025.05 (2개월)",
    role: "백엔드 API 설계 및 사용자 관리 도메인 개발",
    stack:
      "Java, Spring Boot, MySQL, JPA, MyBatis, Redis, Docker, NginX, gitLab",
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

  // ✅ 3. ReadyBerry
  {
    organization: "교내 팀 프로젝트",
    title: "ReadyBerry (Front-End)",
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
