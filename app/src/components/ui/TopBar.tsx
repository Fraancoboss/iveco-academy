import styles from "./TopBar.module.css";

interface TopBarProps {
  viewLabel: string;
  userName: string;
  userRole: string;
}

export function TopBar({ viewLabel, userName, userRole }: TopBarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.viewLabel}>{viewLabel}</div>
      <div className={styles.actions}>
        <button className={styles.iconBtn} title="Notificaciones">
          <span>&#128276;</span>
          <span className={styles.notifBadge}>3</span>
        </button>
        <button className={styles.iconBtn} title="Mensajes">
          <span>&#9993;</span>
        </button>
        <div className={styles.user}>
          <div className={styles.avatar}>
            {userName.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>{userRole}</span>
          </div>
          <span className={styles.chevron}>&#9662;</span>
        </div>
      </div>
    </header>
  );
}
