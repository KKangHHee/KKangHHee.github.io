import Layout from "@theme/Layout";
import styles from "./portfolio.module.css";

export default function Portfolio() {
  return (
    <Layout title="Project Portfolio">
      <main className={styles.container}>
        {/* 프로젝트 타이틀 */}
        <section className={styles.header}>
          <h1 className={styles.title}>Security Ticket</h1>
          <p className={styles.subtitle}>
            수동 점검 프로세스를 디지털화한 웹 기반 관리 시스템
          </p>
        </section>

        {/* 1. 프로젝트 요약 */}
        <section className={styles.section}>
          <h2>1. 프로젝트 요약</h2>
          <ul className={styles.descList}>
            <li>
              <strong>한 줄 정의:</strong> Excel·이메일 중심의 수동 프로세스 →
              웹 기반 자동화 전환
            </li>
            <li>
              <strong>팀 구성:</strong> BE 8명 (A팀 4명, B팀 4명), FE 3명
            </li>
            <li>
              <strong>기간:</strong> 2025.04 ~ 2025.05 (2개월)
            </li>
            <li>
              <strong>나의 역할:</strong> 백엔드 API 설계 및 사용자 관리 도메인
              개발
              <ol>
                <li>코드 컨벤션 정의, 공통 응답 및 예외 처리 표준화 주도</li>
                <li>
                  팀 내 통합 API 규약 문서 작성 → BE/FE 협업 속도 및 구현 일관성
                  향상
                </li>
              </ol>
            </li>
            <li>
              <strong>핵심 성과:</strong> MyBatis 하이브리드 도입을 통한 복합
              검색 최적화
            </li>
          </ul>
        </section>

        {/* 2. 기술 스택 & 아키텍처 */}
        <section className={styles.section}>
          <h2>2. 기술 스택 및 시스템 아키텍처</h2>

          <ul className={styles.descList}>
            <li>
              <strong>기술 스택:</strong> Java, Spring Boot 3, MySQL, Redis,
              Docker, GitLab, nginX
            </li>
            <ul>
              <li>
                <strong>GitLab, nginX: </strong>폐쇄망 기반 온프레미스 + Nexus로
                패키지 관리
              </li>
            </ul>
            <li>
              <strong>구조:</strong> On-Premises 기반 개발/운영 존 분리 구조
            </li>
          </ul>

          <div className={styles.archGrid}>
            <div>
              <img
                src="/img/portfolio/security-ticket/system-architecture.svg"
                className={styles.archImage}
                alt="시스템 다이어그램"
              />
            </div>
            <div>
              <strong>ERD</strong>
              <img
                src="/img/portfolio/security-ticket/erd.png"
                className={styles.archImage}
                alt="시스템 다이어그램"
              />
            </div>
          </div>
          <strong>Flow chart</strong>
          <div>
            <img
              src="/img/portfolio/security-ticket/flow-chart.svg"
              className={styles.archImage2}
              alt="시스템 다이어그램"
            />
          </div>
        </section>

        {/* 3. 핵심 문제 해결 */}
        <section className={styles.section}>
          <h2>3. 핵심 문제 해결 및 성과</h2>

          <div className={styles.troubleBox}>
            <h3>
              {" "}
              Trouble 1. MyBatis 하이브리드 도입 및 EXISTS 서브쿼리를 통한 복합
              검색 최적화
            </h3>

            <h4>1) Problem</h4>
            <ul className={styles.descList}>
              <li>복합 조건 검색 시, JPA Specification 사용 시,</li>
              <li>
                가독성 저하, 복잡한 쿼리 작성의 어려움, 쿼리 튜닝의 어려움 등
                한계 발생
              </li>
            </ul>

            <h4>2) Action</h4>
            <ul className={styles.descList}>
              <li>
                <code> MyBatis</code>의 부분적 도입을 통한 성능 향상
              </li>
              <li>
                추가 1) choose 중첩 →{" "}
                <strong>OR 조건 통합을 통한 쿼리 재사용성 향상</strong>
              </li>
              <li>
                추가 2) JOIN →{" "}
                <strong>EXISTS 서브쿼리 기반 카운팅을 통한 쿼리 최적화</strong>
              </li>
            </ul>

            <h4>3) Result</h4>
            <div className={styles.archGrid}>
              <div>
                <strong>그래프</strong>

                <img
                  src="/img/portfolio/security-ticket/img/mybatis_성능.png"
                  className={styles.archImage}
                  alt="성능 그림"
                />
              </div>
              <div>
                <strong>표</strong>
                <table className={styles.perfTable}>
                  <thead>
                    <tr>
                      <th>항목</th>
                      <th>JPA Specification</th>
                      <th>MyBatis (최종)</th>
                      <th>개선율</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>평균 응답시간</td>
                      <td>24.45ms</td>
                      <td>15.51ms</td>
                      <td className={styles.down}>36.8% ↓</td>
                    </tr>
                    <tr>
                      <td>최대 응답시간</td>
                      <td>83.67ms</td>
                      <td>54ms</td>
                      <td className={styles.down}>35% ↓</td>
                    </tr>
                    <tr>
                      <td>처리량 (TPS)</td>
                      <td>221.77</td>
                      <td>273.34</td>
                      <td className={styles.up}>23% ↑</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <ul className={styles.descList}>
              <li>
                평균 응답시간: <strong>24.56ms → 15.51ms (36.8% 개선)</strong>
              </li>
              <li>
                최대 응답시간: <strong>473ms → 54ms (88.5% 단축)</strong>
              </li>
              <li>
                처리량: <strong>66.7 TPS → 273 TPS (약 3.9배 향상)</strong>
              </li>
              <li>복합 검색 조건에서도 안정적인 응답 시간 유지</li>
            </ul>

            <h4>4) Deep Dive</h4>
            <ul className={styles.descList}>
              <li>
                <a href="/blog/jpa-mybatis-hybrid-strategy" target="_blank">
                  상황에 따른 구조적 접근 경험 (MyBatis)
                </a>
              </li>
              <li>
                <a
                  href="/blog/spring-boot-custom-session-authentication"
                  target="_blank"
                >
                  커스텀 세션 로그인 구조 설계 & 요구 사항 적용
                </a>
              </li>{" "}
              <li>Spring Security 내부 동작 이해</li>
            </ul>
          </div>
        </section>
        <section className={styles.section}>
          <h2>4. 관련 블로그 포스팅</h2>

          <ul className={styles.descList}>
            <li>
              <a
                href="/blog/spring-boot-custom-session-authentication"
                target="_blank"
              >
                Spring Boot에서 Session 인증을 커스텀하는 이유와 실전 구현{" "}
              </a>
              <span className={styles.blogDesc}>
                – 로그인 구조 설계 & 요구 사항 적용
              </span>
            </li>

            <li>
              <a href="/blog/jpa-mybatis-hybrid-strategy" target="_blank">
                JPA vs MyBatis 성능 비교와 하이브리드 전략
              </a>
              <span className={styles.blogDesc}>
                – 동적 쿼리에서 MyBatis를 통한 성능 향상
              </span>
            </li>
          </ul>
        </section>
      </main>
    </Layout>
  );
}
