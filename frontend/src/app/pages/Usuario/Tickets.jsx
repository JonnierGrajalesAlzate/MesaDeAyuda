import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayoutUsuario.jsx";
import useTickets from "../../../features/usuario/components/VerTickets/hooks/useTickets.js";
import TicketsHeader from "../../../features/usuario/components/VerTickets/TicketsHeader.jsx";
import TicketsFiltros from "../../../features/usuario/components/VerTickets/TicketsFiltros.jsx";
import TicketsTabla from "../../../features/usuario/components/VerTickets/TicketsTabla.jsx";
import PageLoader from "../../../shared/ui/loading/PageLoader.jsx";
function Tickets() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    loading,
    ticketsFiltrados,
    estados,
    prioridades,
    categorias,
    filtroTexto,
    setFiltroTexto,
    filtroEstado,
    setFiltroEstado,
    filtroPrioridad,
    setFiltroPrioridad,
    filtroCategoria,
    setFiltroCategoria
  } = useTickets();

  useEffect(() => {
    const ticketId = searchParams.get("ticket");
    if (ticketId) navigate(`/tickets/${ticketId}`, { replace: true });
  }, [searchParams, navigate]);

  if (loading) {
    return <PageLoader label="Cargando tus tickets…" />;
  }
  return <DashboardLayout>


            {/* Encabezado */}

            <TicketsHeader />



            {/* Filtros */}

            <TicketsFiltros
              filtroTexto={filtroTexto}
              setFiltroTexto={setFiltroTexto}
              filtroEstado={filtroEstado}
              setFiltroEstado={setFiltroEstado}
              filtroPrioridad={filtroPrioridad}
              setFiltroPrioridad={setFiltroPrioridad}
              filtroCategoria={filtroCategoria}
              setFiltroCategoria={setFiltroCategoria}
              estados={estados}
              prioridades={prioridades}
              categorias={categorias}
            />

            {/* Tabla */}

            <TicketsTabla tickets={ticketsFiltrados} onVerDetalle={ticket => navigate(`/tickets/${ticket.id}`)} />


        </DashboardLayout>;
}
export default Tickets;
