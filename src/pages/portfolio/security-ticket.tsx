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
      organization="교육 내 팀 프로젝트"
      projectName="Security Ticket"
      summary="Excel·이메일 중심의 수동 보안 점검 프로세스를 웹 기반으로 전환한 관리 시스템"
      period="2025.04 - 2025.05"
      team="BE 8인 / FE 3인"
      role="사용자 관리 도메인 및 백엔드 API 설계"
      stack={[
        "Java",
        "Spring Boot 3",
        "JPA",
        "MyBatis",
        "MySQL",
        "Redis",
        "Nginx",
        "Docker",
      ]}
      achievements={[
        "복합 검색 쿼리 구조 개선 (평균 24.45ms → 16.85ms)",
      ]}
    >
      <PortfolioSection title="1. 시스템 아키텍처">
        <ul className={styles.descList}>
          <li>
            <strong>개발 환경:</strong> 폐쇄망 기반 온프레미스 환경에서
            GitLab으로 소스를 관리하고 Nexus를 통해 의존성 패키지를
            제공했습니다.
          </li>
          <li>
            <strong>배포 구조:</strong> 개발·스테이징 영역이 분리된 온프레미스
            배포 환경에서 개발했습니다.
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
      </PortfolioSection>

      <PortfolioSection title="2. 핵심 문제 해결 및 성과">
        <PortfolioTroubleCard title="Case 1. 조회 특성에 맞춘 JPA·MyBatis 하이브리드 전략">
          <h4>1) 문제 맥락</h4>
          <ul className={styles.descList}>
            <li>
              복합 조건 검색에 JPA Specification을 사용하면서 가독성이 낮아지고,
              복잡한 쿼리를 작성하거나 튜닝하기 어려워졌습니다.
            </li>
          </ul>

          <h4>2) 선택 기준과 구현</h4>
          <ul className={styles.descList}>
            <li>
              복합 조회에만 <code>MyBatis</code>를 부분적으로 도입했습니다.
            </li>
            <li>
              추가 1) choose 중첩 →{" "}
              <strong>OR 조건을 통합해 쿼리 재사용성을 높였습니다.</strong>
            </li>
            <li>
              추가 2) JOIN →{" "}
              <mark className={styles.keyHighlight}>
                EXISTS 서브쿼리 기반 카운팅을 통해 쿼리를 최적화했습니다.
              </mark>
            </li>
          </ul>

          <h4>3) 검증 결과</h4>
          <div className={styles.archGrid}>
            <div>
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
                    <td>16.85ms</td>
                    <td>31.1% ↓</td>
                  </tr>
                  <tr>
                    <td>최대 응답시간</td>
                    <td>83.67ms</td>
                    <td>54ms</td>
                    <td>35%↓</td>
                  </tr>
                  <tr>
                    <td>처리량(TPS)</td>
                    <td>55.71</td>
                    <td>68.90</td>
                    <td>23.7%↑</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <ul className={styles.descList}>
            <li>
              평균 응답시간:
              <mark className={styles.keyHighlight}>
                24.45ms → 16.85ms (31.1% 개선)
              </mark>
              {"으로 단축했습니다."}
            </li>{" "}
          </ul>

          <h4>4) 설계 회고</h4>
          <ul className={styles.descList}>
            <li>
              성능 개선의 핵심은 MyBatis 도입 자체가 아니라, 목록 조회와 COUNT
              쿼리의 목적을 구분하고 불필요한 JOIN을 제거한 데 있었습니다.
            </li>
          </ul>
        </PortfolioTroubleCard>

      </PortfolioSection>

      <PortfolioSection title="3. 관련 블로그 포스팅">
        <PortfolioBlogLinks
          items={[
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
