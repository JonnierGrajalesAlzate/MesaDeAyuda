function PrioridadBadge({
  prioridad,
  color,
  className = ""
}) {
  const colores = {
    BAJA: "text-blue-600 bg-blue-50",
    MEDIA: "text-amber-600 bg-amber-50",
    ALTA: "text-red-600 bg-red-50",
    CRITICA: "text-red-900 bg-red-100"
  };
  return <span className={`
                inline-flex
                items-center
                px-3
                py-1
                rounded-full
                text-xs
                font-semibold
                ${color ? "" : colores[prioridad] || "text-slate-600 bg-slate-100"}
                ${className}
            `} style={color ? {
    backgroundColor: `${color}22`,
    color,
    border: `1px solid ${color}55`
  } : undefined}>
            {prioridad}
        </span>;
}
export default PrioridadBadge;
