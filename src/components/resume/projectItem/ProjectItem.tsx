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
        <div className={styles.projectIdentity}>
          <span className={styles.organization}>[{organization}]</span>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <p className={styles.projectMeta}>
          <time>({period})</time>
          <span aria-hidden="true"> · </span>
          <span>{members}</span>
        </p>
      </header>

      <div className={styles.projectContent}>
        <dl className={styles.metaList}>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>
              <strong>서비스</strong>
            </dt>
            <dd className={styles.metaValue}>{service}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>
              <strong>담당 역할</strong>
            </dt>
            <dd className={styles.metaValue}>{role}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>
              <strong>기술 스택</strong>
            </dt>
            <dd className={`${styles.metaValue} ${styles.stackText}`}>
              {stack.join(" · ")}
            </dd>
          </div>
        </dl>

        {highlights.length > 0 && (
          <section className={styles.highlightsSection}>
            <ul className={styles.highlightList}>
              {highlights.map(({ title, description }, index) => (
                <li
                  key={`${title ?? "highlight"}-${index}`}
                  className={styles.highlightItem}
                >
                  {title && (
                    <strong className={styles.highlightTitle}>{title}</strong>
                  )}
                  <span className={styles.highlightDescription}>
                    {description}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
