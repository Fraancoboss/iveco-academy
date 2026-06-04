import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar.js";
import { TopBar } from "./TopBar.js";
import type { SidebarItem } from "./Sidebar.js";
import styles from "./DashboardLayout.module.css";

interface SidebarSection {
  label?: string;
  items: SidebarItem[];
}

interface DashboardLayoutProps {
  sidebarSections: SidebarSection[];
  sidebarFooter?: ReactNode;
  viewLabel: string;
  userName: string;
  userRole: string;
  children: ReactNode;
}

export function DashboardLayout({
  sidebarSections,
  sidebarFooter,
  viewLabel,
  userName,
  userRole,
  children,
}: DashboardLayoutProps) {
  return (
    <div className={styles.layout}>
      <Sidebar sections={sidebarSections} footer={sidebarFooter} />
      <div className={styles.main}>
        <TopBar viewLabel={viewLabel} userName={userName} userRole={userRole} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
