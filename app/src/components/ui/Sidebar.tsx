import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import styles from "./Sidebar.module.css";

export interface SidebarItem {
  icon: ReactNode;
  label: string;
  to?: string;
  badge?: number | string;
  active?: boolean;
}

interface SidebarSection {
  label?: string;
  items: SidebarItem[];
}

interface SidebarProps {
  sections: SidebarSection[];
  footer?: ReactNode;
}

export function Sidebar({ sections, footer }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src="/iveco-academy-logo.png" alt="IVECO Academy" className={styles.logoImg} />
      </div>

      <nav className={styles.nav}>
        {sections.map((section, si) => (
          <div key={si} className={styles.section}>
            {section.label && (
              <div className={styles.sectionLabel}>{section.label}</div>
            )}
            {section.items.map((item, ii) => {
              if (item.to) {
                return (
                  <NavLink
                    key={ii}
                    to={item.to}
                    className={({ isActive }) =>
                      `${styles.item} ${isActive ? styles.active : ""}`
                    }
                    end
                  >
                    <span className={styles.icon}>{item.icon}</span>
                    <span className={styles.label}>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={styles.badge}>{item.badge}</span>
                    )}
                  </NavLink>
                );
              }
              return (
                <div
                  key={ii}
                  className={`${styles.item} ${item.active ? styles.active : ""}`}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  <span className={styles.label}>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={styles.badge}>{item.badge}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {footer && <div className={styles.footer}>{footer}</div>}
    </aside>
  );
}
