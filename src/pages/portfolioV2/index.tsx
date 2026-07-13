import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { PROJECTS } from "@site/src/data/projects.data";
import styles from "./portfolioV2.module.css";

const projectLinks: Record<string, string> = {
  "사내 메시지 발송 관리 서비스 마이그레이션": "/portfolioV2/msg-manage",
  "Bargain Hunter": "/portfolio/bargain-hunter",
  "Security Ticket": "/portfolio/security-ticket",
  ReadyVery: "/portfolio/ready-berry",
};

export default function PortfolioV2Index() {
  return (
    <Layout title="프로젝트 포트폴리오 V2">
      <main className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>BACKEND PORTFOLIO</p>
          <h1>문제를 이해하고, 운영 가능한 구조로 바꿉니다.</h1>
          <p className={styles.lead}>
            Java와 Spring Boot를 기반으로 레거시 마이그레이션, 데이터 조회 구조,
            인증과 성능 문제를 해결한 과정을 정리했습니다.
          </p>
          <div className={styles.heroLinks}>
            <Link className={styles.primaryLink} to="/resume">
              이력서 보기
            </Link>
            <a className={styles.secondaryLink} href="mailto:skh8609@naver.com">
              이메일
            </a>
          </div>
        </header>

        <section className={styles.section} aria-labelledby="projects-heading">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionIndex}>01</p>
            <div>
              <h2 id="projects-heading">Projects</h2>
              <p>최근 경험부터 역할과 핵심 결과를 빠르게 확인할 수 있습니다.</p>
            </div>
          </div>

          <div className={styles.projectGrid}>
            {PROJECTS.map((project, index) => (
              <article className={styles.projectCard} key={project.title}>
                <div className={styles.cardMeta}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{project.period}</span>
                </div>
                <p className={styles.organization}>{project.organization}</p>
                <h3>{project.title}</h3>
                <p className={styles.service}>{project.service}</p>
                <dl className={styles.projectSummary}>
                  <div>
                    <dt>역할</dt>
                    <dd>{project.role}</dd>
                  </div>
                  <div>
                    <dt>기술</dt>
                    <dd>{project.stack.join(" · ")}</dd>
                  </div>
                </dl>
                <ul className={styles.outcomeList}>
                  {project.highlights.slice(0, 2).map((highlight) => (
                    <li key={highlight.title}>{highlight.title}</li>
                  ))}
                </ul>
                <Link className={styles.cardLink} to={projectLinks[project.title]}>
                  상세 내용 보기 <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
