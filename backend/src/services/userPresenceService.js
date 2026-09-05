import { obtenerIO } from "../sockets/socket.js";

export function usuarioEstaEnLinea(usuarioId) {
  const io = obtenerIO();
  const id = Number(usuarioId);
  if (!io || !Number.isSafeInteger(id) || id < 1) return false;
  return Boolean(io.sockets.adapter.rooms.get(`usuario:${id}`)?.size);
}

export function desconectarConexionesUsuario(usuarioId) {
  const io = obtenerIO();
  const id = Number(usuarioId);
  if (!io || !Number.isSafeInteger(id) || id < 1) return false;
  io.in(`usuario:${id}`).disconnectSockets(true);
  return true;
}
