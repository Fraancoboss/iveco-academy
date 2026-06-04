export function Watermark() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <span
        style={{
          fontSize: "4rem",
          fontWeight: 900,
          color: "rgba(0, 0, 0, 0.06)",
          transform: "rotate(-30deg)",
          whiteSpace: "nowrap",
          userSelect: "none",
          letterSpacing: "0.2em",
        }}
      >
        PROTOTIPO — QUETZY
      </span>
    </div>
  );
}
