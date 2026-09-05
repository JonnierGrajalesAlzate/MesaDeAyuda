import sinBusquedaIcon from "../../../../assets/SinBusqueda.png";
import TicketCard from "../TicketsTecnico/TicketCard.jsx";
function TecnicoContenido({
  tickets,
  filtroActivo,
  onVerDetalle,
  onTomarTicket,
  onAceptarSolicitud,
  onRechazarSolicitud,
  onLimpiarFiltro
}) {
  if (tickets.length === 0) {
    const filtered = filtroActivo && filtroActivo !== "todos";
    const labels = {
      abierto: "abiertos",
      proceso: "en proceso",
      espera: "en espera",
      cerrados: "cerrados",
      reabiertos: "reabiertos",
      reasignados: "pendientes por recibir"
    };

    return <div className="
                    azure-panel
                    tecnico-empty-panel
                    p-12
                    text-center
                ">

                <span className="tecnico-empty-icon" aria-hidden="true">
                    <img src={sinBusquedaIcon} alt="" />
                </span>

                <h2 className="
                        mt-5
                        text-2xl
                        font-normal
                        text-[#1e222b]
                    ">

                    {filtered
                      ? `No hay tickets ${labels[filtroActivo] || ""}`
                      : "No tienes tickets asignados"}

                </h2>

                <p className="
                        mt-3
                        text-slate-500
                    ">

                    {filtered
                      ? "Selecciona otra tarjeta para consultar un estado diferente."
                      : "Cuando se te asigne un ticket aparecerá aquí."}

                </p>

                {filtered && <button
                  type="button"
                  onClick={onLimpiarFiltro}
                  className="mt-5 rounded-lg bg-[#0076e3] px-5 py-2 font-semibold text-white hover:bg-[#005aaf]"
                >
                    Mostrar todos los tickets
                </button>}

            </div>;
  }
  return <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3
                gap-6
                items-stretch
            ">

            {tickets.map(ticket => <TicketCard
              key={ticket.id}
              ticket={ticket}
              onVerDetalle={onVerDetalle}
              onTomarTicket={onTomarTicket}
              onAceptarSolicitud={onAceptarSolicitud}
              onRechazarSolicitud={onRechazarSolicitud}
            />)}

        </div>;
}
export default TecnicoContenido;
