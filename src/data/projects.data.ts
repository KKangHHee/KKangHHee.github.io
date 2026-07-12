import { ProjectProps } from "@site/src/components/resume/projectItem/ProjectItemType";

export const PROJECTS: ProjectProps[] = [
  // ✅ 1. 웅진 인턴
  {
    organization: "인턴",
    title: "사내 메시지 발송 관리 서비스 마이그레이션",
    period: "2026.03 ~ 2026.06",
    service: "SMS/알림톡 발송 이력과 조직/채널 정보를 관리하는 사내 웹서비스",
    role: "레거시 마이그레이션 및 운영 기능 개선",
    members: "3인",

    stack: [
      "Java 17, Spring Boot, JPA, QueryDSL, MariaDB, Oracle, Thymeleaf, Alpine.js",
    ],
    highlights: [
      {
        title: "멀티 DB 조회 구조 설계",
        description:
          "Oracle 발송 이력과 MariaDB 조직 정보가 분리된 환경에서 후보 ID 조회 → Oracle IN 조회 → 애플리케이션 매핑 구조를 적용해 회사·사용자 기준 발송 이력 조회를 구현했습니다.",
      },
      {
        title: "수기 운영 데이터 시스템화",
        description:
          "수기 처리로 관리되던 조직 정보를 웹 기반 관리 기능으로 전환하고 논리적 연관 관계를 부여하고, 계단식 soft-delete를 적용해 부서 데이터의 상·하위 상태 불일치를 정비했습니다.",
      },
      {
        title: "마이그레이션 및 보안 개선",
        description:
          "JSP·MyBatis 기반 기능을 Spring Boot·JPA/QueryDSL 구조로 전환하고, 보안 취약점 해소를 위해 평문 비밀번호 BCrypt 이관하였습니다.",
      },
      {
        title: "Alpine.js 도입을 통한 UI 로직 간소화",
        description:
          "Thymeleaf 기반 화면에 Alpine.js를 도입하여 DOM 조회, 이벤트 처리, UI 상태 변경을 선언형 방식으로 전환하고 반복적인 JavaScript 코드와 유지보수 부담을 줄였습니다.",
      },
    ],
  },
  {
    organization: "팀 프로젝트",
    title: "Bargain Hunter",
    period: "2025.07 ~ 2025.10",
    service: "관광지 탐색과 LLM 기반 가격 비교 기능을 제공하는 서비스",
    role: "인증/인가 아키텍쳐 및 사용자 도메인 담당",
    members: "4인",
    stack: [
      "Java",
      "Spring Boot",
      "Spring Cloud Gateway",
      "PostgreSQL",
      "Redis",
      "Docker",
    ],
    highlights: [
      {
        title: "비동기 처리로 이메일 인증 응답 시간 단축",
        description:
          "SMTP 통신으로 API 응답이 평균 2.5초간 지연되는 문제를 Spring Event와 @Async 기반 비동기 처리로 분리해 사용자 응답 시간을 약 0.2초로 단축했습니다.",
      },
      {
        title: "Gateway 기반 JWT 인증 책임 분리",
        description:
          "Gateway의 공통 JWT 검증과 Auth Service의 인증 책임을 분리해 서비스별 중복 인증 로직과 처리 부담을 줄였습니다.",
      },
    ],
  },

  // ✅ 2. Security Ticket
  {
    organization: "팀 프로젝트",
    title: "Security Ticket",
    period: "2025.04 ~ 2025.05",
    service:
      "Excel·이메일 중심의 수동 점검 프로세스를 디지털화한 웹 기반 관리 시스템",
    role: "사용자 관리 도메인 및 백엔드 API 설계",
    members: "BE 8인 · FE 3인",
    stack: [
      "Java",
      "Spring Boot",
      "Spring Security",
      "JPA",
      "MyBatis",
      "MySQL",
      "Redis",
    ],
    highlights: [
      {
        title: "복합 검색 응답 성능 36.8% 개선",
        description:
          "기간·키워드·정렬 조건이 결합된 복합 조회에 MyBatis 동적 SQL을 적용하고 조건 구조를 단순화했습니다. COUNT 쿼리의 연관 테이블 JOIN을 EXISTS로 변경해 평균 응답 시간을 24.45ms에서 15.51ms로 단축했습니다.",
      },
      {
        title: "세션 기반 커스텀 인증 흐름 구현",
        description:
          "JSON 로그인, 로그인 실패 횟수, 계정 잠금, 최초 로그인 여부 등 비즈니스 요구사항을 반영하기 위해 Spring Security의 인증 흐름을 확장했습니다.",
      },
      {
        title: "백엔드 협업 기준 표준화",
        description:
          "8명의 백엔드 개발자가 일관된 방식으로 API를 구현할 수 있도록 공통 응답·예외 처리 구조와 코드 컨벤션을 정리하고, 프론트엔드 협업을 위한 통합 API 규약 문서를 작성했습니다.",
      },
    ],
  },

  // ✅ 3. ReadyVery
  {
    organization: "팀 프로젝트",
    title: "ReadyVery",
    period: "2023.12 ~ 2024.05",
    service: "로컬 카페의 사전 주문과 결제를 지원하는 패스트오더 서비스",
    role: "프론트엔드 개발 및 API 인터페이스 설계",
    members: "BE 2인 · FE 4인",
    stack: [
      "React",
      "TypeScript",
      "React Query",
      "Recoil",
      "Toss Payments SDK",
    ],
    highlights: [
      {
        title: "결제 SDK 생명주기 개선",
        description:
          "상태 변경마다 Toss Payments SDK가 반복 초기화되는 문제를 확인하고 인스턴스를 useRef로 관리해 결제 로딩 시간을 약 3초에서 1초로 단축했습니다.",
      },
      {
        title: "실사용 서비스 운영",
        description:
          "대학 축제와 인근 카페 2곳에서 서비스를 운영하며 점주·사용자의 피드백을 반영했고, 데이터 정합성과 운영 안정성의 중요성을 체감했습니다.",
      },
    ],
  },
];
