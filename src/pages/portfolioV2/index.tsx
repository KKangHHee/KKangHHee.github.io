import Layout from "@theme/Layout";
import BargainHunter from "../portfolio/bargain-hunter";
import MsgManage from "../portfolio/msg-manage";
import ReadyVery from "../portfolio/ready-berry";
import SecurityTicket from "../portfolio/security-ticket";

import styles from "./portfolioV2.module.css";

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
        <header className={styles.header}>
          <div className={styles.intro}>
            <div className={styles.nameLine}>
              <h1 className={styles.name}>신강희</h1>
              <span className={styles.role}>Backend Developer</span>
            </div>

            <div className={styles.contactBox}>
              <p>
                <strong>Email.</strong>
                <a href="mailto:skh8609@naver.com">skh8609@naver.com</a>
              </p>

              <p>
                <strong>GitHub.</strong>
                <a
                  href="https://github.com/KKangHHee"
                  target="_blank"
                  rel="noreferrer"
                >
                  github.com/KKangHHee
                </a>
              </p>
            </div>
            <p className={styles.lead}>
              사용자의 불편과 운영 과정의 문제를 이해하고, 기술을 통해 신뢰할 수
              있는 구조로 개선하는 개발자입니다.
            </p>
          </div>

          <div className={styles.profileWrapper}>
            <img
              src="/img/resume/profileimg.jpg"
              alt="신강희 프로필"
              className={styles.profileImg}
            />
          </div>
        </header>

        <section className={styles.section} aria-labelledby="projects-heading">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionIndex}>01</p>
            <div>
              <h2 id="projects-heading">Projects &amp; Experience</h2>
            </div>
          </div>
          <div className={styles.importedProject}>
            <MsgManage embedded />
          </div>
          <div className={styles.importedProject}>
            <BargainHunter embedded />
          </div>
          <div className={styles.importedProject}>
            <SecurityTicket embedded />
          </div>
          <div className={styles.importedProject}>
            <ReadyVery embedded />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="skills-heading">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionIndex}>02</p>
            <div>
              <h2 id="skills-heading">Stack &amp; Tools</h2>
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

        <section
          className={styles.section}
          aria-labelledby="background-heading"
        >
          <div className={styles.sectionHeading}>
            <p className={styles.sectionIndex}>03</p>
            <div>
              <h2 id="background-heading">Education &amp; Credentials</h2>
            </div>
          </div>
          <div className={styles.backgroundColumns}>
            <article>
              <h3>Education</h3>
              <ul className={styles.simpleList}>
                <li>SK플래닛 웹풀스택 개발자 과정 · 2024.12 - 2025.05</li>
                <li>
                  가톨릭대학교 컴퓨터정보공학부 · 학점 4.0 / 4.5 · 2019.03 -
                  2025.08
                </li>
              </ul>
            </article>
            <article>
              <h3>Activities</h3>
              <ul className={styles.simpleList}>
                <li>데이터베이스 설계 튜터 · 2024.09 - 2024.11</li>
                <li>하나소셜벤처유니버시티 · 서비스 기획 및 피칭 · 2024.07</li>
                <li>
                  UMC IT 동아리 · 프론트엔드 스터디 및 팀 프로젝트 · 2023.03 -
                  2023.08
                </li>
              </ul>
            </article>
            <article>
              <h3>Certifications</h3>
              <ul className={styles.simpleList}>
                <li>정보처리기사 · 2024.12</li>
                <li>SQLD · 2024.12</li>
                <li>TOEIC SPEAKING IL · 2025.12</li>
              </ul>
            </article>
          </div>
        </section>
      </main>
    </Layout>
  );
}
