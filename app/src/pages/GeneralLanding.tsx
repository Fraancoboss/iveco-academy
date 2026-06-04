import { Link } from "react-router-dom";
import {
  BarChart3,
  ClipboardCheck,
  Target,
  Users,
  TrendingUp,
  Shield,
  GraduationCap,
  UserCheck,
  LayoutDashboard,
} from "lucide-react";
import { LandingCover } from "./LandingCover.js";
import styles from "./GeneralLanding.module.css";

export function GeneralLanding() {
  return (
    <div className={styles.page}>
      {/* Cover — Hoja 1 (full viewport) */}
      <LandingCover />

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.featuresSectionTitle}>
          <h2>Todo lo que necesitas</h2>
          <p>Una plataforma completa para gestionar la formación técnica</p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><BarChart3 size={32} /></div>
            <div className={styles.featureTitle}>Dashboards en Tiempo Real</div>
            <div className={styles.featureDesc}>
              Visualización instantánea del rendimiento de alumnos, módulos y ediciones.
              Sin necesidad de Qlik ni herramientas externas.
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><ClipboardCheck size={32} /></div>
            <div className={styles.featureTitle}>Evaluación Continua</div>
            <div className={styles.featureDesc}>
              Sistema de evaluación semanal con seguimiento de 6 competencias
              conductuales y módulos técnicos específicos.
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><Target size={32} /></div>
            <div className={styles.featureTitle}>Detección de Riesgo</div>
            <div className={styles.featureDesc}>
              Alertas automáticas para alumnos con rendimiento por debajo del umbral.
              Intervención temprana para mejorar resultados.
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><Users size={32} /></div>
            <div className={styles.featureTitle}>Gestión de Inscripciones</div>
            <div className={styles.featureDesc}>
              Flujo completo desde la solicitud hasta la matrícula.
              Cola de espera automática cuando la edición está completa.
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><TrendingUp size={32} /></div>
            <div className={styles.featureTitle}>Ranking y Comparativas</div>
            <div className={styles.featureDesc}>
              Clasificación automática por edición con comparativas entre
              el rendimiento individual y la media del curso.
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><Shield size={32} /></div>
            <div className={styles.featureTitle}>Seguro por Diseño</div>
            <div className={styles.featureDesc}>
              Cabeceras de seguridad, rate limiting, validación de datos
              con Zod, y auditoría de dependencias incluida.
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className={styles.roles}>
        <div className={styles.rolesInner}>
          <h2 className={styles.rolesTitle}>Paneles por Rol</h2>
          <p className={styles.rolesSub}>Cada usuario accede a la información que necesita</p>
          <div className={styles.rolesGrid}>
            <div className={styles.roleCard}>
              <div className={styles.roleIcon}><GraduationCap size={28} /></div>
              <div className={styles.roleTitle}>Alumno</div>
              <div className={styles.roleDesc}>
                Promedio general, ranking, asistencia, evolución semanal,
                radar de competencias por módulo y próximas clases.
              </div>
              <Link to="/school" className={styles.roleCta}>
                Ver demo →
              </Link>
            </div>
            <div className={styles.roleCard}>
              <div className={styles.roleIcon}><UserCheck size={28} /></div>
              <div className={styles.roleTitle}>Formador</div>
              <div className={styles.roleDesc}>
                Evolución del grupo, tabla de alumnos con progreso,
                top estudiantes, y evaluaciones pendientes.
              </div>
              <Link to="/director" className={styles.roleCta}>
                Ver demo →
              </Link>
            </div>
            <div className={styles.roleCard}>
              <div className={styles.roleIcon}><LayoutDashboard size={28} /></div>
              <div className={styles.roleTitle}>Director</div>
              <div className={styles.roleDesc}>
                Resumen ejecutivo, distribución de rendimiento, KPIs por edición,
                alumnos en riesgo y actividad reciente.
              </div>
              <Link to="/director" className={styles.roleCta}>
                Ver demo →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <img src="/iveco-academy-logo.png" alt="IVECO Academy" style={{ height: 44, width: "auto" }} />
        </div>
        <div className={styles.footerText}>
          Prototipo v0.2.0-demo · Desarrollado por Quetzy · 2026
        </div>
      </footer>
    </div>
  );
}
