import supabase from "../../config/supabaseClient.js";
import { puedeAccederTicket } from "../../services/accessControl.js";
import { crearNotificacion } from "../../services/notificacionesService.js";
import { emitirActividad } from "../../services/realtimeService.js";
import { estadoDesdeMensaje } from "../../utils/rpcStatus.js";
import { enteroPositivo } from "../../utils/validation.js";

function emitirCambio(ticket, accion, extraUsuarios = []) {
  emitirActividad({
    recurso: "solicitudes-reasignacion",
    accion,
    entidadId: ticket.id,
    ticketId: ticket.id,
    usuarios: [ticket.usuario_id, ticket.tecnico_id, ...extraUsuarios].filter(Boolean),
    roles: ["Administrador"]
  });
}

export async function obtenerSolicitudReasignacion(req, res) {
  try {
    const ticketId = enteroPositivo(req.params.id);
    if (!ticketId) return res.status(400).json({ success: false, message: "Ticket no válido" });
    const { data: ticket, error: errorTicket } = await supabase
      .from("tickets")
      .select("id,titulo,descripcion,usuario_id,tecnico_id,categoria_id,estado_id,categorias(nombre),prioridades(nombre)")
      .eq("id", ticketId)
      .maybeSingle();
    if (errorTicket) throw errorTicket;
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket no encontrado" });

    const { data: solicitudes, error: errorSolicitud } = await supabase
      .from("solicitudes_reasignacion")
      .select("id,ticket_id,estado,solicitante_id,tecnico_destino_id,fecha_solicitud,fecha_respuesta,solicitante:usuarios!solicitante_id(nombre,apellido),destino:usuarios!tecnico_destino_id(nombre,apellido)")
      .eq("ticket_id", ticketId)
      .order("fecha_solicitud", { ascending: false })
      .limit(1);
    if (errorSolicitud) throw errorSolicitud;
    const fila = solicitudes?.[0] || null;
    const solicitud = fila ? {
      id: fila.id, ticket_id: fila.ticket_id, estado: fila.estado,
      solicitante_id: fila.solicitante_id, tecnico_destino_id: fila.tecnico_destino_id,
      fecha_solicitud: fila.fecha_solicitud, fecha_respuesta: fila.fecha_respuesta,
      solicitante: fila.solicitante ? `${fila.solicitante.nombre} ${fila.solicitante.apellido}` : null,
      tecnico_destino: fila.destino ? `${fila.destino.nombre} ${fila.destino.apellido}` : null
    } : null;

    const ticketPlano = {
      ...ticket,
      categoria: ticket.categorias?.nombre ?? null,
      prioridad: ticket.prioridades?.nombre ?? null
    };
    delete ticketPlano.categorias;
    delete ticketPlano.prioridades;

    const esDestinatarioPendiente = solicitud
      && solicitud.estado === "PENDIENTE"
      && Number(solicitud.tecnico_destino_id) === Number(req.usuario?.id);
    if (!puedeAccederTicket(req.usuario, ticketPlano) && !esDestinatarioPendiente) {
      return res.status(403).json({ success: false, message: "No tienes acceso a este ticket" });
    }
    return res.json({ success: true, ticket: ticketPlano, solicitud });
  } catch (error) {
    console.error("Error consultando solicitud de reasignación:", error.message);
    return res.status(500).json({ success: false, message: "No se pudo consultar la solicitud" });
  }
}

export async function crearSolicitudReasignacion(req, res) {
  try {
    const ticketId = enteroPositivo(req.params.id);
    const tecnicoDestinoId = enteroPositivo(req.body?.tecnico_destino_id);
    if (!ticketId || !tecnicoDestinoId) {
      return res.status(400).json({ success: false, message: "Ticket o técnico destino no válido" });
    }
    const { data: resultado, error } = await supabase.rpc("fn_crear_solicitud_reasignacion", {
      p_ticket_id: ticketId,
      p_solicitante_id: req.usuario.id,
      p_tecnico_destino_id: tecnicoDestinoId
    });
    if (error) throw error;
    if (!resultado.success) {
      return res.status(estadoDesdeMensaje(resultado.message)).json({ success: false, message: resultado.message });
    }

    const basePathDestino = resultado.rol_destino === "Administrador" ? "/administrador" : "/tecnico";
    const { data: actor } = await supabase.from("usuarios").select("nombre,apellido").eq("id", req.usuario.id).maybeSingle();
    const actorName = actor ? `${actor.nombre} ${actor.apellido}` : "Un técnico";
    crearNotificacion({
      usuarioId: tecnicoDestinoId,
      tipo: "SOLICITUD_REASIGNACION",
      titulo: `${actorName} te solicitó recibir el ticket #${ticketId}`,
      mensaje: `${resultado.ticket.titulo}. Acepta o rechaza la solicitud.`,
      enlace: `${basePathDestino}/tickets/${ticketId}/solicitud-reasignacion`
    }).catch(err => console.error("Error notificando solicitud de reasignación:", err));
    emitirCambio(resultado.ticket, "solicitar", [tecnicoDestinoId]);
    return res.status(201).json({ success: true, message: "Solicitud de reasignación enviada", solicitud: resultado.solicitud });
  } catch (error) {
    console.error("Error creando solicitud de reasignación:", error.message);
    return res.status(500).json({ success: false, message: "No se pudo enviar la solicitud" });
  }
}

export async function resolverSolicitudReasignacion(req, res) {
  try {
    const ticketId = enteroPositivo(req.params.id);
    const solicitudId = enteroPositivo(req.params.solicitudId);
    const decision = String(req.body?.decision || "").trim().toUpperCase();
    if (!ticketId || !solicitudId || !["ACEPTAR", "RECHAZAR"].includes(decision)) {
      return res.status(400).json({ success: false, message: "Solicitud o decisión no válida" });
    }
    const { data: resultado, error } = await supabase.rpc("fn_resolver_solicitud_reasignacion", {
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
    crearNotificacion({
      usuarioId: Number(ticket.tecnico_id),
      tipo: aceptada ? "REASIGNACION_ACEPTADA" : "REASIGNACION_RECHAZADA",
      titulo: aceptada ? `${actorName} aceptó recibir el ticket #${ticketId}` : `${actorName} rechazó tu solicitud de reasignación · Ticket #${ticketId}`,
      mensaje: aceptada ? "El ticket ya quedó asignado a su cuenta." : "El ticket sigue asignado a tu cuenta.",
      enlace: `/tecnico/tickets/${ticketId}`
    }).catch(err => console.error("Error notificando decisión de reasignación:", err));
    emitirCambio(ticket, aceptada ? "aceptar" : "rechazar", [req.usuario.id]);
    return res.json({
      success: true,
      message: aceptada ? "Ticket reasignado correctamente" : "Solicitud rechazada",
      estado: resultado.estado
    });
  } catch (error) {
    console.error("Error resolviendo solicitud de reasignación:", error.message);
    return res.status(500).json({ success: false, message: "No se pudo responder la solicitud" });
  }
}
