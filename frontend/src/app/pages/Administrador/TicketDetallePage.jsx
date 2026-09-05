import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import cerrarTicketAction from "../../../features/tecnico/components/InicioTecnico/actions/cerrarTicket.js";
import iniciarTicketAction from "../../../features/tecnico/components/InicioTecnico/actions/iniciarTicket.js";
import TicketDetalle from "../../../features/tickets/components/detalle/TicketDetalle.jsx";
import { obtenerDetalleTicket } from "../../../features/tickets/services/ticketService.js";
import DashboardLayout from "../../layouts/DashboardLayoutAdministrador.jsx";

export default function TicketDetallePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const authenticatedUser = JSON.parse(localStorage.getItem("usuario") || "{}");
  const esPropio = searchParams.get("propio") === "1";

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const volverAlInicio = () => navigate("/administrador");

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

  const operationalAdmin = esPropio && Number(ticket?.tecnico_id) === Number(authenticatedUser.id);

  const iniciarTicket = ticketActual => iniciarTicketAction(ticketActual, refreshTicket, setTicket);
  const cerrarTicket = ticketActual => cerrarTicketAction(ticketActual, refreshTicket, valor => {
    if (valor === null) {
      volverAlInicio();
      return;
    }
    setTicket(valor);
  });

  return (
    <DashboardLayout>
      <main className="admin-dashboard-page w-full" aria-label="Detalle del ticket">
        {loading && (
          <article className="grid min-h-[430px] place-items-center rounded-none border border-slate-200 bg-white text-sm font-medium text-slate-500 shadow-sm" role="status">
            Cargando detalle del ticket…
          </article>
        )}

        {!loading && error && (
          <article className="grid min-h-[430px] place-items-center rounded-none border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-700 shadow-sm" role="alert">
            <div>
              <p>{error}</p>
              <button type="button" onClick={volverAlInicio} className="mt-4 rounded-none bg-white px-4 py-2 text-xs font-bold text-red-700 ring-1 ring-red-200 hover:bg-red-100">
                Volver a Inicio
              </button>
            </div>
          </article>
        )}

        {!loading && !error && ticket && (
          <TicketDetalle
            ticket={ticket}
            rol="administrador"
            administradorOperativo={operationalAdmin}
            administradorId={authenticatedUser.id}
            onVolver={volverAlInicio}
            onIniciar={iniciarTicket}
            onCerrarTicket={cerrarTicket}
          />
        )}
      </main>
    </DashboardLayout>
  );
}
