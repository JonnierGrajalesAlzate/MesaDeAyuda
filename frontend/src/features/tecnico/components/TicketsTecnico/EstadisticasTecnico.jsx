import abierto from "../../../../assets/abierto.png";
import cerrado from "../../../../assets/cerrado.png";
import enEspera from "../../../../assets/enEspera.png";
import proceso from "../../../../assets/proceso.png";
import reabierto from "../../../../assets/reabierto.png";
import reasignados from "../../../../assets/reasignacion.png";

function EstadisticasTecnico({
  estadisticas,
  filtroActivo,
  onFiltrar
}) {
  const cards = [
    {
      filter: "abierto",
      title: "Abierto",
      quantity: Number(estadisticas?.abiertos || 0),
      color: estadisticas?.color_abierto || "#0076e3",
      icon: abierto
    },
    {
      filter: "proceso",
      title: "En proceso",
      quantity: Number(estadisticas?.proceso || 0),
      color: estadisticas?.color_proceso || "#00c9ff",
      icon: proceso
    },
    {
      filter: "espera",
      title: "En espera",
      quantity: Number(estadisticas?.espera || 0),
      color: estadisticas?.color_espera || "#1e222b",
      icon: enEspera
    },
    {
      filter: "cerrados",
      title: "Cerrados",
      quantity: Number(estadisticas?.cerrados || 0),
      color: estadisticas?.color_cerrado || "#00d4a1",
      icon: cerrado
    },
    {
      filter: "reabiertos",
      title: "Reabiertos",
      quantity: Number(estadisticas?.reabiertos || 0),
      color: estadisticas?.color_reabierto || "#ef4444",
      icon: reabierto
    },
    {
      filter: "reasignados",
      title: "Pendiente por recibir",
      quantity: Number(estadisticas?.reasignados || 0),
      color: "#647487",
      icon: reasignados
    }
  ];

  const cardsVisibles = cards.filter(card => card.filter !== "reasignados" || card.quantity > 0);

  return (
    <section className="technician-stat-grid" aria-label="Filtrar tickets por estado">
      {cardsVisibles.map(card => {
        const active = filtroActivo === card.filter;
        return (
          <button
            type="button"
            key={card.filter}
            onClick={() => onFiltrar(card.filter)}
            aria-pressed={active}
            aria-label={`Mostrar ${card.title.toLowerCase()}: ${card.quantity}`}
            className={`azure-stat-card technician-stat-filter ${card.filter === "reasignados" ? "technician-stat-filter--flat" : ""} ${active ? "is-active" : ""}`}
            style={{ "--stat-color": card.color }}
          >
            <span className="technician-stat-copy">
              <span>{card.title}</span>
              <strong>{card.quantity}</strong> 
            </span>
            <span className="technician-stat-icon">
              <img src={card.icon} alt="" />
            </span>
            <i aria-hidden="true" />
          </button>
        );
      })}
    </section>
  );
}

export default EstadisticasTecnico;
