import { useEffect, useState } from "react";
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
import { Nav } from "../components/Nav.js";
import { Card, KpiCard } from "../components/Card.js";
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

interface KpiData {
  editions: EditionKpi[];
  atRiskStudents: AtRiskStudent[];
  pendingEvaluations: PendingEvaluation[];
}

interface RankingEntry {
  enrollmentId: string;
  userId: string;
  studentName: string;
  overallAvg: number | null;
  ranking: number;
}

export function DirectorDashboard() {
  const [data, setData] = useState<KpiData | null>(null);
  const [rankings, setRankings] = useState<Record<string, RankingEntry[]>>({});

  useEffect(() => {
    fetch("/api/director/kpis")
      .then((r) => r.json())
      .then((d: KpiData) => {
        setData(d);
        // Fetch rankings for each edition
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

  if (!data) {
    return (
      <div className={styles.page}>
        <Nav />
        <p className={styles.loading}>Cargando KPIs...</p>
      </div>
    );
  }

  // Build trend data from rankings per edition (week-level from weekly breakdown would be better but ranking shows edition-level)
  const trendData = data.editions.map((ed) => ({
    name: ed.editionName.replace("Edición ", ""),
    avgScore: ed.avgScore != null ? Number(ed.avgScore.toFixed(2)) : null,
    attendance: ed.avgAttendancePct != null ? Number(ed.avgAttendancePct.toFixed(1)) : null,
  }));

  return (
    <div className={styles.page}>
      <Nav />
      <div className={styles.header}>
        <h1>Panel del Director</h1>
      </div>

      {data.editions.map((ed) => (
        <section key={ed.editionId} className={styles.editionSection}>
          <h2 className={styles.editionTitle}>{ed.editionName}</h2>
          <p className={styles.courseName}>{ed.courseName}</p>

          <div className={styles.kpiRow}>
            <KpiCard label="Matriculados" value={`${ed.enrolledCount} / ${ed.capacity}`} />
            <KpiCard
              label="Promedio"
              value={ed.avgScore != null ? ed.avgScore.toFixed(2) : "—"}
              color={ed.avgScore != null && ed.avgScore < 5 ? "var(--color-danger)" : "var(--color-primary)"}
            />
            <KpiCard
              label="En Riesgo"
              value={ed.atRiskCount}
              color={ed.atRiskCount > 0 ? "var(--color-danger)" : "var(--color-success)"}
            />
            <KpiCard
              label="Asistencia"
              value={ed.avgAttendancePct != null ? `${ed.avgAttendancePct.toFixed(0)}%` : "—"}
            />
            <KpiCard
              label="Semanas Evaluadas"
              value={`${ed.weeksWithEvaluations} / ${ed.totalWeeks}`}
            />
          </div>

          {rankings[ed.editionId] && (
            <Card title="Ranking" className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Estudiante</th>
                    <th>Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings[ed.editionId].map((r) => (
                    <tr
                      key={r.enrollmentId}
                      className={r.overallAvg != null && r.overallAvg < 5 ? styles.atRiskRow : ""}
                    >
                      <td>{r.ranking}</td>
                      <td>
                        <a href={`/student/${r.userId}`}>{r.studentName}</a>
                      </td>
                      <td>{r.overallAvg != null ? r.overallAvg.toFixed(2) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </section>
      ))}

      <div className={styles.bottomGrid}>
        <Card title="Estudiantes en Riesgo (Promedio < 5.0)">
          {data.atRiskStudents.length === 0 ? (
            <p className={styles.empty}>No hay estudiantes en riesgo.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Promedio</th>
                  <th>Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {data.atRiskStudents.map((s) => (
                  <tr key={s.enrollmentId} className={styles.atRiskRow}>
                    <td>
                      <a href={`/student/${s.userId}`}>{s.studentName}</a>
                    </td>
                    <td>{s.overallAvg.toFixed(2)}</td>
                    <td>{s.attendancePct != null ? `${s.attendancePct.toFixed(0)}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Evaluaciones Pendientes">
          {data.pendingEvaluations.length === 0 ? (
            <p className={styles.empty}>No hay evaluaciones pendientes.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Edición</th>
                  <th>Semana</th>
                  <th>Tipo</th>
                  <th>Estudiante</th>
                  <th>Días Vencido</th>
                </tr>
              </thead>
              <tbody>
                {data.pendingEvaluations.slice(0, 20).map((p, i) => (
                  <tr key={`${p.weekId}-${p.studentName}-${i}`}>
                    <td>{p.editionName}</td>
                    <td>S{p.weekNumber}</td>
                    <td>{p.weekType === "TRAINING" ? "Formación" : "Taller"}</td>
                    <td>{p.studentName}</td>
                    <td className={styles.overdue}>{p.daysOverdue}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Tendencia por Edición" style={{ gridColumn: "1 / -1" }}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgScore"
                stroke="var(--color-primary)"
                strokeWidth={2}
                name="Promedio"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
