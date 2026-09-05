import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import { leerCookies, verificarTokenSesion } from "./src/middleware/auth.js";
import { COOKIE_NAME, obtenerOrigenesPermitidos, origenPermitido, validarConfiguracionSeguridad } from "./src/config/security.js";
import { validarSesion } from "./src/services/sessionService.js";
import { inicializarSocket } from "./src/sockets/socket.js";
import { registrarPresenciaConversacion } from "./src/services/conversationPresenceService.js";
import { emitirActividad } from "./src/services/realtimeService.js";
validarConfiguracionSeguridad();
const port = Number(process.env.PORT) || 3000;
if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT no es válido");
}
const server = http.createServer(app);
server.requestTimeout = 30_000;
server.headersTimeout = 35_000;
server.keepAliveTimeout = 5_000;
server.maxHeadersCount = 100;
const io = new Server(server, {
  cors: {
    origin: obtenerOrigenesPermitidos(),
    methods: ["GET", "POST"],
    credentials: true
  },
  allowRequest(request, callback) {
    callback(null, origenPermitido(request.headers.origin));
  },
  maxHttpBufferSize: 100_000,
  pingTimeout: 20_000,
  pingInterval: 25_000
});
io.use((socket, next) => {
  try {
    const token = leerCookies(socket.handshake.headers.cookie)[COOKIE_NAME];
    const session = verificarTokenSesion(token);
    socket.usuario = session.usuario;
    socket.sesionJti = session.jti;
    return next();
  } catch {
    return next(new Error("No autorizado"));
  }
});
io.on("connection", socket => {
  socket.join("autenticados");
  socket.join(`usuario:${socket.usuario.id}`);
  socket.join(`rol:${socket.usuario.rol}`);
  if (["Tecnico", "Administrador"].includes(socket.usuario.rol)) socket.join("tecnico");
  registrarPresenciaConversacion(socket);
  emitirActividad({ recurso: "usuarios", accion: "presencia", roles: ["Administrador"] });
  const sessionCheck = setInterval(() => {
    const active = validarSesion({
      jti: socket.sesionJti,
      usuarioId: socket.usuario.id,
      rol: socket.usuario.rol
    }, {
      touch: false
    });
    if (!active) socket.disconnect(true);
  }, 60_000);
  sessionCheck.unref?.();
  socket.once("disconnect", () => {
    clearInterval(sessionCheck);
    emitirActividad({ recurso: "usuarios", accion: "presencia", roles: ["Administrador"] });
  });
});
inicializarSocket(io);
server.listen(port, () => {
  console.log(`Servidor ejecutándose en puerto ${port}`);
});
