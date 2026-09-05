import supabase from "../../config/supabaseClient.js";
import { crearNotificacion, notificarRol } from "../../services/notificacionesService.js";
import { puedeAccederTicket } from "../../services/accessControl.js";
import { emitirActividad } from "../../services/realtimeService.js";
import { enteroPositivo, texto } from "../../utils/validation.js";
import { usuarioActivoEnConversacion } from "../../services/conversationPresenceService.js";
export const crearComentario = async (req, res) => {
  try {
    const ticket_id = enteroPositivo(req.body?.ticket_id);
    const comentario = texto(req.body?.comentario, { max: 5_000 });
    if (!ticket_id || !comentario) {
      return res.status(400).json({ success: false, message: "El ticket y un comentario de hasta 5000 caracteres son obligatorios." });
    }
    const { data: ticket } = await supabase.from("tickets").select("id,titulo,usuario_id,tecnico_id,estado_id").eq("id", ticket_id).maybeSingle();
    if (!ticket) {
      return res.status(404).json({ success: false, message: "El ticket no existe." });
    }
    if (!puedeAccederTicket(req.usuario, ticket)) {
      return res.status(403).json({ success: false, message: "No tienes acceso a este ticket." });
    }
    if (![3, 5].includes(Number(ticket.estado_id))) {
      return res.status(409).json({ success: false, message: "No se pueden enviar mensajes en este momento." });
    }
    const { data: resultado, error } = await supabase
      .from("comentarios")
      .insert({ ticket_id, usuario_id: req.usuario.id, comentario })
      .select()
      .single();
    if (error) throw error;

    const destinatario = req.usuario.rol === "Usuario" ? ticket.tecnico_id : ticket.usuario_id;
    if (destinatario && Number(destinatario) !== req.usuario.id || req.usuario.rol === "Usuario") {
      const esUsuario = req.usuario.rol === "Usuario";
      const { data: actor } = await supabase.from("usuarios").select("nombre,apellido").eq("id", req.usuario.id).maybeSingle();
      const actorName = actor ? `${actor.nombre} ${actor.apellido}` : (esUsuario ? "El usuario" : "El técnico");
      if (destinatario && Number(destinatario) !== req.usuario.id) {
        if (!usuarioActivoEnConversacion(ticket_id, destinatario)) {
          crearNotificacion({
            usuarioId: Number(destinatario),
            tipo: "MENSAJE_TICKET",
            titulo: `${actorName} te envió un mensaje · Ticket #${ticket_id}`,
            mensaje: "Haz clic para verlo.",
            enlace: esUsuario ? `/tecnico?ticket=${ticket_id}` : `/tickets/${ticket_id}`
          }).catch(error => console.error("Error notificando comentario:", error));
        }
      } else if (esUsuario) {
        notificarRol("Tecnico", {
          tipo: "MENSAJE_TICKET",
          titulo: `${actorName} agregó información al ticket #${ticket_id}`,
          mensaje: "El ticket está en espera de asignación.",
          enlace: `/tecnico?ticket=${ticket_id}`
        }, req.usuario.id).catch(error => console.error("Error notificando comentario:", error));
      }
    }
    emitirActividad({
      recurso: "comentarios",
      accion: "crear",
      entidadId: resultado.id,
      ticketId: ticket_id,
      usuarios: [ticket.usuario_id, ticket.tecnico_id],
      roles: ticket.tecnico_id ? ["Administrador"] : ["Tecnico", "Administrador"]
    });
    return res.status(201).json({ success: true, message: "Comentario enviado correctamente.", comentario: resultado });
  } catch (error) {
    console.error("Error creando comentario:", error.message);
    return res.status(500).json({ success: false, message: "Error al crear el comentario." });
  }
};
