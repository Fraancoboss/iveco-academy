import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  TrendingUp,
  Trophy,
  Quote,
  UsersRound,
  ShieldCheck,
  Handshake,
  Leaf,
  Lightbulb,
} from "lucide-react";
import landingBg from "../assets/landing/landing-bg.png";
import styles from "./LandingCover.module.css";

export function LandingCover() {
  const bgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    function onScroll() {
      if (bgRef.current) {
        const y = window.scrollY;
        bgRef.current.style.transform = `translateY(${y * 0.25}px)`;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className={styles.cover} aria-label="Portada IVECO Academy">
      {/* Background image — right 55-60% */}
      <div className={styles.bgImage} role="img" aria-label="Equipo IVECO en taller industrial">
        <img
          ref={bgRef}
          src={landingBg}
          alt="Equipo de técnicos IVECO en un taller industrial moderno"
          loading="eager"
          fetchPriority="high"
          className={styles.bgImg}
        />
        <div className={styles.bgOverlayH} />
        <div className={styles.bgOverlayV} />
      </div>

      {/* ═══ Header bar ═══ */}
      <header className={styles.headerBar}>
        <div className={styles.headerInner}>
          <Link to="/">
            <img src="/iveco-academy-logo.png" alt="IVECO Academy" className={styles.headerLogo} />
          </Link>
          <nav className={styles.headerNav}>
            <Link to="/inscripcion" className={styles.headerLink}>Inscripción</Link>
            <Link to="/director" className={styles.headerCta}>Acceso</Link>
          </nav>
        </div>
      </header>

      {/* ═══ ZONE A — Hero ═══ */}
      <div className={styles.heroWrapper}>
        <div className={styles.heroInner}>

          {/* Text block */}
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>
              NUEVA VISIÓN. MEJOR FORMACIÓN. MEJOR FUTURO.
            </p>
            <div className={styles.eyebrowLine} />

            <h1 className={styles.h1}>
              <span className={styles.h1White}>IMPULSAMOS TALENTO.</span>
              <br />
              <span className={styles.h1Gradient}>LIDERAMOS EL FUTURO.</span>
            </h1>

            <p className={styles.heroParagraph}>
              Un nuevo modelo de formación para desarrollar talento, impulsar
              resultados y construir el{" "}
              <span className={styles.heroHighlight}>futuro de IVECO</span>.
            </p>
          </div>

          {/* 4 Features row */}
          <div className={styles.featuresRow}>
            <div className={styles.featureItem}>
              <GraduationCap size={30} strokeWidth={1.6} className={styles.iconTeal} />
              <div className={styles.featureTitle}>
                FORMACIÓN
                <br />
                DE EXCELENCIA
              </div>
              <div className={styles.featureDesc}>
                Programas diseñados para desarrollar talento real.
              </div>
            </div>

            <div className={styles.featureSep} />

            <div className={styles.featureItem}>
              <Users size={30} strokeWidth={1.6} className={styles.iconTeal} />
              <div className={styles.featureTitle}>
                APRENDIZAJE
                <br />
                PRÁCTICO
              </div>
              <div className={styles.featureDesc}>
                Metodología &quot;learning by doing&quot; en entornos reales.
              </div>
            </div>

            <div className={styles.featureSep} />

            <div className={styles.featureItem}>
              <TrendingUp size={30} strokeWidth={1.6} className={styles.iconBlue} />
              <div className={styles.featureTitle}>
                SEGUIMIENTO
                <br />
                PERSONALIZADO
              </div>
              <div className={styles.featureDesc}>
                Acompañamiento continuo para tu desarrollo profesional.
              </div>
            </div>

            <div className={styles.featureSep} />

            <div className={styles.featureItem}>
              <Trophy size={30} strokeWidth={1.6} className={styles.iconTeal} />
              <div className={styles.featureTitle}>
                IMPACTO REAL
                <br />
                EN EL NEGOCIO
              </div>
              <div className={styles.featureDesc}>
                Formamos hoy a los líderes que moverán el mañana.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ZONE B — Quote + Mission band ═══ */}
      <div className={styles.bandB}>
        <div className={styles.bandBInner}>
          {/* Left — Quote */}
          <div className={styles.quoteBlock}>
            <Quote size={56} strokeWidth={1.4} className={styles.quoteIcon} />
            <div className={styles.quoteText}>
              <span className={styles.quoteWhite}>Creemos en el talento.</span>
              <br />
              <span className={styles.quoteWhite}>Formamos a las </span>
              <span className={styles.quoteTeal}>personas</span>
              <span className={styles.quoteWhite}> que </span>
              <span className={styles.quoteBlue}>impulsarán el mañana.</span>
            </div>
          </div>

          <div className={styles.bandBSep} />

          {/* Right — Mission */}
          <div className={styles.missionBlock}>
            <div className={styles.missionCircle}>
              <UsersRound size={22} strokeWidth={1.6} className={styles.iconBlue} />
            </div>
            <div className={styles.missionText}>
              <div className={styles.missionLabel}>NUESTRA MISIÓN</div>
              <p className={styles.missionDesc}>
                Impulsar el talento de nuestra red para ofrecer soluciones que
                generan valor y construyen un futuro sostenible.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ZONE C — Values band ═══ */}
      <footer className={styles.bandC}>
        <div className={styles.bandCInner}>
          <div className={styles.valueItem}>
            <div className={styles.valueCircle}>
              <ShieldCheck size={21} strokeWidth={1.6} className={styles.iconTeal} />
            </div>
            <div className={styles.valueText}>
              <div className={styles.valueTitle}>DIVERSIDAD</div>
              <div className={styles.valueDesc}>
                Creemos en el talento diverso y en equipos inclusivos.
              </div>
            </div>
          </div>

          <div className={styles.valueSep} />

          <div className={styles.valueItem}>
            <div className={styles.valueCircle}>
              <Handshake size={21} strokeWidth={1.6} className={styles.iconTeal} />
            </div>
            <div className={styles.valueText}>
              <div className={styles.valueTitle}>COLABORACIÓN</div>
              <div className={styles.valueDesc}>
                Conectamos personas, ideas y conocimiento.
              </div>
            </div>
          </div>

          <div className={styles.valueSep} />

          <div className={styles.valueItem}>
            <div className={styles.valueCircle}>
              <Leaf size={21} strokeWidth={1.6} className={styles.iconTeal} />
            </div>
            <div className={styles.valueText}>
              <div className={styles.valueTitle}>SOSTENIBILIDAD</div>
              <div className={styles.valueDesc}>
                Formamos para un futuro más responsable y sostenible.
              </div>
            </div>
          </div>

          <div className={styles.valueSep} />

          <div className={styles.valueItem}>
            <div className={styles.valueCircle}>
              <Lightbulb size={21} strokeWidth={1.6} className={styles.iconTeal} />
            </div>
            <div className={styles.valueText}>
              <div className={styles.valueTitle}>INNOVACIÓN</div>
              <div className={styles.valueDesc}>
                Impulsamos nuevas formas de aprender para nuevos desafíos.
              </div>
            </div>
          </div>

          <div className={styles.valueSep} />

          <div className={styles.ivecoLogo}>IVECO</div>
        </div>
      </footer>
    </section>
  );
}
