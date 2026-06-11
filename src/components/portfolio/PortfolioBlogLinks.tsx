import styles from "@site/src/pages/portfolio/portfolio.module.css";

type BlogLinkItem = {
  href: string;
  label: string;
  description?: string;
};

type PortfolioBlogLinksProps = {
  items: BlogLinkItem[];
};

export default function PortfolioBlogLinks({
  items,
}: PortfolioBlogLinksProps) {
  return (
    <ul className={styles.descList}>
      {items.map((item) => (
        <li key={item.href}>
          <a href={item.href} target="_blank" rel="noreferrer">
            {item.label}
          </a>
          {item.description ? (
            <span className={styles.blogDesc}>{item.description}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
