import ProjectItem from "@site/src/components/resume/projectItem/ProjectItem";
import { PROJECTS } from "@site/src/pages/projects.data";
import Layout from "@theme/Layout";
import styles from "./resume.module.css";

export default function Resume() {
  const stackList = (stack: string) => {
    stack.split(",").map((item) => item.trim());
  };
  const STACKS = {
    BE: "Java, SpringBoot, JPA, MyBatis",
    DB: "MySQL, PostgreSQL",
    INFRA: "AWS, Docker, GitHubActions, Jenkins",
    FE: "React, TypeScript",
  };

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
          <ul className={styles.stackTextList}>
            <li>
              <strong>Backend</strong> : Java, Spring Boot, Spring Security,
              JPA, MyBatis
            </li>
            <li>
              <strong>DB / Cache</strong> : MySQL, PostgreSQL, Redis
            </li>
            <li>
              <strong>Infra</strong> : AWS, Docker, GitHub Actions, Jenkins
            </li>
            <li>
              <strong>Frontend</strong> : React, TypeScript
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Projects</h2>
          {PROJECTS.map((project, idx) => (
            <ProjectItem key={idx} {...project} />
          ))}
        </section>

        <section className={styles.section}>
          <h2>Education</h2>
          <ul>
            <li>
              <strong>웹 풀스택 개발자 과정</strong> (2024.12 ~ 2025.05)
              <ul>
                <li>
                  Spring Boot 기반 REST API 설계, DB 튜닝, Redis 캐시 전략 실습
                </li>
              </ul>
            </li>
            <li>
              <strong>가톨릭대학교 컴퓨터정보공학부</strong> (2019.03 ~ 2025.08
              | 졸업)
              <ul>
                <li>
                  주요 이수 과목: 데이터베이스 설계, 데이터 통신, 운영체제
                </li>
              </ul>
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Certifications & Activities</h2>
          <ul>
            <li>
              <strong>정보처리기사</strong> (2024.12 | 한국산업인력공단)
            </li>
            <li>
              <strong>SQLD</strong> (2024.12 | 한국데이터산업진흥원)
            </li>
          </ul>
          <ul>
            <li>
              <strong>교내 데이터베이스 튜터</strong> (2024.09 ~ 2024.11)
            </li>
            <li>
              <strong>하나소셜벤처유니버시티 – 청년 창업 교육 수료</strong>{" "}
              (2024.07) — 창업 아이템 기획/피칭 경험
            </li>
            <li>
              <strong>UMC 대학생 IT 연합 동아리</strong> (2023.03 ~ 2023.08) —
              프론트 협업 경험
            </li>
          </ul>
        </section>
      </main>
    </Layout>
  );
}
