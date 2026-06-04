import styles from "./AvatarListItem.module.css";

interface AvatarListItemProps {
  name: string;
  subtitle?: string;
  value?: string;
  valueBadge?: { text: string; variant: "positive" | "negative" | "warning" };
  onClick?: () => void;
}

const COLORS = ["#2563EB", "#14B8A6", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899"];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function AvatarListItem({ name, subtitle, value, valueBadge, onClick }: AvatarListItemProps) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={styles.item} onClick={onClick} role={onClick ? "button" : undefined}>
      <div className={styles.avatar} style={{ background: getColor(name) }}>
        {initials}
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
      {value && <span className={styles.value}>{value}</span>}
      {valueBadge && (
        <span className={`${styles.valueBadge} ${styles[valueBadge.variant]}`}>
          {valueBadge.text}
        </span>
      )}
    </div>
  );
}
