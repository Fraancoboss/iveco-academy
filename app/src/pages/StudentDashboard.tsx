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
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { Nav } from "../components/Nav.js";
import { Card, KpiCard } from "../components/Card.js";
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

interface DashboardData {
  studentId: string;
  studentName: string;
  editionId: string;
  editionName: string;
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
}

export function StudentDashboard() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/students/${id}/dashboard`)
      .then((r) => {
        if (!r.ok) throw new Error("Student not found");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className={styles.page}><Nav /><p className={styles.error}>{error}</p></div>;
  if (!data) return <div className={styles.page}><Nav /><p className={styles.loading}>Cargando...</p></div>;

  const radarData = [
    { subject: "Puntualidad", value: data.behaviorAvgs.punctuality ?? 0, fullMark: 10 },
    { subject: "Atención", value: data.behaviorAvgs.attention ?? 0, fullMark: 10 },
    { subject: "Participación", value: data.behaviorAvgs.participation ?? 0, fullMark: 10 },
    { subject: "Documentación", value: data.behaviorAvgs.documentation ?? 0, fullMark: 10 },
    { subject: "Destreza", value: data.behaviorAvgs.dexterity ?? 0, fullMark: 10 },
    { subject: "Resolución", value: data.behaviorAvgs.problemSolving ?? 0, fullMark: 10 },
  ];

  const weeklyChartData = data.weeklyData.map((w) => ({
    name: `S${w.weekNumber}`,
    alumno: w.weekAvg != null ? Number(w.weekAvg.toFixed(2)) : null,
    curso: w.courseWeekAvg != null ? Number(w.courseWeekAvg.toFixed(2)) : null,
    tipo: w.weekType,
  }));

  const moduleBarData = data.weeklyData
    .filter((w) => w.weekType === "TRAINING")
    .map((w) => ({
      name: `S${w.weekNumber}`,
      punctuality: w.punctuality,
      attention: w.attention,
      participation: w.participation,
      documentation: w.documentation,
      dexterity: w.dexterity,
      problemSolving: w.problemSolving,
    }));

  return (
    <div className={styles.page}>
      <Nav />
      <div className={styles.header}>
        <h1>{data.studentName}</h1>
        <span className={styles.editionBadge}>{data.editionName}</span>
      </div>

      <div className={styles.kpiRow}>
        <KpiCard
          label="Promedio General"
          value={data.overallAvg != null ? data.overallAvg.toFixed(2) : "—"}
          color={data.overallAvg != null && data.overallAvg < 5 ? "var(--color-danger)" : "var(--color-primary)"}
        />
        <KpiCard
          label="Ranking"
          value={data.ranking != null ? `#${data.ranking} de ${data.totalStudents}` : "—"}
        />
        <KpiCard
          label="Asistencia"
          value={data.attendancePct != null ? `${data.attendancePct.toFixed(0)}%` : "—"}
          color={data.attendancePct != null && data.attendancePct < 80 ? "var(--color-warning)" : "var(--color-success)"}
        />
      </div>

      <div className={styles.chartGrid}>
        <Card title="Comportamiento (Radar)">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10 }} />
              <Radar
                name="Alumno"
                dataKey="value"
                stroke="var(--color-primary)"
                fill="var(--color-primary)"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Evolución Semanal: Alumno vs Curso">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="alumno"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Alumno"
              />
              <Line
                type="monotone"
                dataKey="curso"
                stroke="var(--color-text-secondary)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                name="Media Curso"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Desglose por Semana (Formación)" style={{ gridColumn: "1 / -1" }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={moduleBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="punctuality" fill="#003366" name="Puntualidad" />
              <Bar dataKey="attention" fill="#0055aa" name="Atención" />
              <Bar dataKey="participation" fill="#2a9d8f" name="Participación" />
              <Bar dataKey="documentation" fill="#e9c46a" name="Documentación" />
              <Bar dataKey="dexterity" fill="#f4a261" name="Destreza" />
              <Bar dataKey="problemSolving" fill="#e63946" name="Resolución" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
