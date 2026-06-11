import type { PropsWithChildren } from "react";
import Layout from "@theme/Layout";
import styles from "@site/src/pages/portfolio/portfolio.module.css";

type PortfolioPageLayoutProps = PropsWithChildren<{
  pageTitle?: string;
  title: string;
  subtitle: string;
}>;

export default function PortfolioPageLayout({
  pageTitle = "Project Portfolio",
  title,
  subtitle,
  children,
}: PortfolioPageLayoutProps) {
  return (
    <Layout title={pageTitle}>
      <main className={styles.container}>
        <section className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </section>
        {children}
      </main>
    </Layout>
  );
}
