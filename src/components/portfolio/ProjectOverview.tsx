import styles from "@site/src/pages/portfolio/portfolio.module.css";
import Layout from "@theme/Layout";
import type { PropsWithChildren } from "react";

export type ProjectLink = {
  label: string;
  href: string;
};

type ProjectOverviewProps = PropsWithChildren<{
  embedded?: boolean;
  organization?: string;
  pageTitle?: string;
  projectName: string;
  summary: string;
  period: string;
  team: string;
  role: string;
  stack: string[];
  links?: ProjectLink[];
  achievements: string[];
}>;

export default function ProjectOverview({
  embedded = false,
  organization = "팀 프로젝트",
  pageTitle,
  projectName,
  summary,
  period,
  team,
  role,
  stack,
  links = [],
  achievements,
  children,
}: ProjectOverviewProps) {
  const content = (
    <>
      <header className={styles.overview}>
          <p className={styles.overviewEyebrow}>[{organization}]</p>
          {embedded ? (
            <h2 className={styles.overviewTitle}>{projectName}</h2>
          ) : (
            <h1 className={styles.overviewTitle}>{projectName}</h1>
          )}
          <p className={styles.overviewSummary}>{summary}</p>

          <dl className={styles.overviewMeta}>
            <div>
              <dt>기간</dt>
              <dd>{period}</dd>
            </div>
            <div>
              <dt>팀 구성</dt>
              <dd>{team}</dd>
            </div>
            <div className={styles.overviewRole}>
              <dt>역할</dt>
              <dd>{role}</dd>
            </div>
            <div className={styles.overviewStack}>
              <dt>기술 스택</dt>
              <dd>{stack.join(" · ")}</dd>
            </div>
          </dl>

          {links.length > 0 && (
            <nav className={styles.overviewLinks} aria-label="프로젝트 링크">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label} <span aria-hidden="true">↗</span>
                </a>
              ))}
            </nav>
          )}

          <section className={styles.overviewAchievements}>
            <h2>대표 성과</h2>
            <ul>
              {achievements.slice(0, 2).map((achievement) => (
                <li key={achievement}>{achievement}</li>
              ))}
            </ul>
          </section>
      </header>
      {children}
    </>
  );

  if (embedded) {
    return (
      <article className={`${styles.container} ${styles.embeddedProject}`}>
        {content}
      </article>
    );
  }

  return (
    <Layout title={pageTitle ?? `${projectName} | Project Portfolio`}>
      <main className={styles.container}>{content}</main>
    </Layout>
  );
}
