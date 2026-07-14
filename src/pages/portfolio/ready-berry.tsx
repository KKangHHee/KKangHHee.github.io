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
              Toss Payments Widget 초기화에 <strong>3초</strong>가 소요됐습니다.
            </li>
            <li>
              쿠폰과 포인트를 적용할 때 <strong>화면 깜빡임</strong>이
              발생했습니다.
            </li>
            <li>
              <code>useEffect</code>가 중복 실행되어 SDK가 여러 번
              초기화됐습니다.
            </li>
          </ul>

          <h4>2) 선택 기준과 구현</h4>
          <ul className={styles.descList}>
            <li>
              <code>useEffect([])</code>로 SDK 초기화를{" "}
              <strong>마운트 시 한 번만 실행</strong>하도록 구성했습니다.
            </li>
            <li>
              SDK 인스턴스를 <code>useRef</code>로 관리해 리렌더링과
              분리했습니다.
            </li>
            <li>
              결제 버튼을 클릭하면 서버가 계산한 금액을 기준으로
              <code> updateAmount()</code>를 호출했습니다.
            </li>
          </ul>

          <h4>3) 검증 결과</h4>
          <ul className={styles.descList}>
            <li>
              결제 페이지 로딩 시간
              <mark className={styles.keyHighlight}>
                3초 → 1초 (약 70% 개선)
              </mark>
              {"으로 단축했습니다."}
            </li>
            <li>
              <code>useEffect</code> 실행 횟수
              <mark className={styles.keyHighlight}>8~12회 → 1회</mark>로
              줄였습니다.
            </li>
            <li>
              화면 깜빡임 현상을{" "}
              <mark className={styles.keyHighlight}>개선했습니다.</mark>
            </li>
          </ul>

          <h4>4) 설계 회고</h4>
          <ul className={styles.descList}>
            <li>SDK 초기화 로직과 결제 요청 로직을 명확히 분리했습니다.</li>
            <li>
              서버 금액 계산 → 클라이언트 반영 구조로 보안과 정합성을
              보완했습니다.
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
