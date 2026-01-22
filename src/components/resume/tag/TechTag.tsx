import styles from "./TechTag.module.css";

const TechTag = ({ src, label }) => (
  <div className={styles.tag}>
    <img src={src} alt={label} className={styles.icon} />
    <span className={styles.label}>{label}</span>
  </div>
);

export default TechTag;
