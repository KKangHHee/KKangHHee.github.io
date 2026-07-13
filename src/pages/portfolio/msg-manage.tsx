import PortfolioBlogLinks from "@site/src/components/portfolio/PortfolioBlogLinks";
import PortfolioSection from "@site/src/components/portfolio/PortfolioSection";
import PortfolioTroubleCard from "@site/src/components/portfolio/PortfolioTroubleCard";
import ProjectOverview from "@site/src/components/portfolio/ProjectOverview";
import styles from "./portfolio.module.css";

export default function Portfolio() {
  return (
    <ProjectOverview
      organization="인턴 내 프로젝트"
      projectName="사내 메시지 발송 관리 서비스 마이그레이션"
      summary="레거시를 그대로 옮기지 않고 기존 운영에서 발생한 문제를 분석해 데이터 관리와 조회 구조를 다시 설계한 프로젝트"
      period="2026.03.03 - 2026.06.02"
      team="3인"
      role="기존 서비스 분석, Java 백엔드 개발 및 관리자 화면 구현"
      stack={[
        "Java 17",
        "Spring Boot",
        "JPA",
        "QueryDSL",
        "Oracle 11g",
        "MariaDB",
        "Thymeleaf",
        "Alpine.js",
      ]}
      achievements={[
        "부서 데이터 상·하위 상태 불일치 건 및 참조 오류 정비",
        "메타데이터 일원화와 앵커 기반 발송 이력 조회 구현",
      ]}
    >
      <PortfolioSection title="2. 기술 스택 및 시스템 아키텍처">
        <ul className={styles.descList}>
          <li>
            <strong>Thymeleaf:</strong> 레이아웃/프래그먼트 중심의 HTML 껍데기
            역할로 한정하고, 데이터는 JSON API로 분리하여 추후 CSR 전환 가능한
            구조 확보
          </li>
          <li>
            <strong>QueryDSL:</strong> 동적 검색 조건 및 bulk UPDATE(계단식
            비활성화) 처리
          </li>
          <li>
            <strong>구조:</strong> 단일 서버에서 서비스별로 분리된 다중
            DB(메타데이터 1 + 발송 이력 1)를 함께 다루는 멀티 데이터소스 구조
          </li>
        </ul>
      </PortfolioSection>

      <PortfolioSection title="3. 핵심 문제 해결 및 성과">
        <PortfolioTroubleCard title="Trouble 1. 멀티 데이터소스 환경에서의 발송 이력 조회 (인메모리 조인)">
          <h4>1) Problem</h4>
          <ul className={styles.descList}>
            <li>
              메타데이터(회사/부서/사용자)는 <strong>MariaDB</strong>, 발송
              이력은 <strong>Oracle</strong>에 저장되어 단일 쿼리 조인 불가
            </li>
            <li>
              기존에는 각 DB에 메타데이터를 중복 저장했으나, 시스템화 시 여러
              DB에 걸친 <strong>저장 트랜잭션 정합성</strong>이 복잡해지는 문제
            </li>
          </ul>

          <h4>2) Action</h4>
          <ul className={styles.descList}>
            <li>
              메타데이터를 <strong>MariaDB에 중앙화</strong>하여 저장 트랜잭션
              복잡도를 줄임
            </li>
            <li>
              MariaDB에서 조회 조건에 맞는 ID를 먼저 추출한 뒤, Oracle 발송
              이력을 조회하고 애플리케이션에서 매핑하는{" "}
              <strong>인메모리 조인</strong> 구조 적용
            </li>
            <li>
              회사당 사용자 규모와 전체 데이터 규모를 기준으로 <code>IN</code>절
              조회가 허용 가능하다고 판단
            </li>
          </ul>

          <h4>3) Result</h4>
          <ul className={styles.descList}>
            <li>저장 트랜잭션 복잡도 제거 및 데이터 정합성 확보</li>
            <li>서로 다른 두 DB에 걸친 발송 이력 조회 기능 구현</li>
            <li>
              데이터 규모가 커질 경우 분산 저장이 유리하다는{" "}
              <strong>트레이드오프 기준</strong>까지 정리
            </li>
          </ul>

          <h4>4) Deep Dive</h4>
          <ul className={styles.descList}>
            <li>
              <a
                href="/blog/multi-datasource-in-memory-join"
                target="_blank"
                rel="noreferrer"
              >
                서로 다른 두 DB를 조인할 수 없을 때: 인메모리 조인과
                트레이드오프
              </a>
            </li>
            <li>
              레거시 ID와 신규 ID를 잇기 위해 <code>LEGACY_ID</code> 기반 Bridge
              패턴(<code>UserBridgeService</code> 등) 도입
            </li>
          </ul>
        </PortfolioTroubleCard>

        <PortfolioTroubleCard title="Trouble 2. 수기 운영 데이터의 정합성 문제와 계단식 soft-delete">
          <h4>1) Problem</h4>
          <ul className={styles.descList}>
            <li>
              회사/부서/사용자 데이터를 운영자가 DB에 직접 SQL로 수기 관리 →{" "}
              <strong>휴먼 에러로 인한 정합성 오류</strong> 누적
            </li>
            <li>
              FK가 논리적으로만 설정되어, 상위(회사)는 비활성화인데 하위(부서)는
              활성화인 건이 <strong>부서 245건 중 87건</strong> 존재, 삭제된
              상위 부서를 참조하는 건도 2건 존재
            </li>
          </ul>

          <h4>2) Action</h4>
          <ul className={styles.descList}>
            <li>웹 UI 기반 회사/부서/채널/사용자 CRUD 시스템 구축</li>
            <li>
              상위 데이터 비활성화 시 하위 데이터를 함께 비활성화하는{" "}
              <strong>계단식 soft-delete</strong> 로직 구현
            </li>
            <li>
              DB FK cascade로 처리하기 어려운 soft-delete 정책을 애플리케이션
              레벨에서 일관되게 적용
            </li>
          </ul>

          <h4>3) Result</h4>
          <ul className={styles.descList}>
            <li>정합성 불일치 87건 해소 및 참조 정합성 오류 2건 제거</li>
            <li>
              비개발자 담당자도 SQL 없이 웹 화면으로 조직 데이터 관리 가능
            </li>
          </ul>
        </PortfolioTroubleCard>

        <PortfolioTroubleCard title="Trouble 3. 데이터 마이그레이션 — 보안·운영 규칙 정비">
          <h4>1) Problem</h4>
          <ul className={styles.descList}>
            <li>
              사용자 비밀번호가 DB에 <strong>평문</strong>으로 저장되어 보안
              취약점 존재
            </li>
            <li>
              login ID가 명확한 운영 규칙 없이 생성되어 있었고, 일부 데이터에는
              문서화된 규칙 자체가 부재
            </li>
          </ul>

          <h4>2) Action</h4>
          <ul className={styles.descList}>
            <li>
              신규 테이블 설계 후 데이터 이관 과정에서 평문 비밀번호를{" "}
              <strong>BCrypt로 일괄 암호화</strong> (기존 사용자는 동일
              비밀번호로 로그인 가능하여 재설정 불필요)
            </li>
            <li>
              운영 규칙이 확인된 부분은 그대로 따르고, 규칙이 없던 부분은 기획
              단계에서 새 운영 규칙(회사 이니셜 + 식별번호)을 수립하여 적용
            </li>
            <li>각 테이블에 생성자/수정자/일자 컬럼을 추가해 감사 추적 확보</li>
          </ul>

          <h4>3) Result</h4>
          <ul className={styles.descList}>
            <li>
              평문 비밀번호 보안 취약점 해소, 운영 규칙 문서화 및 시스템 반영
            </li>
            <li>
              외부 발송 시스템이 참조하는 기존 ID는 <code>LEGACY_ID</code>로
              보존하여 영향 없이 전환 완료
            </li>
          </ul>
        </PortfolioTroubleCard>
      </PortfolioSection>

      <PortfolioSection title="4. 테스트 전략">
        <ul className={styles.descList}>
          <li>
            <strong>Service 레이어:</strong> Mockito 기반 단위 테스트로 CRUD,
            계단식 비활성화, 예외 처리 흐름 검증
          </li>
          <li>
            <strong>Controller 레이어:</strong> 엔드포인트 테스트로 요청
            파라미터, 응답 구조, 실패 케이스 검증
          </li>
          <li>
            <strong>DB 레이어:</strong> Oracle 11g 호환성, QueryDSL bulk UPDATE,
            페이징 쿼리는 실제 DB 환경에서 검증
          </li>
        </ul>
      </PortfolioSection>

      <PortfolioSection title="5. 관련 블로그 포스팅">
        <PortfolioBlogLinks
          items={[
            {
              href: "/blog/anchor-based-live-history-pagination",
              label:
                "계속 추가되는 데이터에서 페이지 기준을 유지하는 방법: 앵커 기반 조회",
              description: "페이지 번호 UI를 유지하면서 조회 기준 고정",
            },
            {
              href: "/blog/multi-datasource-in-memory-join",
              label:
                "서로 다른 두 DB를 조인할 수 없을 때: 인메모리 조인과 트레이드오프",
              description: "멀티 데이터소스 설계 판단과 IN절 인메모리 조인",
            },
          ]}
        />
      </PortfolioSection>
    </ProjectOverview>
  );
}
