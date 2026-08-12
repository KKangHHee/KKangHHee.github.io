import { ProjectProps } from "@site/src/components/resume/projectItem/ProjectItemType";

export const PROJECTS: ProjectProps[] = [
  // ✅ 1. 웅진 인턴
  {
    organization: "웅진 · 그룹IT혁신팀 인턴",
    title: "사내 메시지 발송 관리 서비스 마이그레이션",
    period: "2026.03 - 2026.06",
    service:
      "기존 메시지 관리 서비스를 마이그레이션하며 운영·데이터·조회 구조를 개선한 사내 웹서비스",
    role: "기존 서비스 분석, 백엔드 개발 및 관리자 화면 구현",
    members: "3인",
    stack: [
      "Java 17",
      "Spring Boot",
      "JPA",
      "QueryDSL",
      "Oracle",
      "MariaDB",
      "Thymeleaf",
      "Alpine.js",
    ],
    highlights: [
      {
        title: "수기 메타데이터 관리 시스템화",
        description:
          "SQL로 직접 관리하던 회사·부서·사용자·채널 정보를 웹 기반 CRUD로 전환하고, 계단식 soft-delete와 변경 이력을 적용해 상·하위 상태 불일치를 정비했습니다.",
      },
      {
        title: "메타데이터 일원화와 서비스 레벨 조인",
        description:
          "Oracle과 MariaDB에 중복 관리되던 메타데이터를 MariaDB로 일원화해 이중 저장에 따른 정합성 관리 부담을 줄였습니다. 조회 시에는 MariaDB 후보 ID 조회 → Oracle 발송 이력 조회 → 서비스 계층 매핑 구조로 회사·사용자 기준 조회를 구현했습니다.",
      },
      {
        title: "변화하는 발송 이력의 조회 기준 고정",
        description:
          "최초 조회 시점의 정렬 기준을 앵커로 고정하고, 이후 유입된 데이터는 신규 건수로 별도 표시해 페이지 이동 중 조회 기준이 변하는 문제를 줄였습니다.",
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
    period: "2025.07 - 2025.10",
    service: "관광지 탐색과 LLM 기반 가격 비교 기능을 제공하는 서비스",
    role: "인증·인가 아키텍처 및 사용자 도메인 담당",
    members: "BE 4인 / FE 1인",
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
        title: "외부 I/O 분리를 통한 이메일 인증 요청 경로 개선",
        description:
          "이메일 인증 과정에서 SMTP 통신이 사용자 요청 처리 경로를 점유하는 구조를 개선했습니다. Spring Event와 @Async를 활용해 메일 발송을 비동기 후처리로 분리하여, 인증 요청 API가 SMTP 처리 완료를 기다리지 않고 응답하도록 구성했습니다.",
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
    organization: "교육 내 팀 프로젝트",
    title: "Security Ticket",
    period: "2025.04 - 2025.05",
    service:
      "Excel·이메일 중심의 수동 점검 프로세스를 디지털화한 웹 기반 관리 시스템",
    role: "사용자 관리 도메인 및 백엔드 API 설계",
    members: "BE 8인 / FE 3인",
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
        title: "복합 검색 쿼리 구조 개선",
        description:
          "기간·키워드·정렬 조건이 결합된 복합 조회에 MyBatis 동적 SQL을 적용하고 조건 구조를 단순화했습니다. COUNT 쿼리의 연관 테이블 JOIN을 EXISTS로 변경했으며, 동일한 로컬 테스트 조건에서 평균 응답 시간을 24.45ms에서 16.85ms로 줄였습니다.",
      },
      {
        title: "JSON 로그인 및 계정 정책 처리",
        description:
          "프로젝트의 JSON API 형식에 맞춰 로그인 엔드포인트를 구성하고, 계정 잠금과 최초 로그인 정책을 서비스 계층에서 처리했습니다.",
      },
    ],
  },

  // ✅ 3. ReadyVery
  {
    organization: "팀 프로젝트",
    title: "ReadyVery",
    period: "2023.12 - 2024.05",
    service: "로컬 카페의 사전 주문과 결제를 지원하는 패스트오더 서비스",
    role: "프론트엔드 개발 및 API 인터페이스 설계",
    members: "개발팀 BE 2인 / FE 4인",
    stack: [
      "React",
      "TypeScript",
      "React Query",
      "Recoil",
      "Toss Payments SDK",
    ],
    highlights: [
      {
        title: "실사용 서비스 운영",
        description:
          "대학 축제와 인근 카페 2곳에서 서비스를 운영하며 점주·사용자의 피드백을 반영했고, 데이터 정합성과 운영 안정성의 중요성을 체감했습니다.",
      },
    ],
  },
];
