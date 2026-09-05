import { useCallback, useEffect, useState } from "react";
import alerta from "../../../../shared/services/alertService.js";
import useRealtimeRefresh from "../../../../shared/hooks/useRealtimeRefresh.js";
import { actualizarEstadoTicket } from "../../services/ticketService.js";
import { crearSolicitudReapertura, obtenerSolicitudReapertura, resolverSolicitudReapertura } from "../../services/reaperturaService.js";
function mensajeError(error, respaldo) {
  return error.response?.data?.message || respaldo;
}
export default function TicketReapertura({
  ticket,
  rol,
  onTicketActualizado,
  mostrarAccionTecnico = true
}) {
  const [solicitud, setSolicitud] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [mensajeFormulario, setMensajeFormulario] = useState(null);
  const ticketId = Number(ticket?.id);
  const rolNormalizado = String(rol || "").toLowerCase();
  const estaCerrado = Number(ticket?.estado_id) === 2 || String(ticket?.estado || "").toUpperCase() === "CERRADO";
  const pendiente = solicitud?.estado === "PENDIENTE";
  const cargarSolicitud = useCallback(async () => {
    if (!ticketId) return;
    try {
      const response = await obtenerSolicitudReapertura(ticketId);
      setSolicitud(response.solicitud || null);
    } catch (error) {
      console.error("No se pudo cargar la solicitud de reapertura", error);
    } finally {
      setCargando(false);
    }
  }, [ticketId]);
  useEffect(() => {
    let activo = true;
    obtenerSolicitudReapertura(ticketId).then(response => {
      if (activo) setSolicitud(response.solicitud || null);
    }).catch(error => {
      console.error("No se pudo cargar la solicitud de reapertura", error);
    }).finally(() => {
      if (activo) setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [ticketId]);
  useRealtimeRefresh("solicitudes-reapertura", activity => {
    if (!activity?.ticket_id || Number(activity.ticket_id) === ticketId) {
      return cargarSolicitud();
    }
    return undefined;
  });
  const solicitar = async event => {
    event.preventDefault();
    const motivoLimpio = motivo.trim();
    if (motivoLimpio.length < 10) {
      setMensajeFormulario({
        tipo: "error",
        texto: "Escribe al menos 10 caracteres."
      });
      return;
    }
    setProcesando(true);
    setMensajeFormulario(null);
    try {
      const response = await crearSolicitudReapertura(ticketId, motivoLimpio);
      await cargarSolicitud();
      setMotivo("");
      setFormularioVisible(false);
      setMensajeFormulario({
        tipo: "success",
        texto: response.message
      });
    } catch (error) {
      setMensajeFormulario({
        tipo: "error",
        texto: mensajeError(error, "No se pudo enviar la solicitud. Intenta nuevamente.")
      });
    } finally {
      setProcesando(false);
    }
  };
  const reabrir = async () => {
    const result = await alerta.fire({
      icon: "question",
      title: pendiente ? "Aceptar solicitud" : "Reabrir ticket",
      text: pendiente ? "El usuario podrá volver a enviar mensajes en este ticket." : "El ticket cambiará a REABIERTO y se habilitarán nuevamente los mensajes.",
      showCancelButton: true,
      confirmButtonText: pendiente ? "Sí, aceptar" : "Sí, reabrir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#00a87f"
    });
    if (!result.isConfirmed) return;
    setProcesando(true);
    try {
      const response = pendiente ? await resolverSolicitudReapertura(ticketId, solicitud.id, "ACEPTAR") : await actualizarEstadoTicket(ticketId, 5);
      try {
        await onTicketActualizado?.();
      } catch (refreshError) {
        console.error("El ticket se reabrió, pero no se pudo refrescar el detalle", refreshError);
      }
      await cargarSolicitud();
      await alerta.fire({
        icon: "success",
        title: "Ticket reabierto",
        text: response.message,
        timer: 1800,
        showConfirmButton: false
      });
    } catch (error) {
      await alerta.fire({
        icon: "error",
        title: "No se pudo reabrir",
        text: mensajeError(error, "Intenta nuevamente."),
        confirmButtonColor: "#0076e3"
      });
    } finally {
      setProcesando(false);
    }
  };
  const rechazar = async () => {
    const result = await alerta.fire({
      icon: "warning",
      title: "Rechazar solicitud",
      text: "Se le notificará al usuario que el ticket permanecerá cerrado.",
      showCancelButton: true,
      confirmButtonText: "Rechazar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626"
    });
    if (!result.isConfirmed) return;
    setProcesando(true);
    try {
      const response = await resolverSolicitudReapertura(ticketId, solicitud.id, "RECHAZAR");
      await cargarSolicitud();
      await alerta.fire({
        icon: "success",
        title: "Solicitud respondida",
        text: response.message,
        timer: 1800,
        showConfirmButton: false
      });
    } catch (error) {
      await alerta.fire({
        icon: "error",
        title: "No se pudo responder",
        text: mensajeError(error, "Intenta nuevamente."),
        confirmButtonColor: "#0076e3"
      });
    } finally {
      setProcesando(false);
    }
  };
  if (!estaCerrado || !["usuario", "tecnico"].includes(rolNormalizado)) return null;
  return <section className="ticket-reopen-panel rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <p className="font-medium text-[#1e222b]">Reapertura del ticket</p>
                    {cargando ? <p className="mt-1 text-sm text-slate-500">Consultando solicitudes...</p> : pendiente ? <p className="mt-1 text-sm text-amber-700">
                            {rolNormalizado === "tecnico" ? "El usuario solicita que este caso sea abierto nuevamente." : "Tu solicitud está pendiente de respuesta del técnico."}
                        </p> : <p className="mt-1 text-sm text-slate-500">
                            {rolNormalizado === "tecnico" ? "Puedes reabrir el caso si necesita atención adicional." : "Si la solución no fue suficiente, solicita continuar el caso."}
                        </p>}
                </div>

                {!cargando && rolNormalizado === "usuario" && !pendiente && !formularioVisible && <button type="button" onClick={() => {
        setFormularioVisible(true);
        setMensajeFormulario(null);
      }} disabled={procesando} className="shrink-0 rounded-xl bg-[#0076e3] px-5 py-2.5 font-medium text-white transition hover:bg-[#0065c2] disabled:cursor-not-allowed disabled:opacity-60">
                        Solicitar reapertura
                    </button>}

                {!cargando && mostrarAccionTecnico && rolNormalizado === "tecnico" && !pendiente && <button type="button" onClick={reabrir} disabled={procesando} className="shrink-0 rounded-xl bg-[#00a87f] px-5 py-2.5 font-medium text-white transition hover:bg-[#008f6c] disabled:cursor-not-allowed disabled:opacity-60">
                        Reabrir ticket
                    </button>}
            </div>

            {formularioVisible && rolNormalizado === "usuario" && !pendiente && <form onSubmit={solicitar} className="mt-4 rounded-xl border border-blue-200 bg-white p-4">
                    <label htmlFor={`motivo-reapertura-${ticketId}`} className="block text-sm font-medium text-[#1e222b]">
                        Motivo de la solicitud
                    </label>
                    <p className="mt-1 text-xs text-slate-500">
                        Explica qué quedó pendiente o por qué la solución no fue suficiente.
                    </p>
                    <textarea id={`motivo-reapertura-${ticketId}`} value={motivo} onChange={event => {
        setMotivo(event.target.value);
        if (mensajeFormulario?.tipo === "error") setMensajeFormulario(null);
      }} maxLength={1000} rows={4} autoFocus placeholder="Escribe aquí el motivo de la reapertura..." className="mt-3 w-full resize-y rounded-xl border border-slate-300 p-3 text-sm outline-none transition focus:border-[#0076e3] focus:ring-2 focus:ring-blue-100" />
                    <div className="mt-1 text-right text-xs text-slate-400">{motivo.length}/1000</div>
                    <div className="mt-3 flex flex-wrap justify-end gap-3">
                        <button type="button" onClick={() => {
          setFormularioVisible(false);
          setMotivo("");
          setMensajeFormulario(null);
        }} disabled={procesando} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60">
                            Cancelar
                        </button>
                        <button type="submit" disabled={procesando || motivo.trim().length < 10} className="rounded-lg bg-[#0076e3] px-4 py-2 text-sm font-medium text-white hover:bg-[#0065c2] disabled:cursor-not-allowed disabled:opacity-50">
                            {procesando ? "Enviando..." : "Enviar solicitud"}
                        </button>
                    </div>
                </form>}

            {mensajeFormulario && <p role="status" className={`mt-3 rounded-lg px-3 py-2 text-sm ${mensajeFormulario.tipo === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {mensajeFormulario.texto}
                </p>}

            {pendiente && rolNormalizado === "tecnico" && <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Motivo del usuario</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{solicitud.motivo}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <button type="button" onClick={reabrir} disabled={procesando} className="rounded-lg bg-[#00a87f] px-4 py-2 text-sm font-medium text-white hover:bg-[#008f6c] disabled:opacity-60">
                            Aceptar y reabrir
                        </button>
                        <button type="button" onClick={rechazar} disabled={procesando} className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60">
                            Rechazar
                        </button>
                    </div>
                </div>}

            {!pendiente && solicitud?.estado === "RECHAZADA" && rolNormalizado === "usuario" && <p className="mt-3 text-xs text-red-600">
                    La solicitud anterior fue rechazada. Puedes enviar una nueva si cuentas con más información.
                </p>}
        </section>;
}
