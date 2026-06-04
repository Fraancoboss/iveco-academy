import type { CSSProperties, ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps {
  title?: string;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function Card({ title, children, style, className }: CardProps) {
  return (
    <div className={`${styles.card} ${className ?? ""}`} style={style}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {children}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string | number;
  color?: string;
}

export function KpiCard({ label, value, color }: KpiCardProps) {
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiValue} style={{ color }}>
        {value}
      </div>
      <div className={styles.kpiLabel}>{label}</div>
    </div>
  );
}
