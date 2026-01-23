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
  flows,
  extras,
}: ProjectProps) {
  const stackList = stack.split(",").map((item) => item.trim());
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
              {stackList.map((s, i) => (
                <span key={i} className={styles.stackBadge}>
                  {s}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        {flows && (
          <section className={styles.flowSection}>
            <h4 className={styles.solutionEx}>[핵심 문제 해결]</h4>
            <ul className={styles.flowList}>
              {flows.map((f, i) => (
                <li key={i} className={styles.flowItem}>
                  <strong className={styles.flowTitle}>{f.title}</strong>
                  {/* 내용 */}
                  <div className={styles.problemContainer}>
                    <strong className={styles.domain}>&nbsp;{f.domain}</strong>
                    <span> 시,</span>&nbsp;
                    <span className={styles.problem}>{f.problem}</span>
                    <span> 발생</span>
                  </div>
                  {/* 해결 및 성과 */}
                  <div className={styles.solutionContainer}>
                    <span aria-hidden="true">⇒&nbsp;</span>
                    <span className={styles.solution}>{f.solution},</span>&nbsp;
                    <mark className={styles.result}>{f.result}</mark>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {extras && (
          <footer className={styles.extraFooter}>
            <h4 className={styles.solutionEx}>[주요 기여 및 인사이트]</h4>
            <ul className={styles.extraList}>
              {extras.map((text, i) => (
                <li key={i}>{text}</li>
              ))}
            </ul>
          </footer>
        )}
      </div>
    </article>
  );
}
