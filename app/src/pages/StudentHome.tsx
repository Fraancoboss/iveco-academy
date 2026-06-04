import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BookOpen,
  TrendingUp,
  Hand,
  Clock,
} from "lucide-react";
import { DashboardLayout } from "../components/ui/DashboardLayout.js";
import { KpiCard } from "../components/ui/KpiCard.js";
import { ChartCard } from "../components/ui/ChartCard.js";
import { getStudentSidebarSections } from "./studentSidebar.js";
import styles from "./StudentHome.module.css";

interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  totalWeeks: number;
  evaluatedWeeks: number;
  progressPct: number;
}

interface RecentActivity {
  evaluatedAt: string;
  comments: string;
  weekNumber: number;
  weekType: string;
  moduleName: string | null;
  evaluatorName: string;
}

interface HomeData {
  studentId: string;
  studentName: string;
  editionId: string;
  editionName: string;
  courseName: string;
  moduleCount: number;
  overallProgress: number;
  modules: ModuleProgress[];
  nextEvaluation: {
    weekNumber: number;
    startDate: string;
    weekType: string;
    moduleName: string | null;
  } | null;
  recentActivity: RecentActivity[];
}

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function progressQualifier(pct: number): string {
  if (pct >= 75) return "Avanzado";
  if (pct >= 50) return "En curso";
  return "Inicial";
}

function progressColor(pct: number): string {
  if (pct >= 75) return "var(--accent-teal, #14B8A6)";
  if (pct >= 50) return "var(--accent-primary, #3B82F6)";
  return "var(--color-warning, #F59E0B)";
}

export function StudentHome() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/students/${id}/home`)
      .then((r) => {
        if (!r.ok) throw new Error("Alumno no encontrado");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!data) return <div className={styles.loading}>Cargando...</div>;

  const firstName = data.studentName.split(" ")[0];

  const sidebarSections = getStudentSidebarSections(id!);

  const nextEvalLabel = data.nextEvaluation
    ? (() => {
        const d = new Date(data.nextEvaluation.startDate);
        return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
      })()
    : "Completado";

  return (
    <DashboardLayout
      sidebarSections={sidebarSections}
      viewLabel="Inicio"
      userName={data.studentName}
      userRole="Alumno"
    >
      {/* Greeting */}
      <div className={styles.greeting}>
        <Hand size={28} className={styles.handIcon} />
        <h1 className={styles.greetingText}>
          Hola, <span className={styles.greetingName}>{firstName}</span>
        </h1>
      </div>

      {/* KPI row */}
      <div className={styles.kpiRow}>
        <KpiCard
          icon={<BookOpen size={18} />}
          label="Mis cursos"
          value={String(data.moduleCount)}
          subtitle={data.courseName}
        />
        <KpiCard
          icon={<TrendingUp size={18} />}
          label="Progreso general"
          value={`${Math.round(data.overallProgress)}%`}
          subtitle={progressQualifier(data.overallProgress)}
        />
        <KpiCard
          icon={<Clock size={18} />}
          label="Próxima evaluación"
          value={nextEvalLabel}
          subtitle={data.nextEvaluation?.moduleName ?? ""}
        />
      </div>

      {/* Bottom cards */}
      <div className={styles.bottomRow}>
        {/* Module progress */}
        <ChartCard title="Mis cursos en progreso">
          <div className={styles.moduleList}>
            {data.modules.map((m) => (
              <div key={m.moduleId} className={styles.moduleItem}>
                <div className={styles.moduleHeader}>
                  <span className={styles.moduleName}>{m.moduleName}</span>
                  <span className={styles.modulePct}>{Math.round(m.progressPct)}%</span>
                </div>
                <div className={styles.moduleBarTrack}>
                  <div
                    className={styles.moduleBarFill}
                    style={{
                      width: `${m.progressPct}%`,
                      background: progressColor(m.progressPct),
                    }}
                  />
                </div>
                <div className={styles.moduleDetail}>
                  {m.evaluatedWeeks} de {m.totalWeeks} semanas evaluadas
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Recent activity */}
        <ChartCard title="Actividad reciente">
          <div className={styles.activityList}>
            {data.recentActivity.map((a, i) => {
              const d = new Date(a.evaluatedAt);
              const daysAgo = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
              const timeLabel = daysAgo <= 1 ? "Hoy" : daysAgo < 7 ? `Hace ${daysAgo} días` : `Hace ${Math.floor(daysAgo / 7)} sem`;
              return (
                <div key={i} className={styles.activityItem}>
                  <div className={styles.activityDot} />
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitle}>
                      {a.weekType === "WORKSHOP" ? "Evaluación de taller" : `Evaluación — ${a.moduleName ?? "Formación"}`}
                    </div>
                    <div className={styles.activityComment}>{a.comments}</div>
                    <div className={styles.activityMeta}>
                      {a.evaluatorName} · Semana {a.weekNumber} · {timeLabel}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Static activity item */}
            <div className={styles.activityItem}>
              <div className={`${styles.activityDot} ${styles.activityDotStatic}`} />
              <div className={styles.activityContent}>
                <div className={styles.activityTitle}>Inscripción confirmada</div>
                <div className={styles.activityComment}>
                  Te has inscrito en {data.editionName} — {data.courseName}
                </div>
                <div className={styles.activityMeta}>Sistema · Al inicio del programa</div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
