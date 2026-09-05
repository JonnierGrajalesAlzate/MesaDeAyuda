function EstadoBadge({
  estado,
  color,
  className = ""
}) {
  const colores = {
    ABIERTO: "text-green-600 bg-green-50",
    "EN PROCESO": "text-yellow-600 bg-yellow-50",
    "EN ESPERA": "text-orange-600 bg-orange-50",
    REALIZADO: "text-blue-600 bg-blue-50",
    CERRADO: "text-slate-600 bg-slate-100",
    REABIERTO: "text-red-600 bg-red-50"
  };
  return <span className={`
                inline-flex
                items-center
                px-3
                py-1
                rounded-full
                text-xs
                font-semibold
                ${color ? "" : colores[estado] || "text-slate-600 bg-slate-100"}
                ${className}
            `} style={color ? {
    backgroundColor: `${color}22`,
    color,
    border: `1px solid ${color}55`
  } : undefined}>
            {estado}
        </span>;
}
export default EstadoBadge;
