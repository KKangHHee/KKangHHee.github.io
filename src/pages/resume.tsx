import ProjectItem from "@site/src/components/resume/projectItem/ProjectItem";
import TechTag from "@site/src/components/resume/tag/TechTag";
import { PROJECTS } from "@site/src/pages/projects.data";
import Layout from "@theme/Layout";
import styles from "./resume.module.css";

export default function Resume() {
  return (
    <Layout title="Resume">
      <main className={styles.container}>
        <section className={styles.header}>
          {/* 1. 프로필 사진 영역 */}
          <div className={styles.profileWrapper}>
            <img
              src="/img/resume/profileimg.jpg"
              alt="신강희 프로필"
              className={styles.profileImg}
            />
          </div>

          {/* 2. 중앙 이름 및 자기소개 영역 */}
          <div className={styles.intro}>
            <div className={styles.nameLine}>
              <h1 className={styles.name}>신강희</h1>
              <span className={styles.role}>Backend Developer</span>
            </div>
            <p className={styles.summary}>
              Java 기반의 신입 백엔드 개발자입니다. <br />
              프론트 경험을 통해 사용자 흐름을 이해하고, 견고한 시스템을
              지향합니다. <br />
            </p>
          </div>

          {/* 3. 우측 연락처 영역 */}
          <div className={styles.contactBox}>
            <p>
              <strong>Email.</strong> skh8609@gmail.com
            </p>
            <p>
              <strong>GitHub.</strong>{" "}
              <a href="https://github.com/KKangHHee">github.com/KKangHHee</a>
            </p>
            <p>
              <strong>Blog.</strong>{" "}
              <a href="https://hee-ya07.tistory.com/">hee-ya07.tistory.com</a>
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Summary</h2>
          <ul>
            <li>Java / Spring Boot 기반 REST API 설계 및 성능 최적화 경험</li>
            <li>Redis, DB 튜닝, 캐시 전략으로 병목 해결</li>
            <li>React 실서비스 경험 → 사용자 관점 API 설계</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Stack & Tools</h2>

          <div className={styles.stackGroup}>
            <div className={styles.stackRow}>
              <span className={styles.stackLabel}>Core</span>
              <div className={styles.stackItems}>
                <TechTag src="/img/resume/java.svg" label="Java" />
                <TechTag src="/img/resume/spring.svg" label="Spring Boot" />
                <TechTag
                  src="/img/resume/springsecurity.svg"
                  label="Spring Security"
                />
                <TechTag src="/img/resume/jpa.svg" label="JPA" />
                <TechTag src="/img/resume/mybatis.svg" label="MyBatis" />
              </div>
            </div>

            <div className={styles.stackRow}>
              <span className={styles.stackLabel}>DB</span>
              <div className={styles.stackItems}>
                <TechTag src="/img/resume/postgresql.svg" label="PostgreSQL" />
                <TechTag src="/img/resume/mysql.svg" label="MySQL" />
              </div>
            </div>

            <div className={styles.stackRow}>
              <span className={styles.stackLabel}>Infra</span>
              <div className={styles.stackItems}>
                <TechTag src="/img/resume/aws.svg" label="AWS" />
                <TechTag src="/img/resume/docker.svg" label="Docker" />
                <TechTag
                  src="/img/resume/githubactions.svg"
                  label="GitHubActions"
                />
                <TechTag src="/img/resume/jenkins.svg" label="Jenkins" />
              </div>
            </div>

            <div className={styles.stackRow}>
              <span className={styles.stackLabel}>Frontend</span>
              <div className={styles.stackItems}>
                <TechTag src="/img/resume/react.svg" label="React" />
                <TechTag src="/img/resume/typescript.svg" label="TypeScript" />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Projects</h2>
          {PROJECTS.map((project, idx) => (
            <ProjectItem key={idx} {...project} />
          ))}
        </section>

        <section className={styles.section}>
          <h2>Education</h2>
          <p>가톨릭대학교 컴퓨터정보공학부</p>
        </section>
      </main>
    </Layout>
  );
}
