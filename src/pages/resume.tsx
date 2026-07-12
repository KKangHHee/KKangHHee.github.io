import ProjectItem from "@site/src/components/resume/projectItem/ProjectItem";
import { PROJECTS } from "@site/src/data/projects.data";
import Layout from "@theme/Layout";
import styles from "./resume.module.css";

export default function Resume() {
  return (
    <Layout title="신강희 | 백엔드 개발자 이력서">
      <main className={styles.container}>
        {/* 기본 정보*/}
        <section className={styles.header}>
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
          </div>

          <div className={styles.profileWrapper}>
            <img
              src="/img/resume/profileimg.jpg"
              alt="신강희 프로필"
              className={styles.profileImg}
            />
          </div>
        </section>
        {/* 소개 */}
        <section className={styles.section}>
          <h2>Summary</h2>
          <p className={styles.summary}>
            사용자의 불편을 이해하고,
            <strong> 기술을 통해 더 나은 경험을 제공하는 개발</strong>
            을 지향합니다.
            <br />
            프론트엔드 프로젝트와 백엔드 인턴 경험을 거치며, 좋은 서비스는
            보이는 기능뿐 아니라 실제 업무와 운영 흐름을 이해할 때 완성된다는
            점을 배웠습니다.
            <br />
            맡은 문제의 배경과 원인을 끝까지 살피며,
            <strong>
              {" "}
              작은 개선을 꾸준히 쌓아 신뢰할 수 있는 서비스를 만드는 개발자
            </strong>
            로 성장하고 있습니다.
          </p>
        </section>

        {/* 경험 */}
        <section className={styles.section}>
          <h2>Experience</h2>
          {PROJECTS.map((project, idx) => (
            <ProjectItem key={idx} {...project} />
          ))}
        </section>

        {/* 기술 스택 */}
        <section className={styles.section}>
          <h2>Stack & Tools</h2>
          <ul className={styles.stackTextList}>
            <li>
              <strong>Backend</strong> : Java, Spring Boot, Spring Security,
              JPA, QueryDSL, MyBatis
            </li>
            <li>
              <strong>Database</strong> : Oracle, MariaDB, MySQL, PostgreSQL
            </li>
            <li>
              <strong>Testing / Infra</strong> : JUnit, Mockito, Docker
            </li>
            <li>
              <strong>Frontend</strong> : React, TypeScript
            </li>
          </ul>
        </section>

        {/* 학력 / 자격증 */}
        <div className={styles.bottomGrid}>
          {/* 왼쪽: Education */}
          <section className={styles.section}>
            <h2>Education</h2>
            <div className={styles.infoItem}>
              <div className={styles.infoTitle}>
                <strong>[SK플래닛] 웹풀스택 개발자 과정</strong>
                <span className={styles.period}>(2024.12 - 2025.05)</span>
              </div>
              <ul className={styles.subDesc}>
                <li>Java/Spring Boot, JS/React 기반 풀스택 교육 수료</li>
              </ul>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoTitle}>
                <strong>[가톨릭대학교] 컴퓨터정보공학부</strong>
                <span className={styles.period}>(2019.03 - 2025.08)</span>
              </div>
              <ul className={styles.subDesc}>
                <li>학점: 4.0 / 4.5</li>
                <li>주요 이수: 데이터베이스 설계, 데이터 통신, 운영체제</li>
              </ul>
            </div>
          </section>

          {/* 오른쪽: Certifications & Activities */}
          <section className={styles.section}>
            <h2>Certifications</h2>
            <div className={styles.infoItem}>
              <ul className={styles.subDesc}>
                <li>
                  정보처리기사 <span className={styles.period}> (2024.12)</span>
                </li>
                <li>
                  SQLD <span className={styles.period}> (2024.12)</span>
                </li>
                <li>
                  TOEIC SPEAKING / IL
                  <span className={styles.period}> (2025.12)</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
        <section className={styles.section}>
          <h2>Activities</h2>
          <div className={styles.infoItem}>
            <ul className={styles.subDesc}>
              <li>
                <strong>데이터베이스 설계 튜터</strong>
                <span className={styles.period}> (2024.09 – 2024.11)</span>
                &nbsp;:&nbsp; 데이터 모델링, 정규화, SQL 실습 지도
              </li>
              <li>
                <strong>하나소셜벤처</strong>{" "}
                <span className={styles.period}> (2024.07)</span>&nbsp;:&nbsp;
                서비스 기획 및 피칭 수료
              </li>
              <li>
                <strong>UMC IT 동아리</strong>
                <span className={styles.period}> (2023.03 – 2023.08)</span>
                &nbsp;:&nbsp; 프론트엔드 스터디와 팀 프로젝트 참여
              </li>
            </ul>
          </div>
        </section>
      </main>
    </Layout>
  );
}
