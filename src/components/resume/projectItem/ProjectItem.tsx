import { ProjectProps } from "@site/src/components/resume/projectItem/ProjectItemType";
import styles from "./ProjectItem.module.css";

export default function ProjectItem({
  organization,
  title,
  period,
  role,
  stack,
  members,
  service,
  highlights,
}: ProjectProps) {
  return (
    <article className={styles.project}>
      <header>
        <h3 className={styles.title}>
          <span className={styles.organization}>[{organization}]</span> {title}
        </h3>
      </header>
      <div className={styles.content}>
        <dl className={styles.meta}>
          <div className={styles.metaItem}>
            <dt>• 서비스</dt>
            <dd>{service}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt>• 기간 / 인원</dt>
            <dd>
              {period} | {members}
            </dd>
          </div>
          <div className={styles.metaItem}>
            <dt>• 담당 역할</dt>
            <dd>{role}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt>• 기술 스택</dt>
            <dd className={styles.stackContainer}>
              {stack.map((technology) => (
                <span key={technology} className={styles.stackBadge}>
                  {technology}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        {highlights.length > 0 && (
          <section className={styles.flowSection}>
            <h4 className={styles.solutionEx}>[주요 경험 및 성과]</h4>
            <ul className={styles.flowList}>
              {highlights.map(({ title, description }, index) => (
                <li
                  key={`${title ?? "highlight"}-${index}`}
                  className={styles.flowItem}
                >
                  {title && (
                    <strong className={styles.flowTitle}>{title}</strong>
                  )}
                  <p className={styles.problemContainer}>{description}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
