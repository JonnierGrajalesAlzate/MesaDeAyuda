import "dotenv/config";
export const COOKIE_NAME = "soportelg_session";
export const JWT_ISSUER = "soportelg-api";
export const JWT_AUDIENCE = "soportelg-web";
export const JWT_ALGORITHM = "HS256";
function boundedInteger(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) return fallback;
  return Math.min(Math.max(parsed, minimum), maximum);
}
export const SESSION_IDLE_TIMEOUT_MS = boundedInteger(process.env.SESSION_IDLE_MINUTES, 15, 5, 60) * 60 * 1000;
export const SESSION_ABSOLUTE_TIMEOUT_MS = boundedInteger(process.env.SESSION_MAX_HOURS, 8, 1, 24) * 60 * 60 * 1000;
export function obtenerJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET debe tener al menos 32 caracteres aleatorios");
  }
  return secret;
}
export function obtenerOrigenesPermitidos() {
  const configured = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "http://localhost:5173";
  const origins = configured.split(",").map(value => value.trim()).filter(Boolean).map(value => new URL(value).origin);
  return [...new Set(origins)];
}
export function origenPermitido(origin) {
  if (!origin) return false;
  try {
    return obtenerOrigenesPermitidos().includes(new URL(origin).origin);
  } catch {
    return false;
  }
}
export function opcionesCookieSesion() {
  const enProduccion = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: enProduccion,
    // En producción el frontend y el backend viven en dominios distintos (Vercel/Render, etc.),
    // por lo que la cookie necesita SameSite=None para viajar en esas peticiones cross-site.
    sameSite: enProduccion ? "none" : "strict",
    maxAge: SESSION_ABSOLUTE_TIMEOUT_MS,
    path: "/",
    priority: "high"
  };
}
export function opcionesBorrarCookieSesion() {
  const {
    maxAge: _maxAge,
    ...options
  } = opcionesCookieSesion();
  return options;
}
export function configuracionTrustProxy() {
  const hops = boundedInteger(process.env.TRUST_PROXY_HOPS, 0, 0, 10);
  return hops || false;
}
export function validarConfiguracionSeguridad() {
  obtenerJwtSecret();
  const origins = obtenerOrigenesPermitidos();
  if (process.env.NODE_ENV === "production" && origins.some(origin => !origin.startsWith("https://"))) {
    throw new Error("En producción FRONTEND_URLS solo puede contener orígenes HTTPS");
  }
}
