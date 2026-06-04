import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "./InscriptionForm.module.css";

interface Edition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  capacity: number;
  course: { name: string };
}

interface Dealer {
  id: string;
  name: string;
  code: string;
  city: string;
}

interface ApplicationResult {
  id: string;
  status: string;
  editionFull: boolean;
  queuePosition: number | null;
  capacity: number;
  enrolledCount: number;
  message: string;
}

export function InscriptionForm() {
  const [searchParams] = useSearchParams();
  const preselectedEdition = searchParams.get("editionId");

  const [editions, setEditions] = useState<Edition[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ApplicationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dealerId, setDealerId] = useState("");
  const [editionId, setEditionId] = useState(preselectedEdition ?? "");

  useEffect(() => {
    Promise.all([
      fetch("/api/editions").then((r) => r.json()),
      fetch("/api/dealers").then((r) => r.json()),
    ])
      .then(([ed, dl]) => {
        setEditions(ed);
        setDealers(dl);
        if (!editionId && ed.length > 0) setEditionId(ed[0].id);
        if (dl.length > 0) setDealerId(dl[0].id);
      })
      .catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName: name,
          candidateEmail: email,
          candidatePhone: phone || undefined,
          dealerId,
          editionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al enviar la solicitud");
      } else {
        setResult(data);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedEdition = editions.find((e) => e.id === editionId);

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <Link to="/school" className={styles.logo}>
          <img src="/iveco-academy-logo.png" alt="IVECO Academy" style={{ height: 32, width: "auto" }} />
        </Link>
        <Link to="/school" className={styles.backLink}>
          ← Volver a la escuela
        </Link>
      </nav>

      <div className={styles.container}>
        {result ? (
          /* Success Result */
          <div className={styles.result}>
            <div className={styles.resultIcon}>
              {result.editionFull ? "📋" : "✅"}
            </div>
            <div className={styles.resultTitle}>
              {result.editionFull ? "Solicitud en Cola" : "Solicitud Recibida"}
            </div>
            <div className={styles.resultMessage}>
              {result.message}
            </div>
            <div className={styles.resultActions}>
              <Link to="/school" className={styles.resultLink}>
                Volver a la escuela
              </Link>
              <Link to="/inscripcion" className={styles.resultLink} onClick={() => {
                setResult(null);
                setName("");
                setEmail("");
                setPhone("");
              }}>
                Nueva solicitud
              </Link>
            </div>
          </div>
        ) : (
          /* Form */
          <>
            <h1 className={styles.title}>Solicitar Plaza</h1>
            <p className={styles.subtitle}>
              Completa el formulario para solicitar una plaza en el programa de formación.
              {selectedEdition && (
                <> Edición seleccionada: <strong>{selectedEdition.name} — {selectedEdition.course.name}</strong></>
              )}
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label}>Nombre completo *</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Ej. Juan García López"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email *</label>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="juan.garcia@concesionario.es"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Teléfono</label>
                <input
                  className={styles.input}
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <span className={styles.hint}>Opcional</span>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Concesionario *</label>
                <select
                  className={styles.select}
                  value={dealerId}
                  onChange={(e) => setDealerId(e.target.value)}
                  required
                >
                  <option value="">Seleccionar concesionario</option>
                  {dealers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Edición *</label>
                <select
                  className={styles.select}
                  value={editionId}
                  onChange={(e) => setEditionId(e.target.value)}
                  required
                >
                  <option value="">Seleccionar edición</option>
                  {editions.map((ed) => (
                    <option key={ed.id} value={ed.id}>
                      {ed.name} — {ed.course.name} ({ed.capacity} plazas)
                    </option>
                  ))}
                </select>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={submitting || !name || !email || !dealerId || !editionId}
              >
                {submitting ? "Enviando..." : "Enviar Solicitud"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
