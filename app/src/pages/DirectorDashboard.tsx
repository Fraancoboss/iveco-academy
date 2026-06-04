import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  School,
  Users,
  TrendingUp,
  FileText,
  Settings,
  Bell,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";
import { DashboardLayout } from "../components/ui/DashboardLayout.js";
import { KpiCard } from "../components/ui/KpiCard.js";
import { ChartCard } from "../components/ui/ChartCard.js";
import { DarkTable, AvatarCell, ProgressCell, BadgeCell } from "../components/ui/DarkTable.js";
import styles from "./DirectorDashboard.module.css";

interface EditionKpi {
  editionId: string;
  editionName: string;
  courseName: string;
  capacity: number;
  enrolledCount: number;
  avgScore: number | null;
  atRiskCount: number;
  avgAttendancePct: number | null;
  totalWeeks: number;
  weeksWithEvaluations: number;
  approvedCount: number;
  pendingCount: number;
}

interface AtRiskStudent {
  enrollmentId: string;
  userId: string;
  editionId: string;
  studentName: string;
  overallAvg: number;
  attendancePct: number | null;
}

interface PendingEvaluation {
  weekId: string;
  editionId: string;
  editionName: string;
  weekNumber: number;
  weekType: string;
  daysOverdue: number;
  studentName: string;
}

interface Distribution {
  excellent: number;
  good: number;
  regular: number;
  atRisk: number;
  total: number;
}

interface WeeklyAvg {
  editionId: string;
  weekNumber: number;
  weekAvg: number | null;
}

interface KpiData {
  editions: EditionKpi[];
  atRiskStudents: AtRiskStudent[];
  pendingEvaluations: PendingEvaluation[];
  distribution: Distribution;
  weeklyAvgs: WeeklyAvg[];
}

interface RankingEntry {
  enrollmentId: string;
  userId: string;
  studentName: string;
  overallAvg: number | null;
  ranking: number;
}

const DONUT_COLORS = ["#14B8A6", "#3B82F6", "#F59E0B", "#EF4444"];
const DONUT_LABELS = ["Sobresaliente (≥8.5)", "Notable (≥7.0)", "Regular (≥5.0)", "En Riesgo (<5.0)"];
const EDITION_COLORS = ["#3B82F6", "#14B8A6", "#F59E0B", "#EF4444"];

export function DirectorDashboard() {
  const [data, setData] = useState<KpiData | null>(null);
  const [rankings, setRankings] = useState<Record<string, RankingEntry[]>>({});
  const [selectedEdition, setSelectedEdition] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/director/kpis")
      .then((r) => r.json())
      .then((d: KpiData) => {
        setData(d);
        if (d.editions.length > 0) setSelectedEdition(d.editions[0].editionId);
        d.editions.forEach((ed) => {
          fetch(`/api/editions/${ed.editionId}/ranking`)
            .then((r) => r.json())
            .then((rData) => {
              setRankings((prev) => ({ ...prev, [ed.editionId]: rData.rankings }));
            })
            .catch(console.error);
        });
      })
      .catch(console.error);
  }, []);

  if (!data) return <div className={styles.loading}>Cargando panel directivo...</div>;

  const totalStudents = data.editions.reduce((sum, e) => sum + e.enrolledCount, 0);
  const overallAvg = data.editions.length > 0
    ? data.editions.reduce((sum, e) => sum + (e.avgScore ?? 0), 0) / data.editions.length
    : 0;
  const currentEdition = data.editions.find((e) => e.editionId === selectedEdition) ?? data.editions[0];
  const editionRankings = rankings[selectedEdition ?? ""] ?? [];

  // Donut data
  const donutData = [
    { name: "Sobresaliente", value: data.distribution.excellent },
    { name: "Notable", value: data.distribution.good },
    { name: "Regular", value: data.distribution.regular },
    { name: "En Riesgo", value: data.distribution.atRisk },
  ];

  // Weekly evolution per edition
  const maxWeek = Math.max(...data.weeklyAvgs.map((w) => w.weekNumber), 0);
  const evolutionData = Array.from({ length: maxWeek }, (_, i) => {
    const week = i + 1;
    const point: Record<string, unknown> = { name: `S${week}` };
    for (const ed of data.editions) {
      const avg = data.weeklyAvgs.find((w) => w.editionId === ed.editionId && w.weekNumber === week);
      point[ed.editionName] = avg?.weekAvg != null ? Number(avg.weekAvg.toFixed(2)) : null;
    }
    return point;
  });

  const sidebarSections = [
    {
      label: "Panel Director",
      items: [
        { icon: <BarChart3 size={16} />, label: "Dashboard", to: "/director", active: true },
        { icon: <School size={16} />, label: "Programas", to: "#" },
        { icon: <Users size={16} />, label: "Alumnos", to: "#", badge: totalStudents },
        { icon: <TrendingUp size={16} />, label: "Reportes", to: "#" },
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
    {
      label: "Gestión",
      items: [
        { icon: <Settings size={16} />, label: "Configuración", to: "#" },
        { icon: <Bell size={16} />, label: "Alertas", to: "#", badge: data.atRiskStudents.length || undefined },
      ],
    },
  ];

  return (
    <DashboardLayout
      sidebarSections={sidebarSections}
      viewLabel="Panel Director"
      userName="Carlos Martínez"
      userRole="Administrador IVECO"
    >
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>Resumen Ejecutivo</span>
        <div className={styles.headerRight}>
          <select
            className={styles.editionSelect}
            value={selectedEdition ?? ""}
            onChange={(e) => setSelectedEdition(e.target.value)}
          >
            {data.editions.map((ed) => (
              <option key={ed.editionId} value={ed.editionId}>
                {ed.editionName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Row */}
      <div className={styles.kpiRow}>
        <KpiCard
          icon={<Users size={18} />}
          label="Total Alumnos"
          value={String(totalStudents)}
          subtitle={`${data.editions.length} ediciones`}
        />
        <KpiCard
          icon={<TrendingUp size={18} />}
          label="Promedio General"
          value={overallAvg > 0 ? overallAvg.toFixed(1) : "\u2014"}
          unit="/10"
          subtitle="Todas las ediciones"
        />
        <KpiCard
          icon={<AlertTriangle size={18} />}
          label="En Riesgo"
          value={String(data.atRiskStudents.length)}
          subtitle="Promedio < 5.0"
          delta={
            data.atRiskStudents.length > 0
              ? { value: "Requieren seguimiento", positive: false }
              : null
          }
        />
        <KpiCard
          icon={<ClipboardCheck size={18} />}
          label="Eval. Pendientes"
          value={String(data.pendingEvaluations.length)}
          subtitle="Sin completar"
        />
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Distribution Donut */}
        <ChartCard title="Distribución de Rendimiento">
          <div className={styles.donutContainer}>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#101D31",
                    border: "1px solid rgba(148,163,184,0.2)",
                    borderRadius: 8,
                    color: "#F8FAFC",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.donutLegend}>
              {donutData.map((d, i) => (
                <div key={i} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: DONUT_COLORS[i] }} />
                  <span className={styles.legendLabel}>{DONUT_LABELS[i]}</span>
                  <span className={styles.legendValue}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Weekly Performance Line */}
        <ChartCard title="Evolución Semanal">
          <ResponsiveContainer width="100%" height={220}>
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

        {/* Program Table */}
        <ChartCard title={`Ranking — ${currentEdition?.editionName ?? ""}`} className={styles.fullWidth}>
          {editionRankings.length > 0 ? (
            <DarkTable
              columns={[
                {
                  key: "rank",
                  header: "#",
                  width: "40px",
                  render: (r: RankingEntry) => (
                    <span style={{ fontWeight: 700, color: "var(--accent-teal)" }}>
                      {r.ranking}
                    </span>
                  ),
                },
                {
                  key: "student",
                  header: "Alumno",
                  render: (r: RankingEntry) => <AvatarCell name={r.studentName} />,
                },
                {
                  key: "avg",
                  header: "Promedio",
                  width: "150px",
                  render: (r: RankingEntry) => <ProgressCell value={r.overallAvg ?? 0} />,
                },
                {
                  key: "status",
                  header: "Estado",
                  width: "100px",
                  render: (r: RankingEntry) =>
                    (r.overallAvg ?? 0) < 5 ? (
                      <BadgeCell text="En riesgo" variant="danger" />
                    ) : (r.overallAvg ?? 0) >= 8.5 ? (
                      <BadgeCell text="Sobresaliente" variant="success" />
                    ) : (r.overallAvg ?? 0) >= 7 ? (
                      <BadgeCell text="Notable" variant="default" />
                    ) : (
                      <BadgeCell text="Apto" variant="warning" />
                    ),
                },
              ]}
              data={editionRankings}
              keyFn={(r) => r.enrollmentId}
            />
          ) : (
            <div className={styles.emptyState}>Cargando ranking...</div>
          )}
        </ChartCard>

        {/* At Risk Students */}
        <ChartCard title="Alumnos en Riesgo">
          {data.atRiskStudents.length > 0 ? (
            <div className={styles.atRiskList}>
              {data.atRiskStudents.map((s) => {
                const initials = s.studentName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                const edName = data.editions.find((e) => e.editionId === s.editionId)?.editionName ?? "";
                return (
                  <div key={s.enrollmentId} className={styles.atRiskItem}>
                    <div className={styles.atRiskAvatar}>{initials}</div>
                    <div className={styles.atRiskInfo}>
                      <div className={styles.atRiskName}>{s.studentName}</div>
                      <div className={styles.atRiskMeta}>
                        {edName} · Asistencia: {s.attendancePct != null ? `${s.attendancePct.toFixed(0)}%` : "\u2014"}
                      </div>
                    </div>
                    <span className={styles.atRiskScore}>{s.overallAvg.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>Sin alumnos en riesgo</div>
          )}
        </ChartCard>

        {/* Activity Feed (MOCK ESTÁTICO) */}
        <ChartCard title="Actividad Reciente">
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <span className={styles.activityDot} style={{ background: "#14B8A6" }} />
              <div className={styles.activityText}>
                <strong>Ana López García</strong> completó evaluaciones de la semana 8 — MEC26-01
                <span className={styles.activityTime}>Hace 2 horas</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <span className={styles.activityDot} style={{ background: "#F59E0B" }} />
              <div className={styles.activityText}>
                <strong>David Ortega</strong> marcado como en riesgo — promedio 3.1
                <span className={styles.activityTime}>Hace 5 horas</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <span className={styles.activityDot} style={{ background: "#3B82F6" }} />
              <div className={styles.activityText}>
                Nueva solicitud de <strong>Test User</strong> para MEC26-01 (en cola)
                <span className={styles.activityTime}>Hace 1 día</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <span className={styles.activityDot} style={{ background: "#22C55E" }} />
              <div className={styles.activityText}>
                <strong>Alejandro Ruiz</strong> mejoró su promedio a 6.7 — tendencia ascendente
                <span className={styles.activityTime}>Hace 2 días</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <span className={styles.activityDot} style={{ background: "#EF4444" }} />
              <div className={styles.activityText}>
                <strong>Roberto Fernández</strong> tiene 12 evaluaciones de taller pendientes
                <span className={styles.activityTime}>Hace 3 días</span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
