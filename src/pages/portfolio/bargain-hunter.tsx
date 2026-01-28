import Layout from "@theme/Layout";
import styles from "./portfolio.module.css";

export default function Portfolio() {
  return (
    <Layout title="Project Portfolio">
      <main className={styles.container}>
        {/* 프로젝트 타이틀 */}
        <section className={styles.header}>
          <h1 className={styles.title}>Bargain Hunter</h1>
          <p className={styles.subtitle}>
            전국의 관광지, 문화명소를 지도로 탐색하고, 리뷰를 남기며, LLM 기반
            가격 비교까지 가능한 서비스
          </p>
        </section>

        {/* 1. 프로젝트 요약 */}
        <section className={styles.section}>
          <h2>1. 프로젝트 요약</h2>
          <ul className={styles.descList}>
            <li>
              <strong>한 줄 정의:</strong> 지도를 활용한 국내 관광지 정보 제공
              및 LLM 기반 가격 비교 서비스
            </li>
            <li>
              <strong>
                <a
                  href="https://github.com/JocketDan/jocketdanBackend"
                  target="_blank"
                >
                  GitHub 주소
                </a>
              </strong>
            </li>
            <li>
              <strong>팀 구성:</strong> 4인(BE 3, FE 1)
            </li>
            <li>
              <strong>기간:</strong> 2025.07 ~ 2025.10 (4개월)
            </li>
            <li>
              <strong>나의 역할:</strong> 인증/인가 MSA 설계 및 유저 도메인 개발
              <ol>
                <li>
                  Spring Cloud Gateway를 통한 중앙 집중형 JWT 검증 및 서비스
                  오버헤드 최소화
                </li>
                <li>
                  Auth Service 담당자로서 전체 인증/인가 아키텍처 설계 주도
                </li>
                <li>
                  OAuth2 PKCE 플로우 적용으로 Authorization Code Interception
                  방지 - 추후 모바일 앱으로 확장 고려
                </li>
                <li>Redis HINCRBY을 활용한 동시성 제어</li>
              </ol>
            </li>
            <li>
              <strong>핵심 성과:</strong> 이메일 인증 응답 속도 92% 개선, 인증
              보안 무결성 강화
            </li>
          </ul>
        </section>

        {/* 2. 기술 스택 & 아키텍처 */}
        <section className={styles.section}>
          <h2>2. 기술 스택 및 시스템 아키텍처</h2>

          <ul className={styles.descList}>
            <li>
              <strong>기술 스택:</strong> Java 17, Spring Boot 3, PostgreSQL,
              Redis, Docker, Kubernetes
            </li>
            <ul>
              <li>
                <strong>redis</strong>TTL 기능을 활용하여 일회성 인증 코드의
                자동 소멸 및 메모리 관리 최적화.
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
                src="/img/portfolio/bargain-hunter/img/system-architecture.png"
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

              {/* 필요하면 여기 인증 구조도 추가 */}
            </div>
          </div>
        </section>

        {/* 3. 핵심 문제 해결 */}
        <section className={styles.section}>
          <h2>3. 핵심 문제 해결 및 성과</h2>

          <div className={styles.troubleBox}>
            <h3> Trouble 1. 비동기 처리를 통한 성능 최적화</h3>

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
                >
                  &nbsp;이메일 발송 API 응답 속도 개선: Spring Event와 비동기
                  처리
                </a>
              </li>
              <li>비동기로 분리된 서버 간 장애 격리 구조 이해</li>
              <li>
                <code>TransactionPhase.AFTER_COMMIT</code> 기반 데이터 정합성
                처리 학습
              </li>
            </ul>
          </div>
        </section>
        <section className={styles.section}>
          <h2>4. 관련 블로그 포스팅</h2>

          <ul className={styles.descList}>
            <li>
              <a
                href="/blog/spring-event-async-email-optimization"
                target="_blank"
              >
                이메일 발송 API 응답 속도 개선: Spring Event와 비동기 처리
              </a>
              <span className={styles.blogDesc}>
                – 회원가입 인증 비동기 구조 설계 & 성능 최적화
              </span>
            </li>

            <li>
              <a href="/blog/redis-concurrency" target="_blank">
                Redis HINCRBY로 Race Condition 해결하기
              </a>
              <span className={styles.blogDesc}>
                – 분산 환경에서 인증 시도 횟수 동시성 제어
              </span>
            </li>

            <li>
              <a href="/blog/redis-email-verification" target="_blank">
                이메일 인증에서 Redis가 강점을 갖는 이유
              </a>
              <span className={styles.blogDesc}>
                - 이메일 인증에 Redis를 사용하는 이유와 설계 포인트
              </span>
            </li>
          </ul>
        </section>
      </main>
    </Layout>
  );
}
