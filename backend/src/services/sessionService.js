import { randomUUID } from "crypto";
import { SESSION_ABSOLUTE_TIMEOUT_MS, SESSION_IDLE_TIMEOUT_MS } from "../config/security.js";
const sesiones = new Map();
const MAX_SESIONES = 10_000;
function limpiarSesiones(now = Date.now()) {
  for (const [jti, session] of sesiones) {
    if (session.expiresAt <= now || now - session.lastActivity > SESSION_IDLE_TIMEOUT_MS) {
      sesiones.delete(jti);
    }
  }
  while (sesiones.size >= MAX_SESIONES) {
    const oldest = sesiones.keys().next().value;
    if (!oldest) break;
    sesiones.delete(oldest);
  }
}
export function crearSesion(usuarioId, rol) {
  limpiarSesiones();
  const now = Date.now();
  const session = {
    jti: randomUUID(),
    usuarioId: Number(usuarioId),
    rol,
    createdAt: now,
    lastActivity: now,
    expiresAt: now + SESSION_ABSOLUTE_TIMEOUT_MS
  };
  sesiones.set(session.jti, session);
  return {
    ...session
  };
}
export function validarSesion({
  jti,
  usuarioId,
  rol
}, {
  touch = true
} = {}) {
  const session = sesiones.get(jti);
  const now = Date.now();
  if (!session || session.usuarioId !== Number(usuarioId) || session.rol !== rol || session.expiresAt <= now || now - session.lastActivity > SESSION_IDLE_TIMEOUT_MS) {
    if (jti) sesiones.delete(jti);
    return false;
  }
  if (touch && now - session.lastActivity >= 30_000) {
    session.lastActivity = now;
  }
  return true;
}
export function revocarSesion(jti) {
  if (jti) sesiones.delete(jti);
}
export function revocarSesionesUsuario(usuarioId) {
  const id = Number(usuarioId);
  for (const [jti, session] of sesiones) {
    if (session.usuarioId === id) sesiones.delete(jti);
  }
}
export function limpiarSesionesParaPruebas() {
  sesiones.clear();
}
