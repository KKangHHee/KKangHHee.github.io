import Link from "@docusaurus/Link";
import { PROJECTS } from "@site/src/data/projects.data";
import Layout from "@theme/Layout";
import styles from "./portfolioV2.module.css";

const projectLinks: Record<string, string> = {
  "사내 메시지 발송 관리 서비스 마이그레이션": "/portfolioV2/msg-manage",
  "Bargain Hunter": "/portfolio/bargain-hunter",
  "Security Ticket": "/portfolio/security-ticket",
  ReadyVery: "/portfolio/ready-berry",
};

const skills = [
  [
    "Backend",
    "Java · Spring Boot · Spring Security · JPA · QueryDSL · MyBatis",
  ],
  ["Database", "Oracle · MariaDB · MySQL · PostgreSQL"],
  ["Testing / Infra", "JUnit · Mockito · Docker"],
  ["Frontend", "React · TypeScript"],
];

export default function PortfolioV2Index() {
  return (
    <Layout title="신강희 | 백엔드 개발자 포트폴리오">
      <main className={`${styles.page} ${styles.fullPortfolio}`}>
        <header className={styles.profileHero}>
          <div>
            <p className={styles.eyebrow}>BACKEND DEVELOPER PORTFOLIO</p>
            <h1>신강희</h1>
            <p className={styles.profileRole}>Backend Developer</p>
            <p className={styles.lead}>
              사용자의 불편과 운영 과정의 문제를 이해하고, 기술을 통해 신뢰할 수
              있는 구조로 개선하는 개발자입니다.
            </p>
            <address className={styles.contactList}>
              <a href="mailto:skh8609@naver.com">skh8609@naver.com</a>
              <a
                href="https://github.com/KKangHHee"
                target="_blank"
                rel="noreferrer"
              >
                github.com/KKangHHee
              </a>
            </address>
          </div>
          <img
            className={styles.profileImage}
            src="/img/resume/profileimg.jpg"
            alt="신강희 프로필"
          />
        </header>

        <section className={styles.section} aria-labelledby="about-heading">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionIndex}>01</p>
            <div>
              <h2 id="about-heading">About</h2>
              <p>기능 구현을 넘어 문제의 배경과 운영 흐름을 살핍니다.</p>
            </div>
          </div>
          <p className={styles.aboutText}>
            프론트엔드 프로젝트와 백엔드 인턴 경험을 거치며 좋은 서비스는 보이는
            기능뿐 아니라 실제 업무와 운영 흐름을 이해할 때 완성된다는 점을
            배웠습니다. 맡은 문제의 원인을 끝까지 살피고 작은 개선을 꾸준히
            쌓아, 운영하기 쉽고 변화에 대응할 수 있는 서비스를 만드는 것을
            지향합니다.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="skills-heading">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionIndex}>02</p>
            <div>
              <h2 id="skills-heading">Stack &amp; Tools</h2>
              <p>프로젝트에서 직접 사용한 기술을 역할별로 정리했습니다.</p>
            </div>
          </div>
          <dl className={styles.skillGrid}>
            {skills.map(([category, values]) => (
              <div key={category}>
                <dt>{category}</dt>
                <dd>{values}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.section} aria-labelledby="projects-heading">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionIndex}>03</p>
            <div>
              <h2 id="projects-heading">Projects &amp; Experience</h2>
              <p>
                담당 역할과 문제 해결 과정, 결과를 전체 내용으로 제공합니다.
              </p>
            </div>
          </div>

          <div className={styles.fullProjectList}>
            {PROJECTS.map((project, index) => (
              <article className={styles.fullProject} key={project.title}>
                <header className={styles.fullProjectHeader}>
                  <div className={styles.projectNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p className={styles.organization}>
                      {project.organization}
                    </p>
                    <h3>{project.title}</h3>
                    <p className={styles.service}>{project.service}</p>
                  </div>
                </header>

                <dl className={styles.fullProjectFacts}>
                  <div>
                    <dt>기간 · 구성</dt>
                    <dd>
                      {project.period} · {project.members}
                    </dd>
                  </div>
                  <div>
                    <dt>담당 역할</dt>
                    <dd>{project.role}</dd>
                  </div>
                  <div>
                    <dt>기술 스택</dt>
                    <dd>{project.stack.join(" · ")}</dd>
                  </div>
                </dl>

                <div className={styles.fullHighlights}>
                  <h4>핵심 문제 해결 및 성과</h4>
                  <ol>
                    {project.highlights.map((highlight) => (
                      <li key={highlight.title}>
                        <h5>{highlight.title}</h5>
                        <p>{highlight.description}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <Link
                  className={styles.detailLink}
                  to={projectLinks[project.title]}
                >
                  상세 문제 해결 과정 보기 <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section
          className={styles.section}
          aria-labelledby="background-heading"
        >
          <div className={styles.sectionHeading}>
            <p className={styles.sectionIndex}>04</p>
            <div>
              <h2 id="background-heading">Education &amp; Credentials</h2>
              <p>교육, 학력, 자격 및 관련 활동입니다.</p>
            </div>
          </div>
          <div className={styles.backgroundColumns}>
            <article>
              <h3>Education</h3>
              <dl className={styles.historyList}>
                <div>
                  <dt>SK플래닛 웹풀스택 개발자 과정</dt>
                  <dd>
                    2024.12 - 2025.05 · Java/Spring Boot, JS/React 과정 수료
                  </dd>
                </div>
                <div>
                  <dt>가톨릭대학교 컴퓨터정보공학부</dt>
                  <dd>2019.03 - 2025.08 · 학점 4.0 / 4.5</dd>
                </div>
              </dl>
            </article>
            <article>
              <h3>Certifications</h3>
              <ul className={styles.simpleList}>
                <li>정보처리기사 · 2024.12</li>
                <li>SQLD · 2024.12</li>
                <li>TOEIC SPEAKING IL · 2025.12</li>
              </ul>
            </article>
            <article className={styles.activities}>
              <h3>Activities</h3>
              <ul className={styles.simpleList}>
                <li>데이터베이스 설계 튜터 · 2024.09 - 2024.11</li>
                <li>하나소셜벤처 서비스 기획 및 피칭 · 2024.07</li>
                <li>
                  UMC IT 동아리 프론트엔드 스터디 및 팀 프로젝트 · 2023.03 -
                  2023.08
                </li>
              </ul>
            </article>
          </div>
        </section>
      </main>
    </Layout>
  );
}
