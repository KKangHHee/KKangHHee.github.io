import PortfolioSection from "@site/src/components/portfolio/PortfolioSection";
import PortfolioTroubleCard from "@site/src/components/portfolio/PortfolioTroubleCard";
import ProjectOverview from "@site/src/components/portfolio/ProjectOverview";
import styles from "./portfolio.module.css";

type PortfolioProps = { embedded?: boolean };

export default function Portfolio({ embedded = false }: PortfolioProps) {
  return (
    <ProjectOverview
      embedded={embedded}
      projectName="ReadyVery"
      summary="로컬 카페의 사전 주문과 결제를 지원하고 실제 매장에서 운영한 패스트오더 서비스"
      period="2023.12 - 2024.05"
      team="BE 2인 / FE 4인"
      role="프론트엔드 개발 및 API 인터페이스 설계"
      stack={[
        "React",
        "TypeScript",
        "React Query",
        "Recoil",
        "Toss Payments SDK",
      ]}
      links={[
        {
          label: "GitHub",
          href: "https://github.com/readyvery/readyFront",
        },
        {
          label: "사용자 서비스",
          href: "https://ready.marinesnow34.com/",
        },
        {
          label: "점주 서비스",
          href: "https://ceo-ready.marinesnow34.com/",
        },
      ]}
      achievements={[
        "결제 SDK 재초기화를 제거해 로딩시간 약 70% 단축 (3초 → 1초)",
        "교내 축제와 학교 인근 카페 2곳에서 실사용 운영",
      ]}
    >
      <PortfolioSection title="1. 핵심 문제 해결 및 성과">
        <PortfolioTroubleCard title="Case 1. 결제 SDK 생명주기와 금액 갱신 책임 분리">
          <h4>1) 문제 맥락</h4>
          <ul className={styles.descList}>
            <li>
              Toss Payments Widget 초기화 시 <strong>3초</strong> 소요
            </li>
            <li>
              쿠폰/포인트 적용 시 <strong>화면 깜빡임</strong> 발생
            </li>
            <li>
              <code>useEffect</code> 중복 실행으로 SDK가 여러 번 초기화됨
            </li>
          </ul>

          <h4>2) 선택 기준과 구현</h4>
          <ul className={styles.descList}>
            <li>
              <code>useEffect([])</code>로 SDK 초기화를{" "}
              <strong>마운트 시 1회만 실행</strong>
            </li>
            <li>
              SDK 인스턴스를 <code>useRef</code>로 관리하여 리렌더링과 분리
            </li>
            <li>
              결제 버튼 클릭 시 서버 계산 금액 기준으로
              <code> updateAmount()</code> 호출
            </li>
          </ul>

          <h4>3) 검증 결과</h4>
          <ul className={styles.descList}>
            <li>
              결제 페이지 로딩 시간
              <mark className={styles.keyHighlight}>
                3초 → 1초 (약 70% 개선)
              </mark>
            </li>
            <li>
              <code>useEffect</code> 실행 횟수
              <mark className={styles.keyHighlight}>8~12회 → 1회</mark>
            </li>
            <li>
              화면 깜빡임 현상 <mark className={styles.keyHighlight}>개선</mark>
            </li>
          </ul>

          <h4>4) 설계 회고</h4>
          <ul className={styles.descList}>
            <li>SDK 초기화 로직과 결제 요청 로직을 명확히 분리</li>
            <li>서버 금액 계산 → 클라이언트 반영 구조로 보안/정합성 보완</li>
          </ul>
        </PortfolioTroubleCard>

        <PortfolioTroubleCard title="Case 2. 실제 매장 운영을 통해 주문 흐름 개선">
          <h4>1) 문제 맥락</h4>
          <ul className={styles.descList}>
            <li>
              개발 환경에서 완성한 주문 흐름이 혼잡한 축제와 실제 카페
              운영에서도 충분히 이해하기 쉽고 안정적인지 확인할 필요가
              있었습니다.
            </li>
            <li>
              사용자 화면뿐 아니라 주문을 접수하는 점주의 업무 흐름까지 함께
              맞춰야 했습니다.
            </li>
          </ul>

          <h4>2) 선택 기준과 구현</h4>
          <ul className={styles.descList}>
            <li>
              교내 축제와 학교 인근 카페 2곳에 서비스를 배포해 실제 주문을
              관찰했습니다.
            </li>
            <li>
              점주와 사용자의 피드백을 기능별로 정리하고 주문 확인, 상태 안내,
              결제 과정에서 혼동이 큰 항목부터 우선 반영했습니다.
            </li>
            <li>
              프론트엔드와 백엔드의 요청·응답 규격을 함께 조정해 운영 중 데이터
              불일치를 줄였습니다.
            </li>
          </ul>

          <h4>3) 검증 결과</h4>
          <ul className={styles.descList}>
            <li>
              <mark className={styles.keyHighlight}>
                축제와 카페 2곳에서 실제 주문 서비스를 운영
              </mark>
              하며 전체 주문 흐름을 검증했습니다.
            </li>
            <li>
              기능 완성도뿐 아니라 점주의 업무 비용과 장애 대응까지 고려하는
              기준을 얻었습니다.
            </li>
          </ul>

          <h4>4) 설계 회고</h4>
          <ul className={styles.descList}>
            <li>
              운영 지표와 장애 기록을 처음부터 구조화했다면 개선 전후를 더
              객관적으로 비교할 수 있었으며, 이후 프로젝트에서는 관측 가능성을
              초기 설계에 포함했습니다.
            </li>
          </ul>
        </PortfolioTroubleCard>
      </PortfolioSection>

      <PortfolioSection title="2. 성과 및 배운 점 – ReadyVery에서 얻은 것">
        <h3>프로젝트 성과</h3>
        <ul className={styles.descList}>
          <li>
            <strong>교내 축제에서 테이블 오더 서비스 운영</strong>
          </li>
          <li>
            <strong>학교 인근 카페 2곳 실사용 배포 및 실제 운영</strong>
          </li>
        </ul>

        <h3>배운 점 & 성장 포인트</h3>
        <ul className={styles.descList}>
          <li>
            기획–디자인–백엔드–마케팅과의 협업 과정을 통해, 서비스 전반을
            바라보는 시야 확보
          </li>
          <li>
            실제 점주 및 사용자 피드백을 반영하며, 비즈니스 관점에서 기능을
            우선순위화하는 경험
          </li>
          <li>
            프론트엔드에서 시작해 백엔드 설계까지 연결되는
            <strong> “전체 흐름을 보는 개발”</strong>의 중요성 인식
          </li>
          <li>
            “동작하는 코드”가 아니라
            <strong> “운영 가능한 코드”</strong>를 만드는 개발자를 목표로
          </li>
        </ul>
      </PortfolioSection>
    </ProjectOverview>
  );
}
