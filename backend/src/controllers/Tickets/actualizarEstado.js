import supabase from "../../config/supabaseClient.js";
import { crearNotificacion } from "../../services/notificacionesService.js";
import { emitirActividad } from "../../services/realtimeService.js";
import { estadoDesdeMensaje } from "../../utils/rpcStatus.js";
import { enteroPositivo } from "../../utils/validation.js";

export const actualizarEstadoTicket = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    const estado_id = enteroPositivo(req.body?.estado_id);
    if (!id || ![1, 2, 3, 4, 5].includes(estado_id)) {
      return res.status(400).json({ success: false, message: "Ticket o estado no válido" });
    }

    const { data: resultado, error } = await supabase.rpc("fn_actualizar_estado_ticket", {
      p_ticket_id: id,
      p_estado_id: estado_id,
      p_actor_id: req.usuario.id,
      p_actor_rol: req.usuario.rol
    });
    if (error) throw error;
    if (!resultado.success) {
      return res.status(estadoDesdeMensaje(resultado.message)).json({ success: false, message: resultado.message });
    }

    const ticket = resultado.ticket;
    const { data: actor } = await supabase.from("usuarios").select("nombre,apellido").eq("id", req.usuario.id).maybeSingle();
    const actorName = actor ? `${actor.nombre} ${actor.apellido}` : (req.usuario.rol === "Administrador" ? "El administrador" : "El técnico");
    const textos = {
      1: [`${actorName} abrió tu ticket #${id}`, "Ya puedes seguir la atención."],
      2: [`${actorName} cerró tu ticket #${id}`, "Si necesitas reabrirlo, puedes solicitarlo."],
      3: [`${actorName} comenzó a trabajar en tu ticket #${id}`, "Pronto recibirás una actualización."],
      4: [`${actorName} puso en espera tu ticket #${id}`, "En breve continuará la atención."],
      5: [`${actorName} reabrió tu ticket #${id}`, "Ya puedes enviar mensajes nuevamente."]
    };
    const [tituloNotificacion, mensaje] = textos[Number(estado_id)] || [`Hubo actividad en tu ticket #${id}`, "Revisa los detalles."];
    if (Number(ticket.usuario_id) !== req.usuario.id) {
      crearNotificacion({
        usuarioId: Number(ticket.usuario_id),
        tipo: "ESTADO_TICKET",
        titulo: tituloNotificacion,
        mensaje,
        enlace: `/tickets/${id}`
      }).catch(err => console.error("Error notificando estado:", err));
    }
    emitirActividad({
      recurso: "tickets",
      accion: "actualizar-estado",
      entidadId: id,
      ticketId: id,
      usuarios: [ticket.usuario_id, ticket.tecnico_id],
      roles: ["Administrador"]
    });
    if (resultado.solicitud_reapertura_aceptada) {
      emitirActividad({
        recurso: "solicitudes-reapertura",
        accion: "aceptar",
        entidadId: resultado.solicitud_reapertura_aceptada,
        ticketId: id,
        usuarios: [ticket.usuario_id, ticket.tecnico_id],
        roles: ["Administrador"]
      });
    }
    return res.status(200).json({ success: true, message: "Estado actualizado correctamente." });
  } catch (error) {
    console.error("Error actualizando estado del ticket:", error.message);
    return res.status(500).json({ success: false, message: "No se pudo actualizar el estado del ticket" });
  }
};
