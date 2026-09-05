function FechaTicket({
  fecha
}) {
  if (!fecha) {
    return <span className="text-slate-400">
                Sin fecha
            </span>;
  }
  const fechaFormateada = new Date(fecha).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  return <span className="text-slate-500 text-sm">
            {fechaFormateada}
        </span>;
}
export default FechaTicket;
