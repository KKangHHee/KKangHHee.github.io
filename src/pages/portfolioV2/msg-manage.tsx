import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import styles from "./portfolioV2.module.css";

const decisions = [
  {
    number: "01",
    title: "수기 메타데이터 관리 시스템화",
    context:
      "회사·부서·사용자·채널·템플릿을 운영자가 SQL로 직접 관리해 상위와 하위 데이터의 활성 상태가 일치하지 않았습니다.",
    choice:
      "웹 기반 CRUD를 구축하고 상위 데이터 비활성화 시 하위 데이터도 함께 처리하는 계단식 soft-delete 규칙을 서비스 계층에 적용했습니다.",
    reason:
      "관리 화면만 추가하면 동일한 불일치가 반복될 수 있어 담당자의 운영 규칙까지 시스템으로 강제해야 했습니다.",
    result:
      "부서 245건 중 상태 불일치 87건과 삭제된 상위 부서 참조 2건을 정비하고 생성·수정자와 일시를 기록하도록 구성했습니다.",
  },
  {
    number: "02",
    title: "메타데이터 일원화와 서비스 레벨 조인",
    context:
      "기존에는 Oracle과 MariaDB에 동일한 메타데이터를 각각 등록했으며, 이를 그대로 시스템화하면 두 DB의 부분 실패와 동기화를 관리해야 했습니다.",
    choice:
      "메타데이터의 등록·수정은 MariaDB로 일원화하고, Oracle은 기존 발송 이력 저장소로 유지했습니다.",
    reason:
      "조회 편의보다 쓰기 정합성과 운영 경로의 단순화를 우선하고, 조회 단계의 추가 매핑 비용을 감수했습니다.",
    result:
      "MariaDB 후보 ID 조회 → Oracle 발송 이력 조회 → 서비스 계층 매핑 흐름으로 중복 저장 없이 회사·사용자 기준 조회를 구현했습니다.",
  },
  {
    number: "03",
    title: "앵커 기반 발송 이력 조회",
    context:
      "최신순 offset 페이징 중 신규 발송 이력이 유입되면 기존 데이터의 위치가 밀려 다음 페이지에서 중복되거나 누락된 것처럼 보일 수 있었습니다.",
    choice:
      "최초 조회 시점의 정렬 기준을 앵커로 저장하고 같은 조회 흐름에서는 앵커 이전 데이터만 페이지 대상으로 제한했습니다.",
    reason:
      "페이지 번호 기반 UI는 유지하면서 계속 변하는 데이터셋의 조회 기준을 고정하기 위한 절충안이었습니다.",
    result:
      "앵커 이후의 신규 건수는 별도로 표시하고 사용자가 갱신할 때 현재 시점으로 앵커를 재설정해 페이지 이동의 일관성을 높였습니다.",
  },
  {
    number: "04",
    title: "Thymeleaf 화면과 JSON API의 책임 분리",
    context:
      "Controller의 Model 데이터를 Fragment에 직접 전달하고 바닐라 JavaScript로 DOM을 제어하면 화면과 서버 응답의 결합 및 반복 코드가 커질 수 있었습니다.",
    choice:
      "Thymeleaf는 레이아웃과 화면 골격에 사용하고 목록·상세 데이터는 JSON API로 제공했으며 Alpine.js로 UI 상태와 이벤트를 처리했습니다.",
    reason:
      "별도 React 애플리케이션을 추가하지 않으면서도 화면과 데이터 전달 책임을 분리하고 향후 API 재사용 가능성을 확보하려는 선택이었습니다.",
    result:
      "반복적인 DOM 조회와 이벤트 바인딩을 선언형 상태 처리로 정리하고 Controller와 HTML 사이의 결합을 낮췄습니다.",
  },
  {
    number: "05",
    title: "레거시 마이그레이션과 비밀번호 보안 개선",
    context:
      "Spring·JSP·MyBatis 기반 일부 코드와 운영 화면을 분석하는 과정에서 평문 비밀번호와 명확하지 않은 운영 규칙을 확인했습니다.",
    choice:
      "팀원들과 데이터 접근 기술을 검토해 JPA와 QueryDSL을 적용하고, 평문 비밀번호는 BCrypt로 일괄 이관했습니다.",
    reason:
      "기존 발송 시스템이 참조하는 식별자는 LEGACY_ID로 보존해 외부 시스템의 영향 범위를 제한했습니다.",
    result:
      "기존 사용자의 비밀번호 재설정 없이 보안 취약점을 해소하고 기존 시스템과의 연결을 유지한 채 구조를 전환했습니다.",
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
            기존 기능을 새 기술로 옮기는 데 그치지 않고 운영 데이터와 사용
            흐름을 분석해 데이터 관리, 화면·API 책임, 변화하는 발송 이력의 조회
            구조를 다시 설계했습니다.
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
              <p>기존 서비스 분석에서 시작해 운영과 조회의 문제를 개선했습니다.</p>
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
              <h3>조회 문제</h3>
              <p>신규 발송 이력 유입으로 페이지 기준이 계속 변동</p>
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
            <Link to="/blog/anchor-based-live-history-pagination">
              앵커 기반 조회 글 보기
            </Link>
            <Link to="/blog/multi-datasource-in-memory-join">
              멀티 DB 설계 글 보기
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
