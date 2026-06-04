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
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  ClipboardCheck,
  Users,
  Calendar,
  FileText,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { DashboardLayout } from "../components/ui/DashboardLayout.js";
import { KpiCard } from "../components/ui/KpiCard.js";
import { ChartCard } from "../components/ui/ChartCard.js";
import { DarkTable, AvatarCell, ProgressCell, BadgeCell } from "../components/ui/DarkTable.js";
import styles from "./TrainerDashboard.module.css";

interface EditionKpi {
  editionId: string;
  editionName: string;
  courseName: string;
  capacity: number;
  enrolledCount: number;
  avgScore: number | null;
  avgAttendancePct: number | null;
  totalWeeks: number;
  weeksWithEvaluations: number;
}

interface TopStudent {
  userId: string;
  studentName: string;
  overallAvg: number | null;
  editionId: string;
  ranking: number | null;
}

interface PendingEvaluation {
  weekId: string;
  editionId: string;
  editionName: string;
  weekNumber: number;
  weekType: string;
  daysOverdue: number;
  studentName: string;
  userId: string;
}

interface WeeklyAvg {
  editionId: string;
  weekNumber: number;
  weekAvg: number | null;
}

interface StudentRanking {
  userId: string;
  studentName: string;
  overallAvg: number | null;
  editionId: string;
  ranking: number | null;
}

interface TrainerData {
  trainer: { id: string; name: string; role: string };
  editions: EditionKpi[];
  totalStudents: number;
  evaluationCount: number;
  pendingEvaluations: PendingEvaluation[];
  topStudents: TopStudent[];
  weeklyAvgs: WeeklyAvg[];
  allStudents: StudentRanking[];
}

const EDITION_COLORS = ["#3B82F6", "#14B8A6", "#F59E0B", "#EF4444"];

export function TrainerDashboard() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<TrainerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedEdition, setSelectedEdition] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/trainer/${id}/dashboard`)
      .then((r) => {
        if (!r.ok) throw new Error("Formador no encontrado");
        return r.json();
      })
      .then((d: TrainerData) => {
        setData(d);
        if (d.editions.length > 0) setSelectedEdition(d.editions[0].editionId);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!data) return <div className={styles.loading}>Cargando dashboard...</div>;

  const currentEdition = data.editions.find((e) => e.editionId === selectedEdition) ?? data.editions[0];
  const editionStudents = data.allStudents.filter((s) => s.editionId === selectedEdition);

  // Weekly evolution chart data: one line per edition
  const editionIds = data.editions.map((e) => e.editionId);
  const maxWeek = Math.max(...data.weeklyAvgs.map((w) => w.weekNumber), 0);
  const evolutionData = Array.from({ length: maxWeek }, (_, i) => {
    const week = i + 1;
    const point: Record<string, unknown> = { name: `S${week}` };
    for (const eid of editionIds) {
      const avg = data.weeklyAvgs.find((w) => w.editionId === eid && w.weekNumber === week);
      const ed = data.editions.find((e) => e.editionId === eid);
      point[ed?.editionName ?? eid] = avg?.weekAvg != null ? Number(avg.weekAvg.toFixed(2)) : null;
    }
    return point;
  });

  const sidebarSections = [
    {
      label: "Panel Formador",
      items: [
        { icon: <BarChart3 size={16} />, label: "Dashboard", to: `/trainer/${id}`, active: true },
        { icon: <ClipboardCheck size={16} />, label: "Evaluaciones", to: "#", badge: data.pendingEvaluations.length || undefined },
        { icon: <Users size={16} />, label: "Alumnos", to: "#" },
        { icon: <Calendar size={16} />, label: "Calendario", to: "#" },
      ],
    },
    {
      label: "Ediciones",
      items: data.editions.map((e) => ({
        icon: <FileText size={16} />,
        label: e.editionName,
        to: "#",
        badge: `${e.enrolledCount}/${e.capacity}`,
      })),
    },
  ];

  return (
    <DashboardLayout
      sidebarSections={sidebarSections}
      viewLabel="Panel del Formador"
      userName={data.trainer.name}
      userRole={data.trainer.role === "TRAINER" ? "Formador" : "Jefe de Taller"}
    >
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.trainerName}>{data.trainer.name}</span>
        <span className={styles.roleBadge}>
          {data.trainer.role === "TRAINER" ? "Formador" : "Jefe de Taller"}
        </span>
      </div>

      {/* KPI Row */}
      <div className={styles.kpiRow}>
        <KpiCard
          icon={<Users size={18} />}
          label="Total Alumnos"
          value={String(data.totalStudents)}
          subtitle={`${data.editions.length} ediciones activas`}
        />
        <KpiCard
          icon={<ClipboardCheck size={18} />}
          label="Evaluaciones"
          value={String(data.evaluationCount)}
          subtitle="Realizadas"
        />
        <KpiCard
          icon={<AlertTriangle size={18} />}
          label="Pendientes"
          value={String(data.pendingEvaluations.length)}
          subtitle="Evaluaciones sin completar"
          delta={
            data.pendingEvaluations.length > 0
              ? { value: "Requieren atención", positive: false }
              : null
          }
        />
        <KpiCard
          icon={<TrendingUp size={18} />}
          label="Media General"
          value={
            currentEdition?.avgScore != null
              ? currentEdition.avgScore.toFixed(1)
              : "—"
          }
          unit="/10"
          subtitle={currentEdition?.editionName ?? ""}
        />
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Group Evolution Chart */}
        <ChartCard
          title="Evolución por Grupo"
          className={styles.fullWidth}
          action={
            <select
              style={{
                background: "var(--bg-surface-alt)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "0.25rem 0.5rem",
                fontSize: "var(--text-xs)",
              }}
              value={selectedEdition ?? ""}
              onChange={(e) => setSelectedEdition(e.target.value)}
            >
              {data.editions.map((ed) => (
                <option key={ed.editionId} value={ed.editionId}>
                  {ed.editionName}
                </option>
              ))}
            </select>
          }
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={evolutionData}>
              <CartesianGrid stroke="rgba(148,163,184,0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#101D31",
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: 8,
                  color: "#F8FAFC",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
              {data.editions.map((ed, i) => (
                <Line
                  key={ed.editionId}
                  type="monotone"
                  dataKey={ed.editionName}
                  stroke={EDITION_COLORS[i % EDITION_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: EDITION_COLORS[i % EDITION_COLORS.length] }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Students Table */}
        <ChartCard title={`Alumnos — ${currentEdition?.editionName ?? ""}`}>
          {editionStudents.length > 0 ? (
            <DarkTable
              columns={[
                {
                  key: "rank",
                  header: "#",
                  width: "40px",
                  render: (r: StudentRanking) => (
                    <span style={{ fontWeight: 700, color: "var(--accent-teal)" }}>
                      {r.ranking}
                    </span>
                  ),
                },
                {
                  key: "student",
                  header: "Alumno",
                  render: (r: StudentRanking) => <AvatarCell name={r.studentName} />,
                },
                {
                  key: "avg",
                  header: "Media",
                  width: "130px",
                  render: (r: StudentRanking) => (
                    <ProgressCell value={r.overallAvg ?? 0} />
                  ),
                },
                {
                  key: "status",
                  header: "Estado",
                  width: "80px",
                  render: (r: StudentRanking) =>
                    (r.overallAvg ?? 0) < 5 ? (
                      <BadgeCell text="En riesgo" variant="danger" />
                    ) : (r.overallAvg ?? 0) >= 7 ? (
                      <BadgeCell text="Notable" variant="success" />
                    ) : (
                      <BadgeCell text="Apto" variant="default" />
                    ),
                },
              ]}
              data={editionStudents}
              keyFn={(r) => r.userId}
            />
          ) : (
            <div className={styles.emptyState}>Sin alumnos en esta edición</div>
          )}
        </ChartCard>

        {/* Top Students */}
        <ChartCard title="Top 5 Alumnos">
          <div className={styles.topStudentsList}>
            {data.topStudents.map((s, i) => {
              const initials = s.studentName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              const edName = data.editions.find((e) => e.editionId === s.editionId)?.editionName ?? "";
              return (
                <div key={s.userId} className={styles.topStudentItem}>
                  <span className={styles.topRank}>{i + 1}</span>
                  <div className={styles.topAvatar}>{initials}</div>
                  <div className={styles.topInfo}>
                    <div className={styles.topName}>{s.studentName}</div>
                    <div className={styles.topEdition}>{edName}</div>
                  </div>
                  <span className={styles.topScore}>{(s.overallAvg ?? 0).toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* Pending Evaluations */}
        <ChartCard title="Evaluaciones Pendientes" className={styles.fullWidth}>
          {data.pendingEvaluations.length > 0 ? (
            <div className={styles.pendingList}>
              {data.pendingEvaluations.slice(0, 10).map((p, i) => (
                <div key={`${p.weekId}-${p.userId}-${i}`} className={styles.pendingItem}>
                  <div className={styles.pendingInfo}>
                    <div className={styles.pendingStudent}>{p.studentName}</div>
                    <div className={styles.pendingMeta}>
                      {p.editionName} · Semana {p.weekNumber} · {p.weekType === "WORKSHOP" ? "Taller" : "Formación"}
                    </div>
                  </div>
                  <span className={styles.pendingDays}>
                    {p.daysOverdue} días
                  </span>
                </div>
              ))}
              {data.pendingEvaluations.length > 10 && (
                <div className={styles.emptyState}>
                  +{data.pendingEvaluations.length - 10} evaluaciones más
                </div>
              )}
            </div>
          ) : (
            <div className={styles.emptyState}>
              ¡Todas las evaluaciones están al día!
            </div>
          )}
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
