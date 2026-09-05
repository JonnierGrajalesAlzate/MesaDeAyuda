import { obtenerIO } from "../sockets/socket.js";
export const EVENTO_ACTIVIDAD = "ACTIVIDAD_ACTUALIZADA";
function idSeguro(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

/**
 * Emite solamente metadatos de invalidación. Los clientes deben volver a
 * consultar la API, donde se aplican los permisos y filtros de cada usuario.
 */
export function emitirActividad({
  recurso,
  accion,
  entidadId,
  ticketId,
  usuarios = [],
  roles = [],
  todos = false
}) {
  const io = obtenerIO();
  if (!io || typeof recurso !== "string" || typeof accion !== "string") return false;
  const payload = {
    recurso,
    accion,
    entidad_id: idSeguro(entidadId),
    ticket_id: idSeguro(ticketId),
    timestamp: Date.now()
  };
  if (todos) {
    io.to("autenticados").emit(EVENTO_ACTIVIDAD, payload);
    return true;
  }
  const rooms = new Set();
  for (const usuarioId of usuarios) {
    const id = idSeguro(usuarioId);
    if (id) rooms.add(`usuario:${id}`);
  }
  for (const rol of roles) {
    if (typeof rol === "string" && rol) rooms.add(`rol:${rol}`);
  }
  if (rooms.size) io.to([...rooms]).emit(EVENTO_ACTIVIDAD, payload);
  return rooms.size > 0;
}
