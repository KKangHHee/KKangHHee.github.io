import type { PropsWithChildren, ReactNode } from "react";
import styles from "@site/src/pages/portfolio/portfolio.module.css";

type PortfolioSectionProps = PropsWithChildren<{
  title: ReactNode;
}>;

export default function PortfolioSection({
  title,
  children,
}: PortfolioSectionProps) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
