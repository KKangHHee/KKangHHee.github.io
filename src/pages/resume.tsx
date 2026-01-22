import TechTag from "@site/src/components/resume/tag/TechTag";
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
              <p className={styles.summary}>
                Java · Spring Boot 기반의 신입 백엔드 개발자입니다. <br />
                프론트엔드 경험을 바탕으로 사용자 흐름을 이해하고, API 설계의
                정합성과 데이터 무결성을 고민하는 개발자입니다. <br />
                MySQL 데이터 모델링과 쿼리 튜닝을 통해 성능을 개선한 경험이
                있으며, 실습 중심의 프로젝트에서 백엔드 구조 설계부터 구현까지
                담당한 경험이 <br />
                팀에서는 주어진 일정과 책임을 끝까지 지키는 태도를 중요하게
                여기며, 원활한 커뮤니케이션을 통해 신뢰를 쌓아왔습니다.
              </p>
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

          <div className={styles.project}>
            <h3>Bargain Hunter (Backend)</h3>
            <p className={styles.period}>2025.07 ~ 2025.10</p>
            <ul>
              <li>이메일 발송 API 응답 시간 92% 개선 (2.5s → 0.2s)</li>
              <li>Redis HINCRBY로 동시성 이슈 해결</li>
              <li>OAuth2 PKCE 적용으로 인증 보안 강화</li>
            </ul>
          </div>

          <div className={styles.project}>
            <h3>Security Ticket (Backend)</h3>
            <p className={styles.period}>2025.04 ~ 2025.05</p>
            <ul>
              <li>복합 검색 평균 응답 시간 36% 개선</li>
              <li>EXISTS 서브쿼리로 최대 응답 시간 88.5% 감소</li>
              <li>Spring Security 커스텀 필터 인증 구조</li>
            </ul>
          </div>

          <div className={styles.project}>
            <h3>ReadyBerry (Frontend)</h3>
            <p className={styles.period}>2023.12 ~ 2024.05</p>
            <ul>
              <li>실사용 매장 2곳 배포</li>
              <li>결제 로딩 70% 단축</li>
              <li>프론트 → 백엔드 전향 계기</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Education</h2>
          <p>가톨릭대학교 컴퓨터정보공학부</p>
        </section>
      </main>
    </Layout>
  );
}
