import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import clsx from "clsx";
import type { ReactNode } from "react";

import styles from "./index.module.css";

/**
 * Hero 섹션: 방문자에게 첫인상을 주는 헤더
 * - 간결한 자기소개
 * - 주요 CTA 버튼 (이력서, 프로젝트)
 */
function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero", styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <Heading as="h1" className={styles.heroTitle}>
              안녕하세요,
              <br />
              <span className={styles.heroTitle}>백엔드 엔지니어</span>{" "}
              신강희입니다.
            </Heading>
            <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
            <p className={styles.heroDescription}>
              Spring Boot와 Java를 활용하여 성능과 확장성을 고려한 서버
              아키텍처를 설계합니다.
              <br />
              MySQL, PostgreSQL, Redis를 활용한 데이터 최적화 경험을 보유하고
              있습니다.
            </p>
          </div>

          {/* CTA 버튼들 */}
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/docs/resume"
            >
              📄 이력서 보기
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="/docs/projects"
            >
              📁 프로젝트 살펴보기
            </Link>
            <Link className="button button--secondary button--lg" to="/blog">
              ✍️ 블로그 읽기
            </Link>
          </div>

          {/* 소셜 링크 */}
          <div className={styles.socialLinks}>
            <a
              href="https://github.com/KKangHHee"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <img src="/img/github-mark.svg" alt="GitHub" />
            </a>
            <a
              href="https://www.linkedin.com/in/kanghee-shin-98ab90345/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <img src="/img/linkedin.svg" alt="LinkedIn" />
            </a>
            <a href="mailto:skh8609@naver.com" className={styles.socialLink}>
              <img src="/img/email.svg" alt="Email" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * 메인 페이지 컴포넌트
 */
export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description="Spring Boot 백엔드 개발자 신강희의 포트폴리오입니다. 프로젝트 경험과 기술 스택을 확인하세요."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
