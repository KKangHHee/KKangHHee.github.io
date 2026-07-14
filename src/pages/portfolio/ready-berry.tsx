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
              결제 위젯이 화면 상태가 바뀔 때마다 다시 초기화되면서 평균 3초의
              로딩 지연과 화면 깜빡임이 발생했습니다.
            </li>
            <li>
              쿠폰·포인트 적용 시 클라이언트가 계산한 금액을 그대로 결제 요청에
              실어 보내는 구조라, 클라이언트 값과 실제 청구 금액이 어긋날 여지가
              있었습니다.
            </li>
          </ul>

          <h4>2) 선택 기준과 구현</h4>
          <ul className={styles.descList}>
            <li>
              <code>useEffect([])</code>로 SDK 초기화를{" "}
              <strong>마운트 시 한 번만 실행</strong>하도록 구성 위젯의 하고 SDK
              인스턴스를 <code>useRef</code>로 관리해 리렌더링과 분리해, 상태가
              바뀌어도 위젯이 다시 초기화되지 않는 구조로 설계했습니다.
            </li>
            <li>
              결제 요청 시점에는 클라이언트 계산값이 아니라{" "}
              <strong>서버가 재계산한 금액</strong>을 기준으로 결제 API를
              호출하도록 요청·응답 규격을 백엔드와 함께 조정했습니다.
            </li>
          </ul>

          <h4>3) 검증 결과</h4>
          <ul className={styles.descList}>
            <li>
              결제 페이지 로딩 시간{" "}
              <mark className={styles.keyHighlight}>
                3초 → 1초 (약 70% 개선)으로 개선했습니다.
              </mark>
            </li>
            <li>
              화면 깜빡임 현상 해소, 반복 초기화로 인한 불필요한 API 재요청 제거
            </li>
            <li>
              클라이언트 표시 금액과 서버 청구 금액을 항상 일치시켜 결제 정합성
              이슈를 사전에 차단
            </li>
          </ul>

          <h4>4) 설계 회고</h4>
          <ul className={styles.descList}>
            <li>
              화면 로직 하나를 고치는 문제가 아니라,{" "}
              <strong>
                어디까지를 클라이언트가 책임지고 어디부터를 서버가 검증해야
                하는가
              </strong>
              를 정하는 문제였다는 것을 체감했습니다.
            </li>
          </ul>
        </PortfolioTroubleCard>
      </PortfolioSection>

      <PortfolioSection title="2. 배운 점">
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
            “동작하는 코드”가 아니라
            <strong> “운영 가능한 코드”</strong>를 만드는 개발자를 목표하는
            계기가 되었습니다.{" "}
          </li>
        </ul>
      </PortfolioSection>
    </ProjectOverview>
  );
}
