import ProjectItem from "@site/src/components/resume/projectItem/ProjectItem";
import { PROJECTS } from "@site/src/data/projects.data";
import Layout from "@theme/Layout";
import styles from "./resume.module.css";

export default function Resume() {
  return (
    <Layout title="Resume">
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
              <strong>DB / Cache</strong> : MySQL, PostgreSQL, MariaDB, Oracle,
              Redis
            </li>
            <li>
              <strong>Test</strong> : JUnit5, Mockito
            </li>
            <li>
              <strong>Infra</strong> : AWS, Docker, GitHub Actions, Jenkins
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
                <strong>웹 풀스택 개발자 과정</strong>
                <span className={styles.period}>(2024.12 ~ 2025.05)</span>
              </div>
              <ul className={styles.subDesc}>
                <li>Java/Spring Boot 기반 REST API 설계 및 실무 중심 교육</li>
              </ul>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoTitle}>
                <strong>가톨릭대학교 컴퓨터정보공학부</strong>
                <span className={styles.period}>(2019.03 ~ 2025.08)</span>
              </div>
              <ul className={styles.subDesc}>
                <li>주요 이수: 데이터베이스 설계, 데이터 통신, 운영체제</li>
              </ul>
            </div>
          </section>

          {/* 오른쪽: Certifications & Activities */}
          <section className={styles.section}>
            <h2>Certs & Activities</h2>
            <div className={styles.infoItem}>
              <div className={styles.infoTitle}>
                <strong>Certifications</strong>
              </div>
              <ul className={styles.subDesc}>
                <li>정보처리기사 (2024.12)</li>
                <li>SQLD (SQL 개발자, 2024.12)</li>
              </ul>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoTitle}>
                <strong>Activities</strong>
              </div>
              <ul className={styles.subDesc}>
                <li>
                  <strong>교내 DB 튜터</strong>
                  (2024.09)
                  <br /> : 쿼리 작성 및 정규화 지도
                </li>
                <li>
                  <strong>하나소셜벤처</strong> (2024.07)
                  <br />: 서비스 기획 및 피칭 수료
                </li>
                <li>
                  <strong>UMC IT 동아리</strong>
                  (2023.03)
                  <br />: 프론트엔드 협업 프로젝트
                </li>
              </ul>
            </div>
          </section>
        </div>
        {/* <section className={styles.section}>
          <h2>Education</h2>
          <ul>
            <li>
              <strong>웹 풀스택 개발자 과정</strong> (2024.12 ~ 2025.05)
              <ul>
                <li>Spring Boot 기반 REST API 설계, DB 튜닝 실습</li>
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
              <strong>교내 데이터베이스 튜터</strong> (2024.09 ~ 2024.11) – DB
              기초/정규화/쿼리 작성 튜터링 진행
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
        </section> */}
      </main>
    </Layout>
  );
}
