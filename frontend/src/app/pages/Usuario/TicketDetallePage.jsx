import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayoutUsuario.jsx";
import TicketDetalle from "../../../features/tickets/components/detalle/TicketDetalle.jsx";
import { obtenerDetalleTicket } from "../../../features/tickets/services/ticketService.js";
import PageLoader from "../../../shared/ui/loading/PageLoader.jsx";

export default function TicketDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const volver = () => navigate("/tickets");

  if (loading) {
    return <PageLoader label="Cargando tu ticket…" />;
  }

  return (
    <DashboardLayout>
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={volver}
            className="mt-4 rounded-xl bg-white px-4 py-2 text-xs font-bold text-red-700 ring-1 ring-red-200 hover:bg-red-100"
          >
            Volver a mis tickets
          </button>
        </div>
      )}

      {!error && ticket && (
        <div className="mt-6 scroll-mt-24">
          <TicketDetalle ticket={ticket} rol="usuario" onVolver={volver} />
        </div>
      )}
    </DashboardLayout>
  );
}
