import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import alerta from "../../../shared/services/alertService.js";
import { obtenerTecnicosElegiblesTicket, reasignarTicket as reasignarTicketDirecto } from "../../../features/administrador/services/administradorService.js";
import { crearSolicitudReasignacion, obtenerDetalleTicket, obtenerSolicitudReasignacion } from "../../../features/tickets/services/ticketService.js";
import DashboardLayoutTecnico from "../../layouts/DashboardLayoutTecnico.jsx";
import DashboardLayoutAdministrador from "../../layouts/DashboardLayoutAdministrador.jsx";

export default function TicketReasignarPage({ layoutRole = "tecnico" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const esAdministrador = layoutRole === "administrador";
  const basePath = esAdministrador ? "/administrador" : "/tecnico";
  const DashboardLayout = esAdministrador ? DashboardLayoutAdministrador : DashboardLayoutTecnico;
  const volver = () => navigate(`${basePath}/tickets/${id}`);
  const [ticket, setTicket] = useState(null);
  const [tecnicos, setTecnicos] = useState([]);
  const [solicitudPendiente, setSolicitudPendiente] = useState(null);
  const [tecnicoDestinoId, setTecnicoDestinoId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      obtenerDetalleTicket(id),
      obtenerTecnicosElegiblesTicket(id),
      esAdministrador ? Promise.resolve({ solicitud: null }) : obtenerSolicitudReasignacion(id)
    ]).then(([ticketData, tecnicosData, solicitudData]) => {
      if (!active) return;
      setTicket(ticketData.ticket);
      setTecnicos((tecnicosData.tecnicos || []).filter(tecnico => Number(tecnico.id) !== Number(tecnicosData.tecnico_actual_id)));
      setSolicitudPendiente(solicitudData.solicitud?.estado === "PENDIENTE" ? solicitudData.solicitud : null);
    }).catch(() => {
      if (active) alerta.fire({
        icon: "error",
        title: "No se pudo cargar la información del ticket"
      });
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id, esAdministrador]);

  const confirmarReasignacion = async event => {
    event.preventDefault();
    if (!tecnicoDestinoId) return;
    setSaving(true);
    try {
      if (esAdministrador) {
        const response = await reasignarTicketDirecto(id, Number(tecnicoDestinoId));
        await alerta.fire({
          icon: "success",
          title: response.message,
          timer: 1800,
          showConfirmButton: false
        });
      } else {
        await crearSolicitudReasignacion(id, Number(tecnicoDestinoId));
        await alerta.fire({
          icon: "success",
          title: "Solicitud enviada",
          text: "Le avisamos al técnico para que la acepte o la rechace.",
          timer: 2200,
          showConfirmButton: false
        });
      }
      volver();
    } catch (error) {
      await alerta.fire({
        icon: "error",
        title: esAdministrador ? "No se pudo reasignar el ticket" : "No se pudo enviar la solicitud",
        text: error.response?.data?.message
      });
    } finally {
      setSaving(false);
    }
  };

  return <DashboardLayout>
      <div className="space-y-5">
        <Link to={`${basePath}/tickets/${id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[#0076e3]">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current"><path d="m12 4-6 6 6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Regresar
        </Link>

        <div className="crud-detail-card">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-xl font-bold text-[#1e222b]">Reasignar ticket</h2>
            <p className="mt-1 text-sm text-slate-500">
              {ticket ? `Ticket #${ticket.id} · ${ticket.titulo}` : "Cargando…"}
            </p>
          </div>

          {loading ? <p className="p-8 text-center text-slate-500">Cargando…</p> : (
            <form onSubmit={confirmarReasignacion}>
              <div className="px-5 py-4">
                {solicitudPendiente ? (
                  <p className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Ya enviaste una solicitud de reasignación para este ticket y está pendiente de respuesta.
                  </p>
                ) : tecnicos.length === 0 ? (
                  <p className="rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    No hay otros técnicos disponibles para atender la categoría de este ticket.
                  </p>
                ) : (
                  <label className="block">
                    Técnico destino
                    <select className="field w-1/2" value={tecnicoDestinoId} onChange={event => setTecnicoDestinoId(event.target.value)} required>
                      <option value="">Selecciona un técnico</option>
                      {tecnicos.map(tecnico => <option key={tecnico.id} value={tecnico.id}>
                          {tecnico.nombre} · {tecnico.tickets_activos} activos
                        </option>)}
                    </select>
                    <span className="mt-1.5 block text-xs font-normal text-slate-500">
                      {esAdministrador
                        ? "El ticket se reasignará de inmediato a este técnico."
                        : "Le enviaremos una solicitud; el ticket solo se reasignará si la acepta."}
                    </span>
                  </label>
                )}
              </div>

              {!solicitudPendiente && tecnicos.length > 0 && <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-3.5 sm:flex-row sm:justify-end">
                  <button type="button" onClick={volver} className="min-h-10 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving || !tecnicoDestinoId} className="min-h-10 bg-[#0076e3] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#005fbd] disabled:cursor-not-allowed disabled:opacity-50">
                    {saving
                      ? (esAdministrador ? "Reasignando…" : "Enviando…")
                      : (esAdministrador ? "Reasignar ticket" : "Enviar solicitud")}
                  </button>
                </footer>}
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>;
}
