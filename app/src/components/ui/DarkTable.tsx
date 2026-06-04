import type { ReactNode } from "react";
import styles from "./DarkTable.module.css";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => ReactNode;
  width?: string;
}

interface DarkTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyFn: (row: T, index: number) => string;
}

export function DarkTable<T>({ columns, data, keyFn }: DarkTableProps<T>) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={keyFn(row, i)}>
              {columns.map((col) => (
                <td key={col.key}>{col.render(row, i)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Subcomponents for common cell types
export function ProgressCell({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={styles.progressCell}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.progressValue}>{value.toFixed(1)}</span>
    </div>
  );
}

export function AvatarCell({ name, subtitle }: { name: string; subtitle?: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={styles.avatarCell}>
      <div className={styles.avatarCircle}>{initials}</div>
      <div>
        <div className={styles.avatarName}>{name}</div>
        {subtitle && <div className={styles.avatarSub}>{subtitle}</div>}
      </div>
    </div>
  );
}

export function BadgeCell({ text, variant = "default" }: { text: string; variant?: "default" | "danger" | "warning" | "success" }) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{text}</span>;
}

export function ActionButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button className={styles.actionBtn} onClick={onClick}>
      {label}
    </button>
  );
}

export function KebabButton() {
  return <button className={styles.kebab}>&#8942;</button>;
}
