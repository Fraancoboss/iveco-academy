import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ClipboardList } from "lucide-react";
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

const TALLA_ROPA = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Otro"];

export function InscriptionForm() {
  const [searchParams] = useSearchParams();
  const preselectedEdition = searchParams.get("editionId");

  const [editions, setEditions] = useState<Edition[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ApplicationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ── Form state ────────────────────────────── */
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [codigoPais, setCodigoPais] = useState("+34");
  const [telefono, setTelefono] = useState("");
  const [direccion1, setDireccion1] = useState("");
  const [direccion2, setDireccion2] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [intolerancias, setIntolerancias] = useState("");
  const [concesionario, setConcesionario] = useState("");
  const [editionId, setEditionId] = useState(preselectedEdition ?? "");
  /* Titulación 1 */
  const [titulo1, setTitulo1] = useState("");
  const [titulo1Inicio, setTitulo1Inicio] = useState("");
  const [titulo1Fin, setTitulo1Fin] = useState("");
  /* Titulación 2 */
  const [titulo2, setTitulo2] = useState("");
  const [titulo2Inicio, setTitulo2Inicio] = useState("");
  const [titulo2Fin, setTitulo2Fin] = useState("");
  /* Experiencia y competencias */
  const [experiencia, setExperiencia] = useState("");
  const [competencias, setCompetencias] = useState("");
  /* Responsable */
  const [respNombre, setRespNombre] = useState("");
  const [respApellido, setRespApellido] = useState("");
  const [respTelefono, setRespTelefono] = useState("");
  const [respEmail, setRespEmail] = useState("");
  const [respCargo, setRespCargo] = useState("");
  /* Tallas */
  const [tallaMono, setTallaMono] = useState("");
  const [tallaGuantes, setTallaGuantes] = useState("");
  const [tallaCalzado, setTallaCalzado] = useState("");
  const [tallaCamiseta, setTallaCamiseta] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/editions").then((r) => r.json()),
      fetch("/api/dealers").then((r) => r.json()),
    ])
      .then(([ed, dl]) => {
        setEditions(ed);
        setDealers(dl);
        if (!editionId && ed.length > 0) setEditionId(ed[0].id);
        if (dl.length > 0) setConcesionario(dl[0].id);
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
          candidateName: `${nombres} ${apellidos}`.trim(),
          candidateEmail: email,
          candidatePhone: `${codigoPais} ${telefono}`.trim() || undefined,
          dealerId: concesionario,
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

  const canSubmit = nombres && apellidos && email && dni && concesionario && editionId;

  /* ── Success screen ────────────────────────── */
  if (result) {
    return (
      <div className={styles.page}>
        <div className={styles.splitLeft}>
          <div className={styles.brandContent}>
            <Link to="/school">
              <img src="/iveco-academy-logo.png" alt="IVECO Academy" className={styles.brandLogo} />
            </Link>
            <h2 className={styles.brandTitle}>Escuela de Mecánicos</h2>
            <p className={styles.brandSub}>Formación técnica especializada para la red IVECO</p>
          </div>
        </div>
        <div className={styles.splitRight}>
          <div className={styles.resultCard}>
            <div className={styles.resultIcon}>
              {result.editionFull ? <ClipboardList size={48} /> : <CheckCircle2 size={48} />}
            </div>
            <h2 className={styles.resultTitle}>
              {result.editionFull ? "Solicitud en Cola" : "Solicitud Recibida"}
            </h2>
            <p className={styles.resultMessage}>
              {result.message}
            </p>
            <p className={styles.resultNote}>
              Al cerrar el grupo informaremos de los nuevos miembros del programa.
            </p>
            <div className={styles.resultActions}>
              <Link to="/school" className={styles.resultBtn}>
                Volver a la escuela
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form ──────────────────────────────────── */
  return (
    <div className={styles.page}>
      {/* Left panel — dark branding */}
      <div className={styles.splitLeft}>
        <div className={styles.brandContent}>
          <Link to="/school">
            <img src="/iveco-academy-logo.png" alt="IVECO Academy" className={styles.brandLogo} />
          </Link>
          <h2 className={styles.brandTitle}>Escuela de Mecánicos</h2>
          <p className={styles.brandSub}>
            Formación técnica especializada para la red IVECO.
            Diagnóstico electrónico, sistemas mecánicos y prácticas en taller.
          </p>
          <div className={styles.brandFeatures}>
            <div className={styles.brandFeature}>
              <span className={styles.featureCheck}>&#10003;</span>
              Formación presencial intensiva
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.featureCheck}>&#10003;</span>
              Prácticas en taller con vehículos reales
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.featureCheck}>&#10003;</span>
              Certificación IVECO oficial
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.featureCheck}>&#10003;</span>
              Seguimiento personalizado
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — white form */}
      <div className={styles.splitRight}>
        <div className={styles.formContainer}>
          <Link to="/school" className={styles.backLink}>
            ← Volver a la escuela
          </Link>

          <h1 className={styles.formTitle}>
            Ficha de inscripción Escuela de mecánicos — Quinta Edición
          </h1>
          <p className={styles.formSubtitle}>
            Las plazas se asignan por estricto orden de inscripción.
            Completa todos los campos obligatorios para formalizar tu solicitud.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* ── 1. Datos personales ── */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Datos personales</legend>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Nombres *</label>
                  <input className={styles.input} type="text" placeholder="Ej. Juan Carlos"
                    value={nombres} onChange={(e) => setNombres(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Apellidos *</label>
                  <input className={styles.input} type="text" placeholder="Ej. García López"
                    value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
                </div>
              </div>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Correo electrónico *</label>
                  <input className={styles.input} type="email" placeholder="juan.garcia@email.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>DNI / NIF *</label>
                  <input className={styles.input} type="text" placeholder="12345678A"
                    value={dni} onChange={(e) => setDni(e.target.value)} required />
                </div>
              </div>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Fecha de nacimiento *</label>
                  <input className={styles.input} type="date"
                    value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Teléfono *</label>
                  <div className={styles.phoneRow}>
                    <input className={`${styles.input} ${styles.phoneCode}`} type="text"
                      value={codigoPais} onChange={(e) => setCodigoPais(e.target.value)} />
                    <input className={styles.input} type="tel" placeholder="600 000 000"
                      value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* ── 2. Dirección ── */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Dirección</legend>

              <div className={styles.field}>
                <label className={styles.label}>Línea 1 *</label>
                <input className={styles.input} type="text" placeholder="Calle, número, piso"
                  value={direccion1} onChange={(e) => setDireccion1(e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Línea 2</label>
                <input className={styles.input} type="text" placeholder="Urbanización, bloque (opcional)"
                  value={direccion2} onChange={(e) => setDireccion2(e.target.value)} />
              </div>
              <div className={styles.row3}>
                <div className={styles.field}>
                  <label className={styles.label}>Ciudad *</label>
                  <input className={styles.input} type="text" placeholder="Madrid"
                    value={ciudad} onChange={(e) => setCiudad(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Provincia *</label>
                  <input className={styles.input} type="text" placeholder="Madrid"
                    value={provincia} onChange={(e) => setProvincia(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Código postal *</label>
                  <input className={styles.input} type="text" placeholder="28001"
                    value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} required />
                </div>
              </div>
            </fieldset>

            {/* ── 3. Alimentación ── */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Información adicional</legend>

              <div className={styles.field}>
                <label className={styles.label}>Intolerancias o restricciones alimenticias</label>
                <textarea className={styles.textarea} rows={2}
                  placeholder="Indique intolerancias alimenticias, alergias u otras restricciones (dejar en blanco si no aplica)"
                  value={intolerancias} onChange={(e) => setIntolerancias(e.target.value)} />
              </div>
            </fieldset>

            {/* ── 4. Concesionario / Edición ── */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Concesionario y edición</legend>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Nombre del Concesionario o Taller *</label>
                  <select className={styles.select} value={concesionario}
                    onChange={(e) => setConcesionario(e.target.value)} required>
                    <option value="">Seleccionar concesionario</option>
                    {dealers.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} — {d.city}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Edición *</label>
                  <select className={styles.select} value={editionId}
                    onChange={(e) => setEditionId(e.target.value)} required>
                    <option value="">Seleccionar edición</option>
                    {editions.map((ed) => (
                      <option key={ed.id} value={ed.id}>{ed.name} — {ed.course.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            {/* ── 5. Titulación Académica ── */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Titulación Académica</legend>

              <div className={styles.subSection}>
                <span className={styles.subLabel}>Titulación 1</span>
                <div className={styles.field}>
                  <label className={styles.label}>Título</label>
                  <input className={styles.input} type="text" placeholder="Ej. Grado Medio Electromecánica"
                    value={titulo1} onChange={(e) => setTitulo1(e.target.value)} />
                </div>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Fecha inicio</label>
                    <input className={styles.input} type="date"
                      value={titulo1Inicio} onChange={(e) => setTitulo1Inicio(e.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Fecha fin</label>
                    <input className={styles.input} type="date"
                      value={titulo1Fin} onChange={(e) => setTitulo1Fin(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className={styles.subSection}>
                <span className={styles.subLabel}>Titulación 2</span>
                <div className={styles.field}>
                  <label className={styles.label}>Título</label>
                  <input className={styles.input} type="text" placeholder="Ej. Grado Superior Automoción"
                    value={titulo2} onChange={(e) => setTitulo2(e.target.value)} />
                </div>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Fecha inicio</label>
                    <input className={styles.input} type="date"
                      value={titulo2Inicio} onChange={(e) => setTitulo2Inicio(e.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Fecha fin</label>
                    <input className={styles.input} type="date"
                      value={titulo2Fin} onChange={(e) => setTitulo2Fin(e.target.value)} />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* ── 6. Experiencia y competencias ── */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Experiencia y competencias</legend>

              <div className={styles.field}>
                <label className={styles.label}>Experiencia profesional acreditada</label>
                <textarea className={styles.textarea} rows={3}
                  placeholder="Describa brevemente su experiencia profesional relevante"
                  value={experiencia} onChange={(e) => setExperiencia(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Otras competencias</label>
                <textarea className={styles.textarea} rows={3}
                  placeholder="Carnets profesionales, certificaciones, idiomas, etc."
                  value={competencias} onChange={(e) => setCompetencias(e.target.value)} />
              </div>
            </fieldset>

            {/* ── 7. Datos del responsable ── */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Datos del responsable</legend>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Nombre *</label>
                  <input className={styles.input} type="text" placeholder="Nombre del responsable"
                    value={respNombre} onChange={(e) => setRespNombre(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Apellido *</label>
                  <input className={styles.input} type="text" placeholder="Apellido del responsable"
                    value={respApellido} onChange={(e) => setRespApellido(e.target.value)} required />
                </div>
              </div>
              <div className={styles.row3}>
                <div className={styles.field}>
                  <label className={styles.label}>Teléfono *</label>
                  <input className={styles.input} type="tel" placeholder="+34 600 000 000"
                    value={respTelefono} onChange={(e) => setRespTelefono(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email *</label>
                  <input className={styles.input} type="email" placeholder="responsable@empresa.com"
                    value={respEmail} onChange={(e) => setRespEmail(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Cargo *</label>
                  <input className={styles.input} type="text" placeholder="Ej. Jefe de Taller"
                    value={respCargo} onChange={(e) => setRespCargo(e.target.value)} required />
                </div>
              </div>
            </fieldset>

            {/* ── 8. Tallas ── */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Equipamiento — Tallas</legend>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Talla mono de trabajo *</label>
                  <select className={styles.select} value={tallaMono}
                    onChange={(e) => setTallaMono(e.target.value)} required>
                    <option value="">Seleccionar talla</option>
                    {TALLA_ROPA.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Talla guantes de trabajo *</label>
                  <select className={styles.select} value={tallaGuantes}
                    onChange={(e) => setTallaGuantes(e.target.value)} required>
                    <option value="">Seleccionar talla</option>
                    {TALLA_ROPA.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Talla calzado de seguridad *</label>
                  <input className={styles.input} type="text" placeholder="Ej. 42"
                    value={tallaCalzado} onChange={(e) => setTallaCalzado(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Talla camiseta / sudadera *</label>
                  <select className={styles.select} value={tallaCamiseta}
                    onChange={(e) => setTallaCamiseta(e.target.value)} required>
                    <option value="">Seleccionar talla</option>
                    {TALLA_ROPA.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </fieldset>

            {/* ── Error / Submit ── */}
            {error && <div className={styles.error}>{error}</div>}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !canSubmit}
            >
              {submitting ? "Enviando solicitud..." : "Enviar inscripción"}
            </button>

            <p className={styles.formDisclaimer}>
              Al cerrar el grupo informaremos de los nuevos miembros del programa.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
