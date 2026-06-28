import Heading from "@theme/Heading";
import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

/**
 * 기술 스택 아이템 타입
 */
type SkillItem = {
  title: string;
  icon: string; // 이모지 사용
  description: ReactNode;
  skills: string[];
};

/**
 * 주요 기술 스택 목록
 */
const SkillList: SkillItem[] = [
  {
    title: "Backend Development",
    icon: "⚙️",
    description: (
      <>
        견고하고 확장 가능한 서버 아키텍처를 설계하고, 대용량 트래픽을 처리하는
        REST API를 개발합니다.
      </>
    ),
    skills: ["Java 17+", "Spring Boot", "JPA/Hibernate", "Spring Security"],
  },
  {
    title: "Database & Caching",
    icon: "💾",
    description: (
      <>
        효율적인 데이터 모델링과 쿼리 최적화를 통해 빠르고 안정적인 데이터
        처리를 구현합니다.
      </>
    ),
    skills: ["MySQL", "PostgreSQL", "Redis", "Query Optimization"],
  },
  {
    title: "DevOps & Tools",
    icon: "🚀",
    description: (
      <>
        컨테이너 기반 배포와 CI/CD 파이프라인을 구축하여 안정적인 서비스 운영
        환경을 만듭니다.
      </>
    ),
    skills: ["Docker", "GitHub Actions", "AWS", "Git"],
  },
];

/**
 * 개별 기술 스택 카드 컴포넌트
 */
function SkillCard({ title, icon, description, skills }: SkillItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className={styles.skillCard}>
        <div className={styles.skillIcon}>{icon}</div>
        <Heading as="h3" className={styles.skillTitle}>
          {title}
        </Heading>
        <p className={styles.skillDescription}>{description}</p>
        <div className={styles.skillTags}>
          {skills.map((skill, idx) => (
            <span key={idx} className={styles.skillTag}>
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 주요 프로젝트 쇼케이스
 */
const ProjectShowcase = [
  {
    title: "ReadyVery",
    description: "테이블 오더 서비스 애플리케이션",
    tech: ["Spring Boot", "MySQL", "Redis", "WebSocket"],
    link: "/docs/projects/readyberry",
  },
  // {
  //   title: 'BackOffice System',
  //   description: '관리자용 대시보드 및 통계 시스템',
  //   tech: ['Spring Boot', 'PostgreSQL', 'React'],
  //   link: '/docs/projects/backoffice',
  // },
];

function ProjectCard({ title, description, tech, link }) {
  return (
    <div className={clsx("col col--6")}>
      <div className={styles.projectCard}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <div className={styles.projectTech}>
          {tech.map((t, idx) => (
            <span key={idx} className={styles.techBadge}>
              {t}
            </span>
          ))}
        </div>
        <a href={link} className={styles.projectLink}>
          자세히 보기 →
        </a>
      </div>
    </div>
  );
}

/**
 * 메인 Features 섹션
 */
export default function HomepageFeatures(): ReactNode {
  return (
    <>
      {/* 기술 스택 섹션 */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <Heading as="h2">💡 Core Skills</Heading>
            <p className={styles.sectionSubtitle}>
              실무에서 활용하는 핵심 기술 스택입니다
            </p>
          </div>
          <div className="row">
            {SkillList.map((props, idx) => (
              <SkillCard key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>

      {/* 프로젝트 쇼케이스 섹션 */}
      {/* <section className={styles.projects}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <Heading as="h2">🚀 Featured Projects</Heading>
            <p className={styles.sectionSubtitle}>주요 프로젝트를 살펴보세요</p>
          </div>
          <div className="row">
            {ProjectShowcase.map((props, idx) => (
              <ProjectCard key={idx} {...props} />
            ))}
          </div>
        </div>
      </section> */}
    </>
  );
}
