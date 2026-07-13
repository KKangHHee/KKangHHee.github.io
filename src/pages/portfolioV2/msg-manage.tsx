import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import styles from "./portfolioV2.module.css";

const decisions = [
  {
    number: "01",
    title: "멀티 데이터소스 조회 구조",
    context:
      "조직 정보는 MariaDB, 발송 이력은 Oracle에 분리되어 있어 단일 쿼리로 조인할 수 없었습니다.",
    choice:
      "MariaDB에서 후보 ID를 조회하고 Oracle IN 조회 후 애플리케이션에서 매핑하는 구조를 선택했습니다.",
    reason:
      "회사당 사용자 최대 300건, 전체 1,000건 미만이라는 데이터 규모를 기준으로 조회 비용을 감당할 수 있다고 판단했습니다.",
    result:
      "메타데이터 중복 저장과 다중 DB 저장 트랜잭션을 피하면서 회사·사용자 기준 발송 이력 조회를 구현했습니다.",
  },
  {
    number: "02",
    title: "수기 운영 데이터 시스템화",
    context:
      "운영자가 SQL로 조직 데이터를 관리하면서 상위 조직과 하위 조직의 활성 상태가 일치하지 않는 문제가 누적됐습니다.",
    choice:
      "웹 기반 CRUD와 애플리케이션 레벨의 계단식 soft-delete 규칙을 적용했습니다.",
    reason:
      "soft-delete는 UPDATE이므로 DB FK cascade만으로 정책을 일관되게 적용할 수 없었습니다.",
    result:
      "부서 245건 중 상태 불일치 87건과 삭제된 상위 부서 참조 2건을 정비하고 반복적인 수기 SQL 작업을 줄였습니다.",
  },
  {
    number: "03",
    title: "레거시 호환성과 보안 개선",
    context:
      "JSP·MyBatis 기반 서비스의 결합도가 높았고, 사용자 비밀번호가 평문으로 저장되어 있었습니다.",
    choice:
      "Spring Boot·JPA/QueryDSL 구조와 JSON API 기반 화면 흐름으로 전환하고 비밀번호를 BCrypt로 일괄 이관했습니다.",
    reason:
      "기존 발송 시스템과의 연결은 LEGACY_ID로 유지해 외부 시스템의 영향 범위를 제한했습니다.",
    result:
      "기존 사용자의 비밀번호 재설정 없이 보안 취약점을 해소하고 이후 화면 구조를 변경할 수 있는 기반을 마련했습니다.",
  },
];

export default function MessageManagementPortfolio() {
  return (
    <Layout title="사내 메시지 발송 관리 서비스 | Portfolio V2">
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="현재 위치">
          <Link to="/portfolioV2">Portfolio V2</Link>
          <span aria-hidden="true">/</span>
          <span>Message Management</span>
        </nav>

        <header className={styles.detailHero}>
          <p className={styles.eyebrow}>JAVA BACKEND INTERN · 2026</p>
          <h1>사내 메시지 발송 관리 서비스 마이그레이션</h1>
          <p className={styles.lead}>
            레거시 SMS·알림톡 관리 서비스를 현대화하고, SQL로 수기 관리하던
            조직 데이터를 웹 기반 운영 기능으로 전환했습니다.
          </p>
          <dl className={styles.factGrid}>
            <div>
              <dt>기간</dt>
              <dd>2026.03.03 - 2026.06.02</dd>
            </div>
            <div>
              <dt>역할</dt>
              <dd>Java 백엔드 인턴</dd>
            </div>
            <div>
              <dt>인원</dt>
              <dd>3인</dd>
            </div>
            <div>
              <dt>기술</dt>
              <dd>Java 17 · Spring Boot · JPA · QueryDSL · Oracle · MariaDB</dd>
            </div>
          </dl>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionIndex}>01</p>
            <div>
              <h2>Background</h2>
              <p>기능 추가보다 먼저 운영 방식과 데이터 구조를 정리해야 했습니다.</p>
            </div>
          </div>
          <div className={styles.backgroundGrid}>
            <article>
              <h3>기존 환경</h3>
              <p>Spring·JSP·MyBatis 기반의 사내 관리자 서비스</p>
            </article>
            <article>
              <h3>운영 문제</h3>
              <p>조직 데이터 수기 SQL 관리와 상태 불일치 누적</p>
            </article>
            <article>
              <h3>기술 제약</h3>
              <p>Oracle 발송 이력과 MariaDB 메타데이터의 물리적 분리</p>
            </article>
            <article>
              <h3>보안 문제</h3>
              <p>사용자 비밀번호 평문 저장과 운영 규칙 부재</p>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionIndex}>02</p>
            <div>
              <h2>Key Decisions</h2>
              <p>문제보다 선택 기준과 결과가 드러나도록 정리했습니다.</p>
            </div>
          </div>
          <div className={styles.decisionList}>
            {decisions.map((decision) => (
              <article className={styles.decisionCard} key={decision.number}>
                <p className={styles.decisionNumber}>{decision.number}</p>
                <div>
                  <h3>{decision.title}</h3>
                  <dl className={styles.decisionFlow}>
                    <div>
                      <dt>제약</dt>
                      <dd>{decision.context}</dd>
                    </div>
                    <div>
                      <dt>선택</dt>
                      <dd>{decision.choice}</dd>
                    </div>
                    <div>
                      <dt>근거</dt>
                      <dd>{decision.reason}</dd>
                    </div>
                    <div>
                      <dt>결과</dt>
                      <dd>{decision.result}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionIndex}>03</p>
            <div>
              <h2>Retrospective</h2>
              <p>성과와 함께 다음 설계에서 보완할 점을 남겼습니다.</p>
            </div>
          </div>
          <div className={styles.retrospective}>
            <p>
              인메모리 조인은 항상 좋은 방식이 아니라 현재 데이터 규모에서 선택한
              방식입니다. 데이터가 커진다면 조회 후보를 제한하거나 별도의 통합
              저장 구조를 검토해야 합니다.
            </p>
            <p>
              권한 설계는 역할 중심으로 구현했지만 기존 시스템의 메뉴별 세부 권한을
              충분히 분석하지 못했습니다. 이후에는 Role과 Permission을 분리해
              요구사항을 먼저 모델링할 필요가 있습니다.
            </p>
          </div>
          <div className={styles.detailLinks}>
            <Link to="/docs/projects/msg-manage/">전체 기술 문서 보기</Link>
            <Link to="/blog/multi-datasource-in-memory-join">
              멀티 DB 설계 글 보기
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
