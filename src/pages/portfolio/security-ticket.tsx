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
        "Nginx",
        "Docker",
      ]}
      achievements={[
        "복합 검색 평균 응답시간 36.8% 단축 (24.45ms → 15.51ms)",
        "Controller 기반 커스텀 세션 인증 흐름 구현",
        "공통 응답·예외 처리 및 통합 API 규약 표준화",
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

          <h4>4) 설계 회고</h4>
          <ul className={styles.descList}>
            <li>
              성능 개선의 핵심은 MyBatis 도입 자체가 아니라, 목록 조회와 COUNT
              쿼리의 목적을 구분하고 불필요한 JOIN을 제거한 데 있었습니다.
            </li>
          </ul>
        </PortfolioTroubleCard>

        <PortfolioTroubleCard title="Case 2. Controller 기반 커스텀 세션 인증 흐름 구현">
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
            <li>
              기본 Form Login 필터 내부에 모든 정책을 포함하면 인증 처리와 계정
              비즈니스 규칙의 책임이 뒤섞일 수 있었습니다.
            </li>
          </ul>

          <h4>2) 선택 기준</h4>
          <ul className={styles.descList}>
            <li>
              로그인 요청의 진입점을 기본 Form Login 필터가 아닌 Controller로
              옮겼습니다.
            </li>
            <li>
              사용자 조회, 계정 활성 여부, 실패 횟수, 계정 잠금, 최초 로그인
              여부 등의 비즈니스 검증은 LoginService에서 처리했습니다.
            </li>
            <li>
              인증과 세션 관리를 직접 재구현하지 않고 AuthenticationManager,
              SessionAuthenticationStrategy, SecurityContextRepository 등 Spring
              Security의 표준 컴포넌트를 재사용했습니다.
            </li>
          </ul>
          <h4>3) 구현</h4>
          <ul className={styles.descList}>
            <li>
              <code>AuthenticationManager</code>를 통해 Spring Security의 인증
              절차를 실행했습니다.
            </li>
            <li>
              <code>SessionAuthenticationStrategy</code>를 직접 호출해 중복
              로그인 제한, 세션 ID 변경, 활성 세션 등록 정책을 적용했습니다.
            </li>
            <li>
              생성한 인증 정보를 <code>SecurityContextRepository</code>에
              명시적으로 저장해 이후 요청에서 세션 인증 상태를 사용할 수 있도록
              구성했습니다.
            </li>
            <li>
              <code>HttpSessionEventPublisher</code>와{" "}
              <code>SessionRegistry</code>를 연계해 로그아웃과 세션 만료 시 활성
              세션 정보가 정리되도록 했습니다.
            </li>
          </ul>

          <h4>4) 검증 결과</h4>
          <ul className={styles.descList}>
            <li>
              로그인 실패 횟수를 누적하고 임계치 도달 시 계정을 잠그는 흐름을
              구현했습니다.
            </li>
            <li>
              최초 로그인 사용자는 일반 로그인 성공과 구분된 상태를 반환해
              비밀번호 변경 흐름으로 연결했습니다.
            </li>
            <li>
              동일 계정으로 다시 로그인하면 기존 세션을 만료하고, 만료된
              세션으로 요청할 경우 인증 실패 응답을 반환하도록 구성했습니다.
            </li>
            <li>
              비즈니스 검증은 Service 계층에서 표현하면서도 세션 고정 공격
              방지와 활성 세션 관리 등 Spring Security의 기본 정책을
              유지했습니다.
            </li>
          </ul>

          <h4>5) 설계 회고</h4>
          <ul className={styles.descList}>
            <li>
              비즈니스 요구사항을 명시적으로 표현할 수 있었지만, 기본 필터가
              자동으로 수행하던 인증 성공 이후의 절차를 직접 연결해야 했습니다.
            </li>
            <li>
              SessionAuthenticationStrategy의 호출 순서와 SecurityContext의
              명시적 저장, 세션 이벤트 구성을 함께 검증해야 하는 복잡도가
              추가됐습니다.
            </li>
            <li>
              요구사항이 단순했다면 직접 인증 흐름을 구성하는 것보다 기본 Form
              Login을 사용하는 편이 더 적합했을 것입니다.
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
