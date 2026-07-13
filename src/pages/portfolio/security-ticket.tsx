import PortfolioBlogLinks from "@site/src/components/portfolio/PortfolioBlogLinks";
import ProjectOverview from "@site/src/components/portfolio/ProjectOverview";
import PortfolioSection from "@site/src/components/portfolio/PortfolioSection";
import PortfolioTroubleCard from "@site/src/components/portfolio/PortfolioTroubleCard";
import styles from "./portfolio.module.css";

export default function Portfolio() {
  return (
    <ProjectOverview
      projectName="Security Ticket"
      summary="Excel·이메일 중심의 수동 보안 점검 프로세스를 웹 기반으로 전환한 관리 시스템"
      period="2025.04 - 2025.05"
      team="BE 8인 / FE 3인"
      role="사용자 관리 도메인 및 백엔드 API 설계"
      stack={[
        "Java",
        "Spring Boot 3",
        "Spring Security",
        "JPA",
        "MyBatis",
        "MySQL",
        "Redis",
        "Docker",
      ]}
      achievements={[
        "복합 검색 평균 응답시간 36.8% 단축 (24.45ms → 15.51ms)",
        "공통 응답·예외 처리 및 통합 API 규약 표준화",
      ]}
    >
      <PortfolioSection title="2. 기술 스택 및 시스템 아키텍처">
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
      </PortfolioSection>

      <PortfolioSection title="3. 핵심 문제 해결 및 성과">
        <PortfolioTroubleCard title="Trouble 1. MyBatis 하이브리드 도입 및 EXISTS 서브쿼리를 통한 복합 검색 최적화">
          <h4>1) Problem</h4>
          <ul className={styles.descList}>
            <li>복합 조건 검색 시, JPA Specification 사용 시,</li>
            <li>
              가독성 저하, 복잡한 쿼리 작성의 어려움, 쿼리 튜닝의 어려움 등 한계
              발생
            </li>
          </ul>

          <h4>2) Action</h4>
          <ul className={styles.descList}>
            <li>
              <code>MyBatis</code>의 부분적 도입을 통한 성능 향상
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
                src="/img/portfolio/security-ticket/mybatis_성능.png"
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
                </tbody>
              </table>
            </div>
          </div>
          <ul className={styles.descList}>
            <li>
              평균 응답시간: <strong>24.45ms → 15.51ms (36.8% 개선)</strong>
            </li>
            <li>복합 검색 조건에서도 안정적인 응답 시간 유지</li>
          </ul>

          <h4>4) Deep Dive</h4>
          <ul className={styles.descList}>
            <li>
              <a
                href="/blog/jpa-mybatis-hybrid-strategy"
                target="_blank"
                rel="noreferrer"
              >
                상황에 따른 구조적 접근 경험 (MyBatis)
              </a>
            </li>
            <li>
              <a
                href="/blog/spring-boot-custom-session-authentication"
                target="_blank"
                rel="noreferrer"
              >
                커스텀 세션 로그인 구조 설계 & 요구 사항 적용
              </a>
            </li>
            <li>Spring Security 내부 동작 이해</li>
          </ul>
        </PortfolioTroubleCard>
      </PortfolioSection>

      <PortfolioSection title="4. 관련 블로그 포스팅">
        <PortfolioBlogLinks
          items={[
            {
              href: "/blog/spring-boot-custom-session-authentication",
              label:
                "Spring Boot에서 Session 인증을 커스텀하는 이유와 실전 구현",
              description: "– 로그인 구조 설계 & 요구 사항 적용",
            },
            {
              href: "/blog/jpa-mybatis-hybrid-strategy",
              label: "JPA vs MyBatis 성능 비교와 하이브리드 전략",
              description: "– 동적 쿼리에서 MyBatis를 통한 성능 향상",
            },
          ]}
        />
      </PortfolioSection>
    </ProjectOverview>
  );
}
