import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import alerta from "../../../shared/services/alertService.js";
import { obtenerSolicitudReasignacion, resolverSolicitudReasignacion } from "../../../features/tickets/services/ticketService.js";
import DashboardLayoutTecnico from "../../layouts/DashboardLayoutTecnico.jsx";
import DashboardLayoutAdministrador from "../../layouts/DashboardLayoutAdministrador.jsx";

function authenticatedUserId() {
  return Number(JSON.parse(localStorage.getItem("usuario") || "null")?.id);
}

export default function TicketSolicitudReasignacionPage({ layoutRole = "tecnico" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const basePath = layoutRole === "administrador" ? "/administrador" : "/tecnico";
  const [ticket, setTicket] = useState(null);
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolviendo, setResolviendo] = useState(false);
  const DashboardLayout = layoutRole === "administrador" ? DashboardLayoutAdministrador : DashboardLayoutTecnico;

  useEffect(() => {
    let active = true;
    obtenerSolicitudReasignacion(id)
      .then(response => {
        if (!active) return;
        setTicket(response.ticket);
        const vigente = response.solicitud?.estado === "PENDIENTE"
          && Number(response.solicitud.tecnico_destino_id) === authenticatedUserId()
          ? response.solicitud
          : null;
        setSolicitud(vigente);
        if (!vigente) setError("Esta solicitud ya no está disponible. Puede que ya haya sido respondida.");
      })
      .catch(requestError => {
        if (!active) return;
        setError(requestError.response?.data?.message || "No se pudo cargar la solicitud.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const responder = async decision => {
    const aceptar = decision === "ACEPTAR";
    const confirmation = await alerta.fire({
      icon: "question",
      accentColor: "#0076e3",
      title: aceptar ? `¿Aceptar el ticket #${id}?` : `¿Rechazar la solicitud del ticket #${id}?`,
      text: aceptar
        ? "El ticket quedará asignado a tu cuenta."
        : "El ticket seguirá asignado al técnico que lo solicitó.",
      showCancelButton: true,
      confirmButtonText: aceptar ? "Aceptar" : "Rechazar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: aceptar ? "#0076e3" : "#dc2626"
    });
    if (!confirmation.isConfirmed) return;

    setResolviendo(true);
    try {
      const response = await resolverSolicitudReasignacion(id, solicitud.id, decision);
      await alerta.fire({
        icon: "success",
        title: response.message,
        timer: 1800,
        showConfirmButton: false
      });
      navigate(aceptar ? `${basePath}/tickets/${id}` : basePath);
    } catch (requestError) {
      await alerta.fire({
        icon: "error",
        title: "No se pudo responder la solicitud",
        text: requestError.response?.data?.message
      });
    } finally {
      setResolviendo(false);
    }
  };

  return <DashboardLayout>
      <div className="space-y-5">
        <Link to={basePath} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[#0076e3]">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current"><path d="m12 4-6 6 6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Regresar
        </Link>

        <div className="crud-detail-card">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-xl font-bold text-[#1e222b]">Solicitud de reasignación</h2>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? "Cargando…" : ticket ? `Ticket #${ticket.id} · ${ticket.titulo}` : ""}
            </p>
          </div>

          {loading ? <p className="p-8 text-center text-slate-500">Cargando…</p> : error ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-slate-500">{error}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Categoría</span>
                  <p className="mt-1 text-sm font-semibold text-[#1e222b]">{ticket.categoria}</p>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Prioridad</span>
                  <p className="mt-1 text-sm font-semibold text-[#1e222b]">{ticket.prioridad}</p>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Solicitante</span>
                  <p className="mt-1 text-sm font-semibold text-[#1e222b]">{ticket.usuario}</p>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Solicitado por</span>
                  <p className="mt-1 text-sm font-semibold text-[#1e222b]">{solicitud.solicitante}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Descripción</span>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{ticket.descripcion}</p>
                </div>
              </div>

              <div className="mx-5 mb-1 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {solicitud.solicitante} te pidió recibir este ticket. Acepta si puedes atenderlo o recházalo para dejarlo con él.
              </div>

              <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-3.5 sm:flex-row sm:justify-end">
                <button type="button" disabled={resolviendo} onClick={() => responder("RECHAZAR")} className="min-h-10 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">
                  Rechazar
                </button>
                <button type="button" disabled={resolviendo} onClick={() => responder("ACEPTAR")} className="min-h-10 bg-[#0076e3] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#005fbd] disabled:cursor-not-allowed disabled:opacity-50">
                  {resolviendo ? "Enviando…" : "Aceptar"}
                </button>
              </footer>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>;
}
