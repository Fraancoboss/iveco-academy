import type { ReactNode } from "react";
import styles from "./ChartCard.module.css";

interface ChartCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, action, children, className }: ChartCardProps) {
  return (
    <div className={`${styles.card} ${className ?? ""}`}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {action && <div className={styles.action}>{action}</div>}
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
