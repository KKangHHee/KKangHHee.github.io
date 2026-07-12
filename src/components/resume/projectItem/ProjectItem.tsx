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
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.organization}>[{organization}]</span>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div>
          <span className={styles.period}>{members} 구성</span>
          <span> | </span>
          <time className={styles.period}>({period})</time>
        </div>
      </header>

      <div className={styles.content}>
        <dl className={styles.meta}>
          <div className={styles.metaItem}>
            <dt>• 서비스</dt>
            <dd>{service}</dd>
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
            <ul className={styles.flowList}>
              {highlights.map(({ title, description }, index) => (
                <li
                  key={`${title ?? "highlight"}-${index}`}
                  className={styles.flowItem}
                >
                  {title && (
                    <strong className={styles.flowTitle}>
                      {index}) {title}
                    </strong>
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
