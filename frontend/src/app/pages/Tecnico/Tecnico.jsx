import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayoutTecnico from "../../layouts/DashboardLayoutTecnico.jsx";
import EstadisticasTecnico from "../../../features/tecnico/components/TicketsTecnico/EstadisticasTecnico.jsx";
import TecnicoBienvenida from "../../../features/tecnico/components/InicioTecnico/TecnicoBienvenida.jsx";
import TecnicoContenido from "../../../features/tecnico/components/InicioTecnico/TecnicoContenido.jsx";
import useTecnico from "../../../features/tecnico/components/InicioTecnico/hooks/useTecnico.js";
import FiltroEstadoTecnico from "../../../features/tecnico/components/TicketsTecnico/FiltroEstadoTecnico.jsx";
function Tecnico() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    usuario,
    estadisticas,
    ticketsFiltrados,
    filtroEstado,
    seleccionarFiltro,
    verDetalle,
    tomarTicket,
    aceptarSolicitud,
    rechazarSolicitud
  } = useTecnico();

  useEffect(() => {
    const ticketId = searchParams.get("ticket");
    if (ticketId) navigate(`/tecnico/tickets/${ticketId}`, { replace: true });
  }, [searchParams, navigate]);

  return <DashboardLayoutTecnico>

            <div className="
                    w-full
                    space-y-8
                ">

                <TecnicoBienvenida usuario={usuario} />

                <EstadisticasTecnico
                  estadisticas={estadisticas}
                  filtroActivo={filtroEstado}
                  onFiltrar={seleccionarFiltro}
                />

                <FiltroEstadoTecnico
                  filtroActivo={filtroEstado}
                  cantidad={ticketsFiltrados.length}
                  onLimpiar={() => seleccionarFiltro("todos")}
                />

                <TecnicoContenido
                  tickets={ticketsFiltrados}
                  filtroActivo={filtroEstado}
                  onVerDetalle={verDetalle}
                  onTomarTicket={tomarTicket}
                  onAceptarSolicitud={aceptarSolicitud}
                  onRechazarSolicitud={rechazarSolicitud}
                  onLimpiarFiltro={() => seleccionarFiltro("todos")}
                />

            </div>

        </DashboardLayoutTecnico>;
}
export default Tecnico;
