import PortfolioBlogLinks from "@site/src/components/portfolio/PortfolioBlogLinks";
import ProjectOverview from "@site/src/components/portfolio/ProjectOverview";
import PortfolioSection from "@site/src/components/portfolio/PortfolioSection";
import PortfolioTroubleCard from "@site/src/components/portfolio/PortfolioTroubleCard";
import styles from "./portfolio.module.css";

export default function Portfolio() {
  return (
    <ProjectOverview
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
      <PortfolioSection title="2. 기술 스택 및 시스템 아키텍처">
        <ul className={styles.descList}>
          <li>
            <strong>기술 스택:</strong> Java 17, Spring Boot 3, PostgreSQL,
            Redis, Docker, Kubernetes
          </li>
          <ul>
            <li>
              <strong>redis</strong> TTL 기능을 활용하여 일회성 인증 코드의 자동
              소멸 및 메모리 관리 최적화.
            </li>
          </ul>
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
            <strong>디렉토리 구조</strong>
            <pre className={styles.codeBlock}>
              <code>
                {`├─ gateway/   # API Gateway
├─ auth/      # 인증 및 사용자 관리 서비스
├─ review/    # 리뷰 서비스
├─ tour/      # 관광지 정보 서비스
└─ util/      # LLM 서비스`}
              </code>
            </pre>
          </div>
        </div>
      </PortfolioSection>

      <PortfolioSection title="3. 핵심 문제 해결 및 성과">
        <PortfolioTroubleCard title="Trouble 1. 비동기 처리를 통한 성능 최적화">
          <h4>1) Problem</h4>
          <ul className={styles.descList}>
            <li>
              이메일 인증 API 응답 시간이 평균 <strong>2.5초</strong>
            </li>
            <li>
              SMTP 서버 통신이 <strong>동기 블로킹</strong> 방식으로 처리되어
              병목 발생
            </li>
          </ul>

          <h4>2) Action</h4>
          <ul className={styles.descList}>
            <li>
              Spring Event + <code>@Async</code> 기반 비동기 구조 도입
            </li>
            <li>회원가입 로직과 메일 발송 로직 분리</li>
            <li>별도 ThreadPool에서 이벤트 처리</li>
          </ul>

          <h4>3) Result</h4>
          <ul className={styles.descList}>
            <li>
              평균 응답시간 <strong>2.5s → 0.2s (92% 개선)</strong>
            </li>
            <li>처리량 약 10배 향상(10 req/s → 100+ req/s)</li>
            <li>회원가입의 이메일 인증 UX 개선</li>
          </ul>

          <h4>4) Deep Dive</h4>
          <ul className={styles.descList}>
            <li>
              관련 포스팅:
              <a
                href="/blog/spring-event-async-email-optimization"
                target="_blank"
                rel="noreferrer"
              >
                &nbsp;이메일 발송 API 응답 속도 개선: Spring Event와 비동기 처리
              </a>
            </li>
            <li>비동기로 분리된 서버 간 장애 격리 구조 이해</li>
            <li>
              <code>TransactionPhase.AFTER_COMMIT</code> 기반 데이터 정합성 처리
              학습
            </li>
          </ul>
        </PortfolioTroubleCard>
      </PortfolioSection>

      <PortfolioSection title="4. 관련 블로그 포스팅">
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
