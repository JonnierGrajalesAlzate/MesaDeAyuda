import { origenPermitido } from "../config/security.js";
const loginAttempts = new Map();
const apiRequests = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ACCOUNT_ATTEMPTS = 5;
const LOGIN_MAX_IP_ATTEMPTS = 25;
const API_WINDOW_MS = 5 * 60 * 1000;
const API_MAX_REQUESTS = 600;
const MAX_KEYS = 10_000;
function prune(store, now, windowMs) {
  for (const [key, entry] of store) {
    if (now - entry.startedAt >= windowMs) store.delete(key);
  }
  while (store.size >= MAX_KEYS) store.delete(store.keys().next().value);
}
function getEntry(store, key, now, windowMs) {
  const current = store.get(key);
  if (!current || now - current.startedAt >= windowMs) {
    const fresh = {
      count: 0,
      startedAt: now
    };
    store.set(key, fresh);
    return fresh;
  }
  return current;
}
function clientIp(req) {
  return String(req.ip || req.socket?.remoteAddress || "unknown").slice(0, 100);
}
export function limitarLogin(req, res, next) {
  const now = Date.now();
  prune(loginAttempts, now, LOGIN_WINDOW_MS);
  const email = typeof req.body?.correo === "string" ? req.body.correo.trim().toLowerCase().slice(0, 254) : "";
  const keys = [`ip:${clientIp(req)}`];
  if (email) keys.push(`account:${email}`);
  const entries = keys.map(key => [key, getEntry(loginAttempts, key, now, LOGIN_WINDOW_MS), key.startsWith("account:") ? LOGIN_MAX_ACCOUNT_ATTEMPTS : LOGIN_MAX_IP_ATTEMPTS]);
  const blocked = entries.find(([, entry, limit]) => entry.count >= limit);
  const effectiveLimit = email ? LOGIN_MAX_ACCOUNT_ATTEMPTS : LOGIN_MAX_IP_ATTEMPTS;
  res.setHeader("RateLimit-Limit", effectiveLimit);
  res.setHeader("RateLimit-Remaining", Math.max(0, Math.min(...entries.map(([, entry, limit]) => limit - entry.count))));
  if (blocked) {
    const retryAfter = Math.max(1, Math.ceil((LOGIN_WINDOW_MS - (now - blocked[1].startedAt)) / 1000));
    res.setHeader("Retry-After", retryAfter);
    return res.status(429).json({
      message: "Demasiados intentos. Intenta nuevamente más tarde"
    });
  }
  res.once("finish", () => {
    if (res.statusCode === 401) {
      for (const [, entry] of entries) entry.count += 1;
    } else if (res.statusCode >= 200 && res.statusCode < 300) {
      // Un acceso correcto rehabilita la cuenta, pero no borra los fallos
      // acumulados por la IP (un atacante no puede reiniciar su límite).
      for (const [key] of entries) {
        if (key.startsWith("account:")) loginAttempts.delete(key);
      }
    }
  });
  return next();
}
export function limitarApi(req, res, next) {
  const now = Date.now();
  prune(apiRequests, now, API_WINDOW_MS);
  const entry = getEntry(apiRequests, clientIp(req), now, API_WINDOW_MS);
  entry.count += 1;
  res.setHeader("RateLimit-Limit", API_MAX_REQUESTS);
  res.setHeader("RateLimit-Remaining", Math.max(0, API_MAX_REQUESTS - entry.count));
  if (entry.count > API_MAX_REQUESTS) {
    res.setHeader("Retry-After", Math.max(1, Math.ceil((API_WINDOW_MS - (now - entry.startedAt)) / 1000)));
    return res.status(429).json({
      message: "Demasiadas solicitudes. Intenta nuevamente más tarde"
    });
  }
  return next();
}
export function cabecerasSeguras(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  res.setHeader("Content-Security-Policy", "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  // El frontend vive en un dominio distinto (Vercel) al backend (Render), así que "same-site"
  // haría que el navegador descarte la respuesta aunque el CORS ya la haya autorizado.
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cache-Control", "no-store");
  if (process.env.NODE_ENV === "production" && req.secure) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
}
export function validarOrigen(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  // El frontend y el backend viven en dominios distintos (Vercel/Render), así que el navegador
  // siempre marca estas peticiones como Sec-Fetch-Site: cross-site. La lista blanca de
  // FRONTEND_URLS (origenPermitido) es la que realmente controla qué orígenes pueden entrar.
  if (!origenPermitido(req.headers.origin)) {
    return res.status(403).json({
      message: "Origen no permitido"
    });
  }
  return next();
}
export function rutaNoEncontrada(req, res) {
  return res.status(404).json({
    message: "Recurso no encontrado"
  });
}
export function manejarError(error, req, res, _next) {
  console.error("Error no controlado:", error?.message || error);
  if (res.headersSent) return;
  return res.status(500).json({
    message: "Ocurrió un error interno"
  });
}
