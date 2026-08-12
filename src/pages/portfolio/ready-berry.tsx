import PortfolioSection from "@site/src/components/portfolio/PortfolioSection";
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
      team="개발팀 BE 2인 / FE 4인"
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
      achievements={["교내 축제와 학교 인근 카페 2곳에서 실사용 운영"]}
    >
      <PortfolioSection title="1. 배운 점">
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
