import filtroIcon from "../../../../assets/filtro.png";

const FILTER_LABELS = {
  todos: "Todos los tickets",
  abierto: "Tickets abiertos",
  proceso: "Tickets en proceso",
  espera: "Tickets en espera",
  cerrados: "Tickets cerrados",
  reabiertos: "Tickets reabiertos",
  reasignados: "Pendiente por recibir"
};

export default function FiltroEstadoTecnico({
  filtroActivo,
  cantidad,
  onLimpiar
}) {
  const filtered = filtroActivo !== "todos";

  return (
    <section className="technician-filter-summary" aria-live="polite">
      <div className="technician-filter-summary-icon">
        <img src={filtroIcon} alt="" aria-hidden="true" />
      </div>
      <div>
        <span>Filtro activo</span>
        <strong>{FILTER_LABELS[filtroActivo] || FILTER_LABELS.todos}</strong>
      </div>
      <p>
        {cantidad} {cantidad === 1 ? "ticket encontrado" : "tickets encontrados"}
      </p>
      {filtered && (
        <button type="button" onClick={onLimpiar}>
          Mostrar todos
        </button>
      )}
    </section>
  );
}
