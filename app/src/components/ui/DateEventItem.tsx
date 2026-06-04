import styles from "./DateEventItem.module.css";

interface DateEventItemProps {
  month: string;
  day: string | number;
  title: string;
  group?: string;
  time?: string;
  badge?: string;
}

export function DateEventItem({ month, day, title, group, time, badge }: DateEventItemProps) {
  return (
    <div className={styles.item}>
      <div className={styles.dateBlock}>
        <span className={styles.month}>{month}</span>
        <span className={styles.day}>{day}</span>
      </div>
      <div className={styles.info}>
        <span className={styles.title}>{title}</span>
        <span className={styles.meta}>
          {group && <span>{group}</span>}
          {time && <span>· {time}</span>}
        </span>
      </div>
      {badge && <span className={styles.badge}>{badge}</span>}
    </div>
  );
}
