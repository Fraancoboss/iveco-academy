import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./SchoolLanding.module.css";

interface Edition {
  id: string;
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  capacity: number;
  course: { id: string; name: string; description: string };
}

export function SchoolLanding() {
  const [editions, setEditions] = useState<Edition[]>([]);

  useEffect(() => {
    fetch("/api/editions")
      .then((r) => r.json())
      .then(setEditions)
      .catch(console.error);
  }, []);

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoIveco}>IVECO</span>
          <span className={styles.logoSlash}>/</span>
          <span className={styles.logoAcademy}>ACADEMY</span>
        </div>
        <div className={styles.navLinks}>
          <Link to="/school" className={styles.navLink}>Escuela</Link>
          <Link to="/school#programas" className={styles.navLink}>Programas</Link>
          <Link to="/inscripcion" className={styles.navCta}>Inscribirse</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroBadge}>Escuela de Mecánicos IVECO</div>
        <h1 className={styles.heroTitle}>
          Formación técnica especializada para la red IVECO
        </h1>
        <p className={styles.heroSub}>
          Programa de capacitación integral para técnicos de servicio de la red de concesionarios IVECO.
          Diagnóstico electrónico, sistemas mecánicos y prácticas en taller.
        </p>
        <div className={styles.heroActions}>
          <Link to="/inscripcion" className={styles.btnPrimary}>
            Solicitar plaza
          </Link>
          <a href="#programas" className={styles.btnSecondary}>
            Ver programas
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <div className={styles.statValue}>18</div>
          <div className={styles.statLabel}>Alumnos Activos</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>2</div>
          <div className={styles.statLabel}>Ediciones</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>5</div>
          <div className={styles.statLabel}>Módulos</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>95%</div>
          <div className={styles.statLabel}>Asistencia Media</div>
        </div>
      </div>

      {/* Courses */}
      <div className={styles.section} id="programas">
        <div className={styles.sectionEyebrow}>— Programas Disponibles —</div>
        <h2 className={styles.sectionTitle}>Ediciones Abiertas</h2>
        <div className={styles.coursesGrid}>
          {editions.map((ed) => {
            const start = new Date(ed.startDate);
            const end = new Date(ed.endDate);
            const months = [
              "enero", "febrero", "marzo", "abril", "mayo", "junio",
              "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
            ];
            return (
              <div key={ed.id} className={styles.courseCard}>
                <div className={styles.courseEdition}>{ed.name}</div>
                <div className={styles.courseName}>{ed.course.name}</div>
                <div className={styles.courseMeta}>
                  {ed.course.description}
                  <br />
                  <br />
                  {start.getDate()} de {months[start.getMonth()]} — {end.getDate()} de {months[end.getMonth()]} {end.getFullYear()}
                </div>
                <div className={styles.courseBar}>
                  <span className={styles.courseCapacity}>
                    {ed.capacity} plazas
                  </span>
                  <Link to={`/inscripcion?editionId=${ed.id}`} className={styles.courseCta}>
                    Solicitar plaza
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        Escuela de Mecánicos IVECO — Madrid, España · PROTOTIPO QUETZY
      </footer>
    </div>
  );
}
