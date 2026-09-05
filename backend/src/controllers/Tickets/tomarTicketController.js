import supabase from "../../config/supabaseClient.js";
import { crearNotificacion } from "../../services/notificacionesService.js";
import { emitirActividad } from "../../services/realtimeService.js";
import { enteroPositivo } from "../../utils/validation.js";
import { estadoDesdeMensaje } from "../../utils/rpcStatus.js";

export async function tomarTicket(req, res) {
  try {
    const ticketId = enteroPositivo(req.params.id);
    const responsableId = enteroPositivo(req.usuario?.id);
    if (!ticketId || !responsableId) {
      return res.status(400).json({ success: false, message: "Ticket o responsable no válido" });
    }

    const { data: resultado, error } = await supabase.rpc("fn_tomar_ticket", {
      p_ticket_id: ticketId,
      p_responsable_id: responsableId
    });
    if (error) throw error;
    if (!resultado.success) {
      return res.status(estadoDesdeMensaje(resultado.message)).json({ success: false, message: resultado.message });
    }

    if (Number(resultado.usuario_id) !== responsableId) {
      crearNotificacion({
        usuarioId: Number(resultado.usuario_id),
        tipo: "TICKET_ASIGNADO",
        titulo: `${resultado.responsable_nombre} tomó tu ticket #${ticketId}`,
        mensaje: "Ya puede atender tu solicitud.",
        enlace: `/tickets/${ticketId}`
      }).catch(err => console.error("Error notificando toma de ticket:", err));
    }

    emitirActividad({
      recurso: "tickets",
      accion: "tomar",
      entidadId: ticketId,
      ticketId,
      usuarios: [resultado.usuario_id, responsableId],
      roles: ["Tecnico", "Administrador"]
    });

    return res.json({ success: true, message: "Ticket asignado correctamente", ticket_id: ticketId });
  } catch (error) {
    console.error("Error tomando ticket:", error.message);
    return res.status(500).json({ success: false, message: "No se pudo tomar el ticket" });
  }
}
