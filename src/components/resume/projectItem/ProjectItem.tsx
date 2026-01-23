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
  const metaItems = [
    { label: "서비스", value: service },
    { label: "일정", value: period },
    { label: "기술 스택", value: stack },
    { label: "참여 인원", value: members },
  ];

  return (
    <div className={styles.project}>
      <h3 className={styles.title}>
        <span className={styles.organization}>[{organization}]</span> {title}
      </h3>

      <div className={styles.meta}>
        <p>
          <strong>서비스: </strong> {service}
        </p>
        <p>
          <strong>기간 / 인원 </strong> {period} | {members}
        </p>
        <p>
          <strong>담당 역할: </strong> {role}
        </p>
        <p>
          <strong>기술 스택: </strong> {stack}
        </p>
      </div>

      <ol className={styles.flowList}>
        {flows.map((f, i) => (
          <li key={i} className={styles.flowItem}>
            <div>
              <span className={styles.domain}>{f.domain}</span>&nbsp;
              <span>시,&nbsp;</span>
              <span className={styles.problem}>{f.problem}</span>
              <span> 발생</span>
            </div>
            <div>
              <span>⇒&nbsp;</span>
              <span className={styles.solution}>{f.solution}</span>&nbsp;
              <span className={styles.result}>{f.result}</span>
            </div>
          </li>
        ))}
      </ol>

      {extras && (
        <ul className={styles.extraList}>
          {extras.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
