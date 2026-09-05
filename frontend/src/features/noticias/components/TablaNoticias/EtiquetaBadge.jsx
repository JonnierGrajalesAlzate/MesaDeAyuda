function normalizeColor(value) {
  const color = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : "#0076e3";
}

function withAlpha(hex, alpha) {
  const red = Number.parseInt(hex.slice(1, 3), 16);
  const green = Number.parseInt(hex.slice(3, 5), 16);
  const blue = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export default function EtiquetaBadge({ etiqueta, color, esNueva, centrada = true }) {
  const safeColor = normalizeColor(color);

  return <div className={`flex flex-wrap gap-2 ${centrada ? "justify-center" : "justify-start"}`}>
    <span
      className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset"
      style={{
        color: safeColor,
        backgroundColor: withAlpha(safeColor, 0.08),
        boxShadow: `inset 0 0 0 1px ${withAlpha(safeColor, 0.22)}`,
      }}
    >
      {etiqueta}
    </span>

    {esNueva && <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1.5 text-xs font-bold text-green-700">
      Nuevo
    </span>}
  </div>;
}
