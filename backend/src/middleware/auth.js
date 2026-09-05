import jwt from "jsonwebtoken";
import supabase from "../config/supabaseClient.js";
import { COOKIE_NAME, JWT_ALGORITHM, JWT_AUDIENCE, JWT_ISSUER, obtenerJwtSecret, opcionesBorrarCookieSesion } from "../config/security.js";
import { revocarSesion, validarSesion } from "../services/sessionService.js";
export function leerCookies(header = "") {
  const cookies = Object.create(null);
  for (const item of String(header).split(";")) {
    const index = item.indexOf("=");
    if (index < 1) continue;
    const key = item.slice(0, index).trim();
    try {
      cookies[key] = decodeURIComponent(item.slice(index + 1));
    } catch {
      cookies[key] = "";
    }
  }
  return cookies;
}
export function verificarTokenSesion(token, {
  touch = true
} = {}) {
  if (!token) throw new Error("Token ausente");
  const payload = jwt.verify(token, obtenerJwtSecret(), {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithms: [JWT_ALGORITHM]
  });
  const id = Number(payload.sub);
  if (!Number.isSafeInteger(id) || id < 1 || typeof payload.rol !== "string" || !payload.jti) {
    throw new Error("Identidad inválida");
  }
  if (!validarSesion({
    jti: payload.jti,
    usuarioId: id,
    rol: payload.rol
  }, {
    touch
  })) {
    throw new Error("Sesión inactiva o revocada");
  }
  return {
    usuario: {
      id,
      rol: payload.rol
    },
    jti: payload.jti
  };
}
export async function autenticar(req, res, next) {
  try {
    const token = leerCookies(req.headers.cookie)[COOKIE_NAME];
    const session = verificarTokenSesion(token);
    req.usuario = session.usuario;
    req.sesion = {
      jti: session.jti
    };
    const { data } = await supabase.from("usuarios").select("estado").eq("id", session.usuario.id).maybeSingle();
    if (!data || data.estado === "Desactivado") {
      revocarSesion(session.jti);
      throw new Error("Cuenta desactivada o inexistente");
    }
    return next();
  } catch {
    res.clearCookie(COOKIE_NAME, opcionesBorrarCookieSesion());
    return res.status(401).json({
      message: "Sesión vencida, inactiva o inválida"
    });
  }
}
export function autorizarRoles(...roles) {
  const allowed = new Set(roles);
  return (req, res, next) => allowed.has(req.usuario?.rol) ? next() : res.status(403).json({
    message: "No tienes permiso para realizar esta acción"
  });
}
