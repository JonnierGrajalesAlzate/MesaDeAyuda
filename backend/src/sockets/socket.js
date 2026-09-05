let io;
export function inicializarSocket(socketServer) {
  io = socketServer;
}
export function obtenerIO() {
  return io;
}
