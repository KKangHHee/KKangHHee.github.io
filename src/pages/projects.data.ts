import { ProjectProps } from "@site/src/components/resume/projectItem/ProjectItemType";

export const PROJECTS: ProjectProps[] = [
  // ✅ 1. Bargain Hunter
  {
    organization: "팀 프로젝트",
    title: "Bargain Hunter (MSA 기반 여행 플랫폼)",
    period: "2025.07 ~ 2025.10 (4개월)",
    role: "ee",
    stack:
      "Java 17, Spring Boot 3, PostgreSQL, Redis, Docker, Kubernetes, Spring Cloud Gateway",
    members: "4인",
    service: "지도를 활용한 국내 관광지 정보 제공 및 LLM 기반 가격 비교 서비스",
    flows: [
      {
        domain: "이메일 인증 API",
        problem: "SMTP 연동 시 블로킹 발생으로 인한 응답 지연(2.5s)",
        solution: "Spring Event + @Async 비동기 처리 도입으로",
        result: "응답 시간 92% 개선 (0.2s) 및 처리량 10배 향상",
      },
      {
        domain: "인증 코드 검증",
        problem: "분산 환경에서 시도 횟수 카운팅 Race Condition",
        solution: "Redis Hash 구조 및 HINCRBY 원자적 연산 활용으로",
        result: "동시성 이슈 해결 및 데이터 정합성 보장",
      },
      {
        domain: "시스템 보안",
        problem: "JWT 탈취 시 무효화 불가 및 Auth Code 가로채기 위협",
        solution: "Refresh Token DB 저장 및 OAuth2 PKCE 플로우 적용으로",
        result: "보안 취약점 방어 및 즉시 토큰 무효화 체계 구축",
      },
    ],
    extras: [
      "Spring Cloud Gateway를 통한 중앙 집중형 JWT 검증 및 서비스 오버헤드 제거",
      "Kubernetes 환경에서 서비스별 독립 배포 및 GitHub Actions CI/CD 파이프라인 구축",
      "Auth Service 담당자로서 전체 인증/인가 아키텍처 설계 주도",
    ],
  },

  // ✅ 2. Security Ticket
  {
    organization: "교육 내 팀 프로젝트",
    title: "Security Ticket (컴플라이언스 점검 플랫폼)",
    period: "2025.04 ~ 2025.05 (2개월)",
    role: "ee",

    stack:
      "Java 17, Spring Boot 3, MySQL, JPA, MyBatis, Redis, Spring Security",
    members: "BE 8인, FE 3인",
    service: "Excel 기반의 수동 점검 프로세스를 자동화한 웹 기반 관리 시스템",
    flows: [
      {
        domain: "복합 조건 검색",
        problem: "JPA Specification 사용 시 쿼리 가독성 저하 및 성능 한계",
        solution: "MyBatis 하이브리드 도입 및 EXISTS 서브쿼리 최적화로",
        result: "평균 응답 시간 36% 개선 및 최대 응답 시간 88.5% 단축",
      },
      {
        domain: "사용자 인증",
        problem:
          "표준 필터로 처리 어려운 복잡한 로그인 비즈니스 로직(잠금, 첫 로그인 등)",
        solution: "SecurityContext 및 SessionStrategy 커스텀 제어로",
        result: "유연한 인증 플로우 확보 및 중복 로그인 제어 구현",
      },
    ],
    extras: [
      "폐쇄망 온프레미스 환경에 맞춘 Nexus 패키지 관리 및 배포 대응",
      "Swagger(Springdoc) 도입으로 프론트엔드 연동 시간 30% 단축",
      "사용자 관리 도메인 담당 및 데이터 모델링 수행",
    ],
  },

  // ✅ 3. ReadyBerry
  {
    organization: "교내 팀 프로젝트",
    title: "ReadyBerry (선결제 테이크아웃 서비스)",
    period: "2023.12 ~ 2024.05 (5개월)",
    role: "ee",
    stack: "React, TypeScript, Recoil, Axios, React Query, Toss Payments SDK",
    members: "BE 2인, FE 4인",
    service: "로컬 카페용 패스트오더 서비스",
    flows: [
      {
        domain: "결제 시스템 연동",
        problem:
          "잘 못 사용된 Toss SDK 초기화 및 중복 실행으로 인한 화면 깜빡임 및 로딩 지연",
        solution: "useEffect 의존성 최적화 및 useRef 인스턴스 관리로",
        result: "결제 로딩 시간 70% 단축 (3s → 1s)",
      },
    ],
    extras: [
      "사용자향 페이지 개발",
      "교내 축제 및 학교 인근 카페 2곳 실사용 배포 및 운영",
      "사용자 피드백 기반 UI/UX 개선을 통한 주문 완료 이탈률 감소",
      "API 설계 과정에서 데이터 정합성의 중요성을 체감하여 백엔드로 전향하는 계기 형성",
    ],
  },
];
