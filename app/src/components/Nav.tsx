import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Nav.module.css";

interface Student {
  id: string;
  name: string;
  enrollments: { editionId: string; edition: { name: string } }[];
}

export function Nav() {
  const location = useLocation();
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then(setStudents)
      .catch(console.error);
  }, []);

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <strong>IVECO ACADEMY</strong>
        <span className={styles.badge}>PROTOTIPO</span>
      </div>
      <div className={styles.links}>
        <Link
          to="/director"
          className={location.pathname === "/director" ? styles.active : ""}
        >
          Director
        </Link>
        <div className={styles.dropdown}>
          <span className={styles.dropdownLabel}>Estudiantes</span>
          <div className={styles.dropdownMenu}>
            {students.map((s) => (
              <Link
                key={s.id}
                to={`/student/${s.id}`}
                className={styles.dropdownItem}
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
