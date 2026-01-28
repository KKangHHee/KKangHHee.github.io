import Layout from "@theme/Layout";
import styles from "./portfolio.module.css";

export default function ReadyBerry() {
  return (
    <Layout title="ReadyBerry Portfolio">
      <main className={styles.container}>
        <section className={styles.header}>
          <h1 className={styles.title}>ReadyBerry</h1>
          <p className={styles.subtitle}>로컬 카페용 패스트오더 서비스</p>
        </section>

        <section className={styles.section}>
          <h2>1. 프로젝트 요약</h2>
          <ul className={styles.descList}>
            <li>
              <strong>팀 구성 & 기간:</strong> BE 2인, FE 4인 | 2023.12 ~
              2024.05
            </li>
            <li>
              <strong>담당 역할:</strong> 프론트엔드 개발 및 토스페이먼츠 결제
              모듈 연동
            </li>
            <li>
              <strong>핵심 성과:</strong> 결제 로딩 시간 70% 단축 및 API
              인터페이스 표준화
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>2. 핵심 문제 해결: 결제 SDK 최적화 및 백엔드 전향의 계기</h2>
          <div className={styles.troubleBox}>
            <h4>1) Problem</h4>
            <ul className={styles.descList}>
              <li>
                결제 모듈 호출 시 불필요한 리렌더링으로 로딩 지연(3s) 발생
              </li>
            </ul>
            <h4>2) Action</h4>
            <ul className={styles.descList}>
              <li>
                <code>useRef</code>를 활용한 SDK 인스턴스 관리로 라이프사이클
                최적화
              </li>
              <li>
                결제 결과 검증 로직에서 데이터 정합성 보호를 위한 API 설계 제안
              </li>
            </ul>
            <h4>3) Result</h4>
            <ul className={styles.descList}>
              <li>
                결제 진입 속도 <strong>70% 단축 (3s → 1s)</strong>
              </li>
              <li>
                <strong>인사이트:</strong> 클라이언트 측 데이터의 불완전성을
                체감하고 서버 설계에 집중하게 된 계기
              </li>
            </ul>
          </div>
        </section>
      </main>
    </Layout>
  );
}
