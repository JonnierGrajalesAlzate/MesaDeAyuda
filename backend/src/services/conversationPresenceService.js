import supabase from "../config/supabaseClient.js";
import { puedeAccederTicket } from "./accessControl.js";
import { obtenerIO } from "../sockets/socket.js";
import { enteroPositivo } from "../utils/validation.js";
export const EVENTO_ENTRAR_CONVERSACION = "CONVERSACION_ENTRAR";
export const EVENTO_SALIR_CONVERSACION = "CONVERSACION_SALIR";
export function nombreSalaConversacion(ticketId, usuarioId) {
  const ticket = enteroPositivo(ticketId);
  const usuario = enteroPositivo(usuarioId);
  return ticket && usuario ? `conversacion:${ticket}:usuario:${usuario}` : null;
}
export function usuarioActivoEnConversacion(ticketId, usuarioId) {
  const sala = nombreSalaConversacion(ticketId, usuarioId);
  const adapter = obtenerIO()?.sockets?.adapter;
  return Boolean(sala && adapter?.rooms?.get(sala)?.size);
}
function abandonarConversaciones(socket) {
  for (const sala of socket.rooms) {
    if (sala.startsWith("conversacion:")) socket.leave(sala);
  }
}
export function registrarPresenciaConversacion(socket) {
  let verificando = false;
  socket.on(EVENTO_ENTRAR_CONVERSACION, async (payload = {}) => {
    if (verificando) return;
    const ticketId = enteroPositivo(payload.ticketId);
    if (!ticketId) return;
    verificando = true;
    try {
      const { data: ticket } = await supabase.from("tickets").select("id,usuario_id,tecnico_id").eq("id", ticketId).maybeSingle();
      if (!ticket || !puedeAccederTicket(socket.usuario, ticket)) return;
      abandonarConversaciones(socket);
      const sala = nombreSalaConversacion(ticketId, socket.usuario.id);
      if (sala) socket.join(sala);
    } catch (error) {
      console.error("No se pudo registrar la presencia en la conversación:", error.message);
    } finally {
      verificando = false;
    }
  });
  socket.on(EVENTO_SALIR_CONVERSACION, (payload = {}) => {
    const sala = nombreSalaConversacion(payload.ticketId, socket.usuario.id);
    if (sala) socket.leave(sala);
  });
}
