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
          <ul>
            <li>
              <strong>웹 풀스택 개발자 과정 (Java / Spring Boot)</strong>
              <br />
              2024.12 ~ 2025.05 (총 920시간)
              <ul>
                <li>REST API 설계 및 Spring Boot 기반 백엔드 실습 중심 교육</li>
                <li>
                  코드 리뷰 & 피드백 기반 학습으로 클린 코드·리팩토링 습관 형성
                </li>
                <li>DB 튜닝, Redis, 캐시 전략을 활용한 성능 최적화 경험</li>
              </ul>
            </li>
            <li>
              <strong>가톨릭대학교 컴퓨터정보공학부</strong>
              <br />
              2019.03 ~ 2025.08 (졸업)
              <ul>
                <li>
                  주요 이수 과목: 데이터베이스 설계, 데이터 통신, 운영체제
                </li>
              </ul>
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Certifications</h2>
          <ul>
            <li>
              <strong>정보처리기사</strong> (2024.12 | 한국산업인력공단)
            </li>
            <li>
              <strong>SQLD</strong> (2024.12 | 한국데이터산업진흥원)
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Activities</h2>
          <ul>
            <li>
              <strong>교내 데이터베이스 튜터</strong> (2024.09 ~ 2024.11)
              <ul>
                <li>학우 대상 데이터 모델링 및 MySQL 쿼리 설계 지도</li>
                <li>JOIN / 서브쿼리 / 인덱스 개념 코칭 → 학습 성취도 향상</li>
              </ul>
            </li>
            <li>
              <strong>하나소셜벤처유니버시티 – 청년 창업 교육 수료</strong>{" "}
              (2024.07)
              <ul>
                <li>사용자 중심 서비스 기획 및 비즈니스 모델 설계 실습</li>
                <li>
                  팀 단위 피칭을 통해 문제 정의 → 해결안 제시 → 설득 구조 경험
                </li>
              </ul>
            </li>
            <li>
              <strong>UMC 대학생 IT 연합 동아리</strong> (2023.03 ~ 2023.08)
              <ul>
                <li>프론트엔드 스터디 및 팀 프로젝트 참여</li>
                <li>Git 기반 협업 및 역할 분담을 통한 개발 프로세스 경험</li>
              </ul>
            </li>
          </ul>
        </section>
      </main>
    </Layout>
  );
}
