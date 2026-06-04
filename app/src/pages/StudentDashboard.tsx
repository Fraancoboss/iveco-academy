import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Trophy,
  CheckCircle,
  Wrench,
  Target,
  Flame,
  Award,
} from "lucide-react";
import { DashboardLayout } from "../components/ui/DashboardLayout.js";
import { KpiCard } from "../components/ui/KpiCard.js";
import { ChartCard } from "../components/ui/ChartCard.js";
import { DateEventItem } from "../components/ui/DateEventItem.js";
import { getStudentSidebarSections } from "./studentSidebar.js";
import styles from "./StudentDashboard.module.css";

interface WeeklyData {
  weekNumber: number;
  weekType: string;
  evalType: string | null;
  weekAvg: number | null;
  courseWeekAvg: number | null;
  punctuality: number | null;
  attention: number | null;
  participation: number | null;
  documentation: number | null;
  dexterity: number | null;
  problemSolving: number | null;
  workshopGrade: number | null;
}

interface ModuleAvg {
  moduleName: string;
  studentAvg: number | null;
}

interface CourseModuleAvg {
  moduleName: string;
  courseAvg: number | null;
}

interface UpcomingClass {
  weekId: string;
  weekNumber: number;
  weekType: string;
  moduleName: string | null;
  startDate: string;
  endDate: string;
}

interface AvailableEdition {
  editionId: string;
  editionName: string;
}

interface DashboardData {
  studentId: string;
  studentName: string;
  editionId: string;
  editionName: string;
  courseName: string;
  overallAvg: number | null;
  ranking: number | null;
  totalStudents: number;
  attendancePct: number | null;
  weeklyData: WeeklyData[];
  behaviorAvgs: {
    punctuality: number | null;
    attention: number | null;
    participation: number | null;
    documentation: number | null;
    dexterity: number | null;
    problemSolving: number | null;
  };
  moduleAvgs: ModuleAvg[];
  courseModuleAvgs: CourseModuleAvg[];
  upcomingClasses: UpcomingClass[];
  availableEditions: AvailableEdition[];
}

const MONTH_NAMES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

function weekBarGradient(score: number): string {
  if (score >= 8) return "linear-gradient(90deg, #14B8A6, #22D3EE)";
  if (score >= 6) return "linear-gradient(90deg, #2563EB, #3B82F6)";
  if (score >= 5) return "linear-gradient(90deg, #F59E0B, #FBBF24)";
  return "linear-gradient(90deg, #EF4444, #F87171)";
}

function lastWorkshopGrade(weeklyData: WeeklyData[]): number | null {
  for (let i = weeklyData.length - 1; i >= 0; i--) {
    if (weeklyData[i].workshopGrade != null) return weeklyData[i].workshopGrade;
  }
  return null;
}

export function StudentDashboard() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/students/${id}/dashboard`)
      .then((r) => {
        if (!r.ok) throw new Error("Alumno no encontrado");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!data) return <div className={styles.loading}>Cargando dashboard...</div>;

  const radarData = data.moduleAvgs.map((m) => {
    const courseModule = data.courseModuleAvgs.find((cm) => cm.moduleName === m.moduleName);
    return {
      module: m.moduleName.length > 18 ? m.moduleName.substring(0, 16) + "…" : m.moduleName,
      alumno: m.studentAvg != null ? Number(m.studentAvg.toFixed(1)) : 0,
      curso: courseModule?.courseAvg != null ? Number(courseModule.courseAvg.toFixed(1)) : 0,
      fullMark: 10,
    };
  });

  const weeklyChartData = data.weeklyData.map((w) => ({
    name: `S${w.weekNumber}`,
    alumno: w.weekAvg != null ? Number(w.weekAvg.toFixed(2)) : null,
    curso: w.courseWeekAvg != null ? Number(w.courseWeekAvg.toFixed(2)) : null,
  }));

  const workshopGrade = lastWorkshopGrade(data.weeklyData);

  const sidebarSections = getStudentSidebarSections(id!);

  return (
    <DashboardLayout
      sidebarSections={sidebarSections}
      viewLabel="Panel del Alumno"
      userName={data.studentName}
      userRole="Alumno"
      sidebarFooter={
        data.availableEditions.length > 1 ? (
          <select
            style={{
              width: "100%",
              background: "var(--bg-surface-alt)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              padding: "0.5rem",
              fontSize: "var(--text-xs)",
            }}
            value={data.editionId}
            onChange={(e) => {
              window.location.href = `/student/${id}?editionId=${e.target.value}`;
            }}
          >
            {data.availableEditions.map((ed) => (
              <option key={ed.editionId} value={ed.editionId}>
                {ed.editionName}
              </option>
            ))}
          </select>
        ) : undefined
      }
    >
      <div className={styles.header}>
        <span className={styles.studentName}>{data.studentName}</span>
        <span className={styles.editionBadge}>{data.editionName}</span>
      </div>

      <div className={styles.kpiRow}>
        <KpiCard
          icon={<TrendingUp size={18} />}
          label="Promedio General"
          value={data.overallAvg != null ? data.overallAvg.toFixed(1) : "—"}
          unit="/10"
          subtitle="Objetivo: 7.0"
          delta={
            data.weeklyData.length >= 2
              ? (() => {
                  const last = data.weeklyData[data.weeklyData.length - 1]?.weekAvg;
                  const prev = data.weeklyData[data.weeklyData.length - 2]?.weekAvg;
                  if (last != null && prev != null) {
                    const diff = last - prev;
                    return { value: `${Math.abs(diff).toFixed(1)} vs sem. anterior`, positive: diff >= 0 };
                  }
                  return null;
                })()
              : null
          }
        />
        <KpiCard
          icon={<Trophy size={18} />}
          label="Ranking"
          value={data.ranking != null ? `#${data.ranking}` : "—"}
          unit={`de ${data.totalStudents}`}
          subtitle={data.editionName}
        />
        <KpiCard
          icon={<CheckCircle size={18} />}
          label="Asistencia"
          value={data.attendancePct != null ? `${data.attendancePct.toFixed(0)}` : "—"}
          unit="%"
          subtitle="Mínimo requerido: 80%"
        />
        <KpiCard
          icon={<Wrench size={18} />}
          label="Nota Taller"
          value={workshopGrade != null ? workshopGrade.toFixed(1) : "—"}
          unit="/10"
          subtitle="Última evaluación taller"
        />
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.chartsColumn}>
          <div className={styles.chartsRow}>
            <ChartCard title="Evolución Semanal">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={weeklyChartData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#101D31", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 8, color: "#F8FAFC", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
                  <Line type="monotone" dataKey="alumno" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: "#3B82F6" }} name="Alumno" connectNulls />
                  <Line type="monotone" dataKey="curso" stroke="#64748B" strokeWidth={1.5} strokeDasharray="5 5" dot={{ r: 3, fill: "#64748B" }} name="Media Curso" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Rendimiento por Módulo">
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="rgba(148,163,184,0.15)" />
                    <PolarAngleAxis dataKey="module" tick={{ fill: "#94A3B8", fontSize: 9 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "#64748B", fontSize: 9 }} axisLine={false} />
                    <Radar name="Alumno" dataKey="alumno" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.25} strokeWidth={2} />
                    <Radar name="Curso" dataKey="curso" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.emptyState}>Sin datos de módulos</div>
              )}
            </ChartCard>
          </div>

          <ChartCard title="Detalle Semanal">
            <div className={styles.weeklyBars}>
              {data.weeklyData.map((w) => {
                const avg = w.weekAvg ?? 0;
                return (
                  <div key={w.weekNumber} className={styles.weekRow}>
                    <span className={styles.weekLabel}>
                      Sem {w.weekNumber}
                      <br />
                      <span style={{ fontSize: "0.55rem", color: "var(--text-muted)" }}>
                        {w.weekType === "WORKSHOP" ? "Taller" : "Form."}
                      </span>
                    </span>
                    <div className={styles.weekBarTrack}>
                      <div className={styles.weekBarFill} style={{ width: `${(avg / 10) * 100}%`, background: weekBarGradient(avg) }} />
                    </div>
                    <span className={styles.weekBarValue}>{avg.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          <ChartCard title="Media por Módulo">
            <div className={styles.moduleBars}>
              {data.moduleAvgs.map((m) => {
                const courseModule = data.courseModuleAvgs.find((cm) => cm.moduleName === m.moduleName);
                const studentScore = m.studentAvg ?? 0;
                const courseScore = courseModule?.courseAvg ?? 0;
                return (
                  <div key={m.moduleName} className={styles.moduleRow}>
                    <div className={styles.moduleInfo}>
                      <span className={styles.moduleName}>{m.moduleName}</span>
                      <span className={styles.moduleScore}>
                        {studentScore.toFixed(1)}{" "}
                        <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>/ {courseScore.toFixed(1)} media</span>
                      </span>
                    </div>
                    <div className={styles.moduleBarTrack}>
                      <div className={styles.moduleBarFill} style={{ width: `${(studentScore / 10) * 100}%` }} />
                      <div className={styles.moduleBarCourseFill} style={{ left: `${(courseScore / 10) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.rightCard}>
            <div className={styles.rightCardTitle}>Próximo Reto</div>
            <div className={styles.nextChallenge}>
              <div className={styles.nextChallengeIcon}><Target size={32} strokeWidth={1.5} /></div>
              <div className={styles.nextChallengeTitle}>Subir al Top 5</div>
              <div className={styles.nextChallengeSub}>
                Estás en el puesto #{data.ranking ?? "?"} — ¡a por el #{Math.max(1, (data.ranking ?? 6) - 1)}!
              </div>
            </div>
          </div>

          <div className={styles.rightCard}>
            <div className={styles.rightCardTitle}>Últimos Comentarios</div>
            <div className={styles.feedbackItem}>
              <div className={styles.feedbackAvatar}>AL</div>
              <div className={styles.feedbackText}>
                <div className={styles.feedbackName}>Ana López García</div>
                <div className={styles.feedbackComment}>Buen progreso en diagnóstico electrónico. Seguir practicando con el equipo de medición.</div>
                <div className={styles.feedbackDate}>Hace 3 días</div>
              </div>
            </div>
            <div className={styles.feedbackItem}>
              <div className={styles.feedbackAvatar}>RF</div>
              <div className={styles.feedbackText}>
                <div className={styles.feedbackName}>Roberto Fernández</div>
                <div className={styles.feedbackComment}>Excelente trabajo en taller. Demuestra buena destreza manual.</div>
                <div className={styles.feedbackDate}>Hace 1 semana</div>
              </div>
            </div>
          </div>

          <div className={styles.rightCard}>
            <div className={styles.rightCardTitle}>Próximas Clases</div>
            {data.upcomingClasses.length > 0 ? (
              <div className={styles.upcomingList}>
                {data.upcomingClasses.map((cls) => {
                  const d = new Date(cls.startDate);
                  return (
                    <DateEventItem
                      key={cls.weekId}
                      month={MONTH_NAMES[d.getMonth()]}
                      day={d.getDate()}
                      title={cls.moduleName ?? (cls.weekType === "WORKSHOP" ? "Taller Práctico" : "Formación")}
                      group={`Semana ${cls.weekNumber}`}
                      badge={cls.weekType === "WORKSHOP" ? "Taller" : "Teórico"}
                    />
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>No hay clases programadas</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.achievementsRow}>
        <div className={styles.achievement}>
          <div className={styles.achievementIcon}><Flame size={20} /></div>
          <div className={styles.achievementInfo}>
            <div className={styles.achievementTitle}>Racha de asistencia</div>
            <div className={styles.achievementSub}>
              {data.attendancePct != null && data.attendancePct >= 95
                ? "¡Asistencia perfecta!"
                : `${data.attendancePct?.toFixed(0) ?? 0}% — ¡Sigue así!`}
            </div>
          </div>
        </div>
        <div className={styles.achievement}>
          <div className={styles.achievementIcon}><TrendingUp size={20} /></div>
          <div className={styles.achievementInfo}>
            <div className={styles.achievementTitle}>Mejora continua</div>
            <div className={styles.achievementSub}>
              {data.weeklyData.length >= 2 &&
              (data.weeklyData[data.weeklyData.length - 1]?.weekAvg ?? 0) > (data.weeklyData[0]?.weekAvg ?? 0)
                ? `+${((data.weeklyData[data.weeklyData.length - 1]?.weekAvg ?? 0) - (data.weeklyData[0]?.weekAvg ?? 0)).toFixed(1)} pts desde semana 1`
                : "Sigue esforzándote"}
            </div>
          </div>
        </div>
        <div className={styles.achievement}>
          <div className={styles.achievementIcon}><Award size={20} /></div>
          <div className={styles.achievementInfo}>
            <div className={styles.achievementTitle}>Mejor módulo</div>
            <div className={styles.achievementSub}>
              {data.moduleAvgs.length > 0
                ? (() => {
                    const best = data.moduleAvgs.reduce((a, b) => ((a.studentAvg ?? 0) > (b.studentAvg ?? 0) ? a : b));
                    return `${best.moduleName}: ${(best.studentAvg ?? 0).toFixed(1)}`;
                  })()
                : "Sin datos aún"}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
