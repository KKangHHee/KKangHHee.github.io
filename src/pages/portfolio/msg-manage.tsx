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
      organization="웅진 · 그룹IT혁신팀 인턴"
      projectName="사내 메시지 발송 관리 서비스 마이그레이션"
      summary="레거시를 그대로 옮기지 않고 기존 운영에서 발생한 문제를 분석해 데이터 관리와 조회 구조를 다시 설계한 프로젝트"
      period="2026.03 - 2026.06"
      team="3인"
      role="기존 서비스 분석, Java 백엔드 개발 및 관리자 화면 구현"
      stack={[
        "Java",
        "Spring Boot",
        "JPA",
        "QueryDSL",
        "Oracle",
        "MariaDB",
        "Thymeleaf",
        "Alpine.js",
      ]}
      achievements={[
        "부서 245건 중 상태 불일치 87건과 잘못된 상위 참조 2건 정비",
        "메타데이터 일원화와 앵커 기반 발송 이력 조회 구현",
      ]}
    >
      <PortfolioSection title="1. 핵심 문제 해결 및 성과">
        <PortfolioTroubleCard title="Case 1. 수기 메타데이터 관리 규칙의 시스템화">
          <h4>1) 문제 맥락</h4>
          <ul className={styles.descList}>
            <li>
              회사·부서·사용자·채널 정보를 운영자가 SQL로 직접 관리하고 있어,
              변경 누락과 잘못된 상태 입력이 발생할 수 있었고 변경 이력을
              추적하기도 어려웠습니다.
            </li>
            <li>
              상위 조직은 비활성화됐지만 하위 조직은 활성 상태로 남는 등 상·하위
              데이터의 상태 불일치가 누적됐습니다.
            </li>
          </ul>

          <h4>2) 선택 기준과 구현</h4>
          <ul className={styles.descList}>
            <li>
              회사·부서·사용자·채널 정보를 관리하는 웹 기반 CRUD를 구축했습니다.
            </li>
            <li>
              상위 데이터 비활성화 시 하위 데이터도 함께 비활성화하는
              <mark className={styles.keyHighlight}>계단식 soft-delete</mark> 를
              적용했습니다.
            </li>
            <li>
              생성자·수정자·변경 일시를 기록해 변경 이력을 추적하도록
              구성했습니다.
            </li>
          </ul>

          <h4>3) 결과</h4>
          <ul className={styles.descList}>
            <li>
              SQL을 직접 실행하지 않고 관리 화면에서 메타데이터를 등록·수정할 수
              있도록 운영 절차를 시스템화했습니다.
            </li>
            <li>
              부서 245건 중 확인된 상·하위 상태 불일치 87건과 잘못된 상위 데이터
              참조 2건을 정비했습니다.
            </li>
          </ul>
        </PortfolioTroubleCard>

        <PortfolioTroubleCard title="Case 2. 쓰기 정합성을 우선한 메타데이터 일원화">
          <h4>1) 문제 맥락</h4>
          <ul className={styles.descList}>
            <li>
              회사·사용자 메타데이터가 Oracle과 MariaDB에 중복 저장되어 변경 시
              두 DB의 정합성을 함께 관리해야 하는 부담이 있었습니다.
            </li>
          </ul>

          <h4>2) 선택 기준과 구현</h4>
          <ul className={styles.descList}>
            <li>중복 관리하던 메타데이터를 MariaDB로 일원화했습니다.</li>
            <li>
              <mark className={styles.keyHighlight}>
                MariaDB 후보 ID 조회 → Oracle 발송 이력 페이징 → 메타데이터 Map
                구성 → 서비스 계층 결합
              </mark>
              순서로 조회 구조를 구현했습니다.
            </li>
            <li>
              회사당 최대 300건 내외, 전체 1,000건 미만의 후보 규모를 기준으로
              IN절과 애플리케이션 매핑의 적용 범위를 제한했습니다.
            </li>
          </ul>

          <h4>3) 결과</h4>
          <ul className={styles.descList}>
            <li>
              메타데이터의 저장 경로를 MariaDB로 일원화해 두 DB를 함께 갱신할 때
              발생할 수 있는 부분 실패와 정합성 관리 부담을 줄였습니다.
            </li>
            <li>
              분리된 두 DB에서도 회사·사용자 기준 발송 이력 조회를 구현했습니다.
            </li>
          </ul>
        </PortfolioTroubleCard>

        <PortfolioTroubleCard title="Case 3. 변화하는 데이터셋의 조회 시점 고정">
          <h4>1) 문제 맥락</h4>
          <ul className={styles.descList}>
            <li>
              신규 데이터가 추가되면 기존 데이터의 위치가 밀려, 페이지 이동
              과정에서 중복 조회나 누락이 발생할 수 있었습니다.
            </li>
            <li>
              조회 중 새로 들어온 데이터와 기존 조회 범위를 구분하기
              어려웠습니다.
            </li>
          </ul>

          <h4>2) 선택 기준과 구현</h4>
          <ul className={styles.descList}>
            <li>
              최초 조회 결과의 정렬 기준값을 앵커로 반환하고, 이후 페이지
              요청에서도 같은 앵커를 조회 조건으로 사용했습니다.
            </li>
            <li>
              앵커 이후 유입된 데이터는 목록에 즉시 섞지 않고 신규 건수로 별도
              표시했습니다.
            </li>
            <li>
              사용자가 갱신할 때 새 앵커를 적용해 최신 조회 범위로 전환했습니다.
            </li>
          </ul>

          <h4>3) 결과</h4>
          <ul className={styles.descList}>
            <li>
              페이지 이동 중 중복·누락 가능성을 줄이고 조회 흐름을 일관되게
              유지했습니다.
            </li>
            <li>
              조회 이후 유입된 신규 데이터의 존재를 별도로 알리면서, 사용자의
              현재 페이지와 조회 기준을 유지했습니다.
            </li>
          </ul>
        </PortfolioTroubleCard>
      </PortfolioSection>

      <PortfolioSection title="2. 테스트 전략">
        <ul className={styles.descList}>
          <li>
            <strong>Service 레이어:</strong> Mockito 기반 단위 테스트로 CRUD,
            계단식 비활성화, 예외 처리 흐름 검증
          </li>
          <li>
            <strong>Controller 레이어:</strong> 엔드포인트 테스트로 요청
            파라미터, 응답 구조, 실패 케이스 검증
          </li>
        </ul>
      </PortfolioSection>

      <PortfolioSection title="3. 관련 블로그 포스팅">
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
