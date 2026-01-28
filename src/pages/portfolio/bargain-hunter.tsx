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
            가격 비교까지 가능한 서비스{" "}
          </p>
        </section>

        {/* 1. 프로젝트 요약 */}
        <section className={styles.section}>
          <h2>1. 프로젝트 요약</h2>
          <ul className={styles.descList}>
            <li>
              <strong>서비스 명 & 한 줄 정의:</strong> 지도를 활용한 관광 정보
              제공 및 가격 비교 서비스
            </li>
            <li>
              <strong>팀 구성 & 기간:</strong> 4인(BE 3, FE 1), 4개월
            </li>
            <li>
              <strong>나의 역할:</strong> 인증/인가 MSA 설계 및 유저 도메인 개발
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
              <strong>Tech Stack:</strong> Java 17, Spring Boot 3, PostgreSQL,
              Redis, Docker, Kubernetes
            </li>
            <li>
              <strong>Architecture:</strong> API Gateway + Microservices + DB +
              Redis Cache 구조
            </li>
          </ul>

          <div className={styles.imageBox}>
            <img
              src="/img/portfolio/architecture.png"
              alt="시스템 아키텍처 다이어그램"
            />
            <p className={styles.imageCaption}>
              전체 서비스 구조 (Gateway, Microservices, DB, Redis Cache)
            </p>
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
                응답 속도 <strong>2.5s → 0.2s (92% 개선)</strong>
              </li>
              <li>처리량 약 10배 향상</li>
              <li>회원가입 UX 대폭 개선</li>
            </ul>

            <h4>4) Deep Dive</h4>
            <ul className={styles.descList}>
              <li>비동기 예외 처리 Error Handler 구현</li>
              <li>
                <code>TransactionPhase.AFTER_COMMIT</code>로 데이터 정합성 보장
              </li>
              <li>
                관련 기술 블로그:
                <a href="https://hee-ya07.tistory.com/" target="_blank">
                  hee-ya07.tistory.com
                </a>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </Layout>
  );
}
