import type { PropsWithChildren, ReactNode } from "react";
import styles from "@site/src/pages/portfolio/portfolio.module.css";

type PortfolioTroubleCardProps = PropsWithChildren<{
  title: ReactNode;
}>;

export default function PortfolioTroubleCard({
  title,
  children,
}: PortfolioTroubleCardProps) {
  return (
    <div className={styles.troubleBox}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
