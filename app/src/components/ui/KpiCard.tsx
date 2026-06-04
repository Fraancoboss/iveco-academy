import styles from "./KpiCard.module.css";

interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  unit?: string;
  subtitle?: string;
  delta?: { value: string; positive: boolean } | null;
}

export function KpiCard({ icon, label, value, unit, subtitle, delta }: KpiCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.iconCircle}>
        <span>{icon}</span>
      </div>
      <div className={styles.content}>
        <div className={styles.label}>{label}</div>
        <div className={styles.valueRow}>
          <span className={styles.value}>{value}</span>
          {unit && <span className={styles.unit}>{unit}</span>}
        </div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        {delta && (
          <div className={`${styles.delta} ${delta.positive ? styles.positive : styles.negative}`}>
            {delta.positive ? "↑" : "↓"} {delta.value}
          </div>
        )}
      </div>
    </div>
  );
}
