import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardLayoutTecnico from "../../layouts/DashboardLayoutTecnico.jsx";
import TicketDetalle from "../../../features/tickets/components/detalle/TicketDetalle.jsx";
import { obtenerDetalleTicket } from "../../../features/tickets/services/ticketService.js";
import cerrarTicketAction from "../../../features/tecnico/components/InicioTecnico/actions/cerrarTicket.js";
import iniciarTicketAction from "../../../features/tecnico/components/InicioTecnico/actions/iniciarTicket.js";
import PageLoader from "../../../shared/ui/loading/PageLoader.jsx";

export default function TicketDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const origen = location.pathname.startsWith("/tecnico") ? "/tecnico" : "/estadisticas";
  const volver = () => navigate(origen);

  const refreshTicket = useCallback(async () => {
    try {
      const response = await obtenerDetalleTicket(id);
      setTicket(response.ticket);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo cargar el detalle del ticket.");
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    obtenerDetalleTicket(id)
      .then(response => {
        if (!active) return;
        setTicket(response.ticket);
        setError("");
      })
      .catch(requestError => {
        if (!active) return;
        setTicket(null);
        setError(requestError.response?.data?.message || "No se pudo cargar el detalle del ticket.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const iniciarTicket = ticketActual => iniciarTicketAction(ticketActual, refreshTicket, setTicket);
  const cerrarTicket = ticketActual => cerrarTicketAction(ticketActual, refreshTicket, valor => {
    if (valor === null) {
      volver();
      return;
    }
    setTicket(valor);
  });

  if (loading) {
    return <PageLoader label="Cargando el detalle del ticket…" />;
  }

  return (
    <DashboardLayoutTecnico>
      {error && (
        <div className="azure-panel p-6 text-center text-sm font-medium text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={volver}
            className="mt-4 rounded-xl bg-white px-4 py-2 text-xs font-bold text-red-700 ring-1 ring-red-200 hover:bg-red-100"
          >
            {origen === "/tecnico" ? "Volver al inicio" : "Volver a Estadísticas"}
          </button>
        </div>
      )}

      {!error && ticket && (
        <TicketDetalle
          ticket={ticket}
          rol="tecnico"
          onVolver={volver}
          onIniciar={iniciarTicket}
          onCerrarTicket={cerrarTicket}
          onTicketActualizado={refreshTicket}
        />
      )}
    </DashboardLayoutTecnico>
  );
}
