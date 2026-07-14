import PortfolioBlogLinks from "@site/src/components/portfolio/PortfolioBlogLinks";
import PortfolioSection from "@site/src/components/portfolio/PortfolioSection";
import PortfolioTroubleCard from "@site/src/components/portfolio/PortfolioTroubleCard";
import ProjectOverview from "@site/src/components/portfolio/ProjectOverview";
import styles from "./portfolio.module.css";

type PortfolioProps = { embedded?: boolean };

export default function Portfolio({ embedded = false }: PortfolioProps) {
  return (
    <ProjectOverview
      embedded={embedded}
      projectName="Bargain Hunter"
      summary="지도를 활용해 국내 관광지를 탐색하고 LLM 기반 가격 비교 기능을 제공하는 서비스"
      period="2025.07 - 2025.10"
      team="4인 (BE 3인 / FE 1인)"
      role="인증·인가 아키텍처 및 사용자 도메인 담당"
      stack={[
        "Java 17",
        "Spring Boot 3",
        "Spring Cloud Gateway",
        "PostgreSQL",
        "Redis",
        "Docker",
        "Kubernetes",
      ]}
      links={[
        {
          label: "GitHub",
          href: "https://github.com/JocketDan/jocketdanBackend",
        },
      ]}
      achievements={[
        "이메일 인증 API 응답시간 92% 단축 (2.5초 → 0.2초)",
        "Gateway 공통 JWT 검증과 Auth Service 책임 분리",
      ]}
    >
      <PortfolioSection title="1. 시스템 아키텍처">
        <ul className={styles.descList}>
          <li>
            <strong>redis</strong> TTL 기능을 활용하여 일회성 인증 코드의 만료를
            자동화하고, 유효 시간이 지난 코드를 별도 삭제 작업 없이 정리
          </li>
          <li>
            <strong>구조:</strong> API Gateway + Microservices + DB + Redis
            Cache 구조
          </li>
        </ul>

        <div className={styles.archGrid}>
          <div>
            <img
              src="/img/portfolio/bargain-hunter/system-architecture.png"
              className={styles.archImage}
              alt="시스템 다이어그램"
            />
          </div>

          <div>
            <strong>구조</strong>
            <pre className={styles.codeBlock}>
              <code>
                {`Gateway
- JWT 검증
- 사용자 식별자 전달
- 라우팅

Auth Service
- 로그인
- 토큰 발급·재발급
- 이메일 인증
- 사용자 상태 확인`}
              </code>
            </pre>
          </div>
        </div>
      </PortfolioSection>

      <PortfolioSection title="2. 핵심 문제 해결 및 성과">
        <PortfolioTroubleCard title="Case 1. SMTP 대기 시간을 사용자 응답 경로에서 분리">
          <h4>1) 문제 맥락</h4>
          <ul className={styles.descList}>
            <li>
              이메일 인증 API의 평균 응답 시간이 <strong>2.5초</strong>였습니다.
            </li>
            <li>
              SMTP 서버 통신이 <strong>동기 블로킹</strong> 방식으로 처리되어
              병목이 발생했습니다.
            </li>
          </ul>

          <h4>2) 선택 기준과 구현</h4>
          <ul className={styles.descList}>
            <li>
              Spring Event와 <code>@Async</code> 기반 비동기 구조를
              도입했습니다.
            </li>
            <li>회원가입 로직과 메일 발송 로직을 분리했습니다.</li>
            <li>@Async를 통해 별도 스레드에서 SMTP 통신을 처리했습니다.</li>
          </ul>

          <h4>3) 검증 결과</h4>
          <ul className={styles.descList}>
            <li>
              평균 응답시간
              <mark className={styles.keyHighlight}>
                2.5s → 0.2s (92% 개선)
              </mark>
              {"으로 단축했습니다."}
            </li>
            <li>처리량을 약 10배 향상했습니다(10 req/s → 100+ req/s).</li>
            <li>회원가입 과정의 이메일 인증 UX를 개선했습니다.</li>
          </ul>

          <h4>4) 설계 회고</h4>
          <ul className={styles.descList}>
            <li>
              회원가입 요청 흐름과 SMTP 메일 발송 책임을 분리해, 외부 I/O 지연과
              사용자 응답을 분리
            </li>
            <li>
              <code>TransactionPhase.AFTER_COMMIT</code> 기반 데이터 정합성 처리
              학습
            </li>
          </ul>
        </PortfolioTroubleCard>

        <PortfolioTroubleCard title="Case 2. Gateway와 Auth Service의 인증 책임 분리">
          <h4>1) 문제 맥락</h4>
          <ul className={styles.descList}>
            <li>
              마이크로서비스마다 JWT 검증을 구현하면 인증 코드와 보안 정책이
              중복되고, 정책 변경 시 여러 서비스를 함께 수정해야 했습니다.
            </li>
            <li>
              반대로 Gateway가 로그인과 토큰 발급까지 담당하면 사용자 도메인과
              라우팅 계층의 책임이 섞이는 문제가 발생할 수 있습니다.
            </li>
          </ul>

          <h4>2) 선택 기준과 구현</h4>
          <ul className={styles.descList}>
            <li>
              <mark className={styles.keyHighlight}>
                Gateway는 JWT 검증과 사용자 식별자 전달만 담당
              </mark>
              하도록 공통 필터를 구성했습니다.
            </li>
            <li>
              로그인, 토큰 발급·재발급과 사용자 상태 확인은
              <mark className={styles.keyHighlight}>Auth Service가</mark>
              책임지도록 했습니다.
            </li>
            <li>
              인증이 필요 없는 경로를 명시적으로 관리하고, 내부 서비스에는
              검증된 사용자 정보를 헤더로 전달했습니다.
            </li>
          </ul>

          <h4>3) 검증 결과</h4>
          <ul className={styles.descList}>
            <li>
              서비스별 중복 JWT 검증 로직을 제거하고 인증 정책의 변경 지점을
              축소
            </li>
            <li>
              라우팅 계층과 사용자 도메인의 경계를 유지해 신규 서비스 추가 시
              인증 적용을 단순화
            </li>
          </ul>

          <h4>4) 설계 회고</h4>
          <ul className={styles.descList}>
            <li>
              Gateway가 전달하는 헤더를 외부 요청이 위조하지 못하도록 내부
              네트워크 경계와 헤더 제거 정책이 함께 필요하다는 점을 설계
              조건으로 정리했습니다.
            </li>
          </ul>
        </PortfolioTroubleCard>
      </PortfolioSection>

      <PortfolioSection title="3. 관련 블로그 포스팅">
        <PortfolioBlogLinks
          items={[
            {
              href: "/blog/spring-event-async-email-optimization",
              label:
                "이메일 발송 API 응답 속도 개선: Spring Event와 비동기 처리",
              description: "회원가입 인증 비동기 구조 설계 & 성능 최적화",
            },
            {
              href: "/blog/redis-concurrency",
              label: "Redis HINCRBY로 Race Condition 해결하기",
              description: "분산 환경에서 인증 시도 횟수 동시성 제어",
            },
            {
              href: "/blog/redis-email-verification",
              label: "이메일 인증에서 Redis가 강점을 갖는 이유",
              description: "이메일 인증에 Redis를 사용하는 이유와 설계 포인트",
            },
          ]}
        />
      </PortfolioSection>
    </ProjectOverview>
  );
}
