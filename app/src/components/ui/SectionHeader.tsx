import styles from "./SectionHeader.module.css";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
}

export function SectionHeader({ eyebrow, title, titleAccent, subtitle }: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      {eyebrow && <div className={styles.eyebrow}>— {eyebrow} —</div>}
      <h1 className={styles.title}>
        {title}
        {titleAccent && (
          <>
            <br />
            <span className={styles.accent}>{titleAccent}</span>
          </>
        )}
      </h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
