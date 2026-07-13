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
      <PortfolioSection title="1. 핵심 문제 해결 및 성과">
        <PortfolioTroubleCard title="Case 1. 수기 메타데이터 관리 규칙의 시스템화">
          <h4>1) 문제 맥락</h4>
          <ul className={styles.descList}>
            <li>
              회사·부서·사용자·채널 정보를 운영자가 DB에서 직접 SQL로 관리해
              변경 과정의 휴먼 에러와 이력 추적의 어려움이 존재
            </li>
            <li>
              상위 조직은 비활성화됐지만 하위 조직은 활성 상태로 남는 등 상·하위
              데이터의 상태 불일치가 누적
            </li>
          </ul>

          <h4>2) 선택 기준과 구현</h4>
          <ul className={styles.descList}>
            <li>회사·부서·사용자·채널 정보를 관리하는 웹 기반 CRUD 구축</li>
            <li>
              상위 데이터 비활성화 시 하위 데이터도 함께 비활성화하는
              <mark className={styles.keyHighlight}>계단식 soft-delete</mark> 적용
            </li>
            <li>
              생성자·수정자·변경 일시를 기록해 변경 이력을 추적하도록 구성
            </li>
          </ul>

          <h4>3) 검증 결과</h4>
          <ul className={styles.descList}>
            <li>SQL에 의존하던 운영 절차를 시스템화해 관리 접근성을 개선</li>
            <li>상·하위 상태 불일치와 잘못된 참조 데이터를 정비</li>
          </ul>
        </PortfolioTroubleCard>

        <PortfolioTroubleCard title="Case 2. 쓰기 정합성을 우선한 메타데이터 일원화">
          <h4>1) 문제 맥락</h4>
          <ul className={styles.descList}>
            <li>
              회사·사용자 메타데이터가 Oracle과 MariaDB에 중복 저장되어 변경 시
              두 DB의 정합성을 함께 관리해야 하는 부담이 존재
            </li>
          </ul>

          <h4>2) 선택 기준과 구현</h4>
          <ul className={styles.descList}>
            <li>중복 관리하던 메타데이터를 MariaDB로 일원화</li>
            <li>
              <mark className={styles.keyHighlight}>
                MariaDB 후보 ID 조회 → Oracle 발송 이력 조회 → 서비스 계층 매핑
              </mark>
              순서로 조회 구조 구현
            </li>
            <li>
              실제 사용자와 조회 데이터 규모를 기준으로 IN절과 애플리케이션
              매핑의 적용 가능 범위를 검토
            </li>
          </ul>

          <h4>3) 검증 결과</h4>
          <ul className={styles.descList}>
            <li>
              이중 저장에 따른 정합성 관리 부담과 저장 트랜잭션 복잡도 감소
            </li>
            <li>분리된 두 DB에서도 회사·사용자 기준 발송 이력 조회 구현</li>
          </ul>
        </PortfolioTroubleCard>

        <PortfolioTroubleCard title="Case 3. 변화하는 데이터셋의 조회 시점 고정">
          <h4>1) 문제 맥락</h4>
          <ul className={styles.descList}>
            <li>
              발송 이력이 계속 추가되어 페이지를 이동하는 사이 정렬 순서가
              바뀌고, 이미 본 데이터가 다시 나오거나 일부 데이터를 건너뛸 수
              있음
            </li>
            <li>
              조회 중 새로 들어온 데이터와 기존 조회 범위를 구분하기 어려움
            </li>
          </ul>

          <h4>2) 선택 기준과 구현</h4>
          <ul className={styles.descList}>
            <li>
              최초 조회 시점의 정렬 기준을
              <mark className={styles.keyHighlight}>앵커로 저장해 조회 범위를 고정</mark>
            </li>
            <li>
              앵커 이후 유입된 데이터는 목록에 즉시 섞지 않고 신규 건수로 별도
              표시
            </li>
            <li>사용자가 갱신할 때 새 앵커를 적용해 최신 조회 범위로 전환</li>
          </ul>

          <h4>3) 검증 결과</h4>
          <ul className={styles.descList}>
            <li>
              페이지 이동 중 중복·누락 가능성을 줄이고 조회 흐름을 일관되게 유지
            </li>
            <li>
              실시간 신규 데이터의 존재를 알리면서도 사용자의 현재 위치를 보존
            </li>
          </ul>
        </PortfolioTroubleCard>

        <PortfolioTroubleCard title="Case 4. 화면 골격과 JSON API의 책임 분리">
          <h4>1) 문제 맥락</h4>
          <ul className={styles.descList}>
            <li>
              Thymeleaf 화면에서 DOM 조회와 이벤트 처리 코드를 Vanilla
              JavaScript로 반복 작성해 화면 로직이 장황해짐
            </li>
            <li>
              Fragment에 서버 데이터를 직접 전달하는 구조는 화면과 서버의 결합을
              높여 이후 클라이언트 렌더링 방식으로 전환하기 어려움
            </li>
          </ul>

          <h4>2) 선택 기준과 구현</h4>
          <ul className={styles.descList}>
            <li>
              Thymeleaf는 레이아웃과 초기 화면 골격을 담당하도록 역할을 한정
            </li>
            <li>
              목록·상세 데이터는 Fragment 대신
              <mark className={styles.keyHighlight}>JSON API로 제공</mark>
            </li>
            <li>
              Alpine.js로 UI 상태와 이벤트를 선언적으로 처리해 직접적인 DOM
              조작을 축소
            </li>
          </ul>

          <h4>3) 검증 결과</h4>
          <ul className={styles.descList}>
            <li>
              반복적인 JavaScript 코드를 줄여 화면 로직의 가독성과 유지보수성
              개선
            </li>
            <li>
              화면과 데이터 전달 구조의 결합을 낮춰 JSON API 재사용 기반 확보
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
          <li>
            <strong>DB 레이어:</strong> Oracle 11g 호환성, QueryDSL bulk UPDATE,
            페이징 쿼리는 실제 DB 환경에서 검증
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
