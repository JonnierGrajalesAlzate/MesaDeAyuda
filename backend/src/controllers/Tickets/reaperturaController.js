import supabase from "../../config/supabaseClient.js";
import { puedeAccederTicket } from "../../services/accessControl.js";
import { crearNotificacion, notificarRol } from "../../services/notificacionesService.js";
import { emitirActividad } from "../../services/realtimeService.js";
import { estadoDesdeMensaje } from "../../utils/rpcStatus.js";
import { enteroPositivo, texto } from "../../utils/validation.js";

function emitirCambio(ticket, accion) {
  emitirActividad({
    recurso: "solicitudes-reapertura",
    accion,
    entidadId: ticket.id,
    ticketId: ticket.id,
    usuarios: [ticket.usuario_id, ticket.tecnico_id],
    roles: ["Administrador"]
  });
}

export async function obtenerSolicitudReapertura(req, res) {
  try {
    const ticketId = enteroPositivo(req.params.id);
    if (!ticketId) return res.status(400).json({ success: false, message: "Ticket no válido" });
    const { data: ticket, error: errorTicket } = await supabase
      .from("tickets")
      .select("id,usuario_id,tecnico_id,estado_id")
      .eq("id", ticketId)
      .maybeSingle();
    if (errorTicket) throw errorTicket;
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket no encontrado" });
    if (!puedeAccederTicket(req.usuario, ticket)) {
      return res.status(403).json({ success: false, message: "No tienes acceso a este ticket" });
    }
    const { data: solicitudes, error } = await supabase
      .from("solicitudes_reapertura")
      .select("id,ticket_id,motivo,estado,fecha_solicitud,fecha_respuesta,solicitante:usuarios!solicitante_id(nombre,apellido),respondido:usuarios!respondido_por_id(nombre,apellido)")
      .eq("ticket_id", ticketId)
      .order("fecha_solicitud", { ascending: false })
      .limit(1);
    if (error) throw error;
    const fila = solicitudes?.[0] || null;
    const solicitud = fila ? {
      id: fila.id, ticket_id: fila.ticket_id, motivo: fila.motivo, estado: fila.estado,
      fecha_solicitud: fila.fecha_solicitud, fecha_respuesta: fila.fecha_respuesta,
      solicitante: fila.solicitante ? `${fila.solicitante.nombre} ${fila.solicitante.apellido}` : null,
      respondido_por: fila.respondido ? `${fila.respondido.nombre} ${fila.respondido.apellido}` : null
    } : null;
    return res.json({ success: true, solicitud });
  } catch (error) {
    console.error("Error consultando solicitud de reapertura:", error.message);
    return res.status(500).json({ success: false, message: "No se pudo consultar la solicitud" });
  }
}

export async function crearSolicitudReapertura(req, res) {
  try {
    const ticketId = enteroPositivo(req.params.id);
    const motivo = texto(req.body?.motivo, { max: 1_000 });
    if (!ticketId || !motivo || motivo.length < 10) {
      return res.status(400).json({ success: false, message: "Explica el motivo de la reapertura con al menos 10 caracteres" });
    }
    const { data: resultado, error } = await supabase.rpc("fn_crear_solicitud_reapertura", {
      p_ticket_id: ticketId,
      p_solicitante_id: req.usuario.id,
      p_motivo: motivo
    });
    if (error) throw error;
    if (!resultado.success) {
      return res.status(estadoDesdeMensaje(resultado.message)).json({ success: false, message: resultado.message });
    }

    const ticket = resultado.ticket;
    const { data: actor } = await supabase.from("usuarios").select("nombre,apellido").eq("id", req.usuario.id).maybeSingle();
    const actorName = actor ? `${actor.nombre} ${actor.apellido}` : "El usuario";
    const datosNotificacion = {
      tipo: "SOLICITUD_REAPERTURA",
      titulo: `${actorName} solicitó reabrir el ticket #${ticketId}`,
      mensaje: "Acepta o rechaza la solicitud.",
      enlace: `/tecnico?ticket=${ticketId}&reapertura=${resultado.solicitud.id}`
    };
    if (ticket.tecnico_id) {
      crearNotificacion({ ...datosNotificacion, usuarioId: Number(ticket.tecnico_id) }).catch(err => console.error("Error notificando solicitud de reapertura:", err));
    } else {
      notificarRol("Tecnico", datosNotificacion, req.usuario.id).catch(err => console.error("Error notificando solicitud de reapertura:", err));
    }
    emitirCambio(ticket, "solicitar");
    return res.status(201).json({ success: true, message: "Solicitud de reapertura enviada al técnico", solicitud: resultado.solicitud });
  } catch (error) {
    console.error("Error creando solicitud de reapertura:", error.message);
    return res.status(500).json({ success: false, message: "No se pudo enviar la solicitud" });
  }
}

export async function resolverSolicitudReapertura(req, res) {
  try {
    const ticketId = enteroPositivo(req.params.id);
    const solicitudId = enteroPositivo(req.params.solicitudId);
    const decision = String(req.body?.decision || "").trim().toUpperCase();
    if (!ticketId || !solicitudId || !["ACEPTAR", "RECHAZAR"].includes(decision)) {
      return res.status(400).json({ success: false, message: "Solicitud o decisión no válida" });
    }
    const { data: ticketPrevio } = await supabase.from("tickets").select("id,usuario_id,tecnico_id,estado_id").eq("id", ticketId).maybeSingle();
    if (!ticketPrevio) return res.status(404).json({ success: false, message: "Ticket no encontrado" });
    if (!puedeAccederTicket(req.usuario, ticketPrevio)) {
      return res.status(403).json({ success: false, message: "No tienes acceso a este ticket" });
    }

    const { data: resultado, error } = await supabase.rpc("fn_resolver_solicitud_reapertura", {
      p_ticket_id: ticketId,
      p_solicitud_id: solicitudId,
      p_actor_id: req.usuario.id,
      p_decision: decision
    });
    if (error) throw error;
    if (!resultado.success) {
      return res.status(estadoDesdeMensaje(resultado.message)).json({ success: false, message: resultado.message });
    }

    const aceptada = decision === "ACEPTAR";
    const ticket = resultado.ticket;
    const { data: actor } = await supabase.from("usuarios").select("nombre,apellido").eq("id", req.usuario.id).maybeSingle();
    const actorName = actor ? `${actor.nombre} ${actor.apellido}` : "El técnico";
    if (Number(ticket.usuario_id) !== req.usuario.id) {
      crearNotificacion({
        usuarioId: Number(ticket.usuario_id),
        tipo: aceptada ? "REAPERTURA_ACEPTADA" : "REAPERTURA_RECHAZADA",
        titulo: aceptada ? `${actorName} reabrió tu ticket #${ticketId}` : `${actorName} rechazó tu solicitud de reapertura · Ticket #${ticketId}`,
        mensaje: aceptada ? "Ya puedes enviar mensajes nuevamente." : "El ticket permanece cerrado.",
        enlace: `/tickets/${ticketId}`
      }).catch(err => console.error("Error notificando decisión de reapertura:", err));
    }
    emitirCambio(ticket, aceptada ? "aceptar" : "rechazar");
    if (aceptada) {
      emitirActividad({
        recurso: "tickets",
        accion: "reabrir",
        entidadId: ticketId,
        ticketId,
        usuarios: [ticket.usuario_id, ticket.tecnico_id],
        roles: ["Administrador"]
      });
    }
    return res.json({
      success: true,
      message: aceptada ? "Ticket reabierto correctamente" : "Solicitud rechazada",
      estado: resultado.estado
    });
  } catch (error) {
    console.error("Error resolviendo solicitud de reapertura:", error.message);
    return res.status(500).json({ success: false, message: "No se pudo responder la solicitud" });
  }
}
