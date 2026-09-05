const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export default function EstadoNoticiaBadge({ estado = "Sin estado", color }) {
  const safeColor = HEX_COLOR.test(color || "") ? color : "#64748B";
  return <span
    className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset"
    style={{ color: safeColor, backgroundColor: `${safeColor}14`, boxShadow: `inset 0 0 0 1px ${safeColor}38` }}
  >
    {estado}
  </span>;
}
