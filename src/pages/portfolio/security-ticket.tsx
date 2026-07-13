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
        "Spring Security",
        "JPA",
        "MyBatis",
        "MySQL",
        "Redis",
        "nginX",
        "Docker",
      ]}
      achievements={[
        "복합 검색 평균 응답시간 36.8% 단축 (24.45ms → 15.51ms)",
        "공통 응답·예외 처리 및 통합 API 규약 표준화",
      ]}
    >
      <PortfolioSection title="1. 시스템 아키텍처">
        <ul className={styles.descList}>
          <li>
            <strong>GitLab, nginX: </strong>폐쇄망 기반 온프레미스 + Nexus로
            패키지 관리
          </li>
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

      <PortfolioSection title="2. 핵심 문제 해결 및 성과">
        <PortfolioTroubleCard title="Case 1. 조회 특성에 맞춘 JPA·MyBatis 하이브리드 전략">
          <h4>1) 문제 맥락</h4>
          <ul className={styles.descList}>
            <li>복합 조건 검색 시, JPA Specification 사용 시,</li>
            <li>
              가독성 저하, 복잡한 쿼리 작성의 어려움, 쿼리 튜닝의 어려움 등 한계
              발생
            </li>
          </ul>

          <h4>2) 선택 기준과 구현</h4>
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

          <h4>3) 검증 결과</h4>
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
                    <td>36.8% ↓</td>
                  </tr>
                  <tr>
                    <td>최대 응답시간</td>
                    <td>83.67ms</td>
                    <td>54ms</td>
                    <td>35%↓</td>
                  </tr>
                  <tr>
                    <td>처리량(TPS)</td>
                    <td>221.77</td>
                    <td>273.34</td>
                    <td>23%↑</td>
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

          <h4>4) 설계 회고 및 관련 기록</h4>
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

        <PortfolioTroubleCard title="Case 2. 비즈니스 규칙을 반영한 세션 인증 흐름 확장">
          <h4>1) 문제 맥락</h4>
          <ul className={styles.descList}>
            <li>
              기본 폼 로그인만으로는 JSON 요청, 로그인 실패 횟수, 계정 잠금,
              최초 로그인 여부를 함께 처리하기 어려웠습니다.
            </li>
            <li>
              인증 성공 여부뿐 아니라 실패 원인별 응답과 계정 상태 변경까지
              일관된 흐름으로 관리해야 했습니다.
            </li>
          </ul>

          <h4>2) 선택 기준과 구현</h4>
          <ul className={styles.descList}>
            <li>
              JSON 요청을 읽는 인증 필터와 커스텀 AuthenticationProvider를
              구성했습니다.
            </li>
            <li>
              성공·실패 Handler에서 공통 응답 규격을 사용하고, 실패 횟수 누적과
              임계치 도달 시 계정 잠금 규칙을 연결했습니다.
            </li>
            <li>
              최초 로그인 사용자는 비밀번호 변경 흐름으로 이동하도록 상태를
              응답에 포함했습니다.
            </li>
          </ul>

          <h4>3) 검증 결과</h4>
          <ul className={styles.descList}>
            <li>
              프론트엔드가 실패 원인과 사용자 상태에 따라 일관되게 화면을 분기할
              수 있게 했습니다.
            </li>
            <li>
              인증 규칙을 Controller 밖의 Spring Security 흐름에 모아 변경
              지점을 명확히 했습니다.
            </li>
          </ul>

          <h4>4) 설계 회고 및 관련 기록</h4>
          <ul className={styles.descList}>
            <li>
              <a
                href="/blog/spring-boot-custom-session-authentication"
                target="_blank"
                rel="noreferrer"
              >
                Spring Boot에서 Session 인증을 커스텀하는 이유와 실전 구현
              </a>
            </li>
          </ul>
        </PortfolioTroubleCard>
      </PortfolioSection>

      <PortfolioSection title="3. 관련 블로그 포스팅">
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
