import Layout from "@theme/Layout";
import styles from "./portfolio.module.css";

export default function SecurityTicket() {
  return (
    <Layout title="Security Ticket Portfolio">
      <main className={styles.container}>
        <section className={styles.header}>
          <h1 className={styles.title}>Security Ticket</h1>
          <p className={styles.subtitle}>
            수동 점검 프로세스를 디지털화한 웹 기반 관리 시스템
          </p>
        </section>

        <section className={styles.section}>
          <h2>1. 프로젝트 요약</h2>
          <ul className={styles.descList}>
            <li>
              <strong>팀 구성 & 기간:</strong> BE 8인, FE 3인 | 2025.04 ~
              2025.05
            </li>
            <li>
              <strong>담당 역할:</strong> 백엔드 API 설계 및 사용자 관리/권한
              도메인 개발
            </li>
            <li>
              <strong>핵심 성과:</strong> 복합 쿼리 최적화를 통한 DB 응답 시간
              평균 36% 단축
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>2. 데이터베이스 전략 및 ERD</h2>
          <ul className={styles.descList}>
            <li>
              <strong>Tech Stack:</strong> Java 17, Spring Boot, MySQL, MyBatis,
              JPA, Redis
            </li>
            <li>
              <strong>Strategy:</strong> 생산성을 위한 JPA와 고성능 복잡 쿼리를
              위한 MyBatis 하이브리드 운영
            </li>
          </ul>
          <div className={styles.imageBox}>
            <img src="/img/portfolio/security-erd.png" alt="ERD 설계도" />
          </div>
        </section>

        <section className={styles.section}>
          <h2>3. 핵심 문제 해결: 영속성 프레임워크 하이브리드 운영</h2>
          <div className={styles.troubleBox}>
            <h4>1) Problem</h4>
            <ul className={styles.descList}>
              <li>
                복합 조건 검색 시 JPA Specification의 가독성 저하 및 서브쿼리
                성능 한계 발생
              </li>
            </ul>
            <h4>2) Action</h4>
            <ul className={styles.descList}>
              <li>
                통계 및 복합 조회 로직에 MyBatis 도입 및 EXISTS 서브쿼리 최적화
              </li>
              <li>
                Spring Security 커스텀 제어로 복잡한 로그인 비즈니스 로직 처리
              </li>
            </ul>
            <h4>3) Result</h4>
            <ul className={styles.descList}>
              <li>
                DB 평균 응답 시간 <strong>36% 개선</strong>, 최대 응답 시간{" "}
                <strong>88.5% 단축</strong>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </Layout>
  );
}
