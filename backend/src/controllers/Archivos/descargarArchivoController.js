import path from "path";
import supabase from "../../config/supabaseClient.js";
import { obtenerOrigenesPermitidos } from "../../config/security.js";
import { puedeAccederTicket, puedeVerProcedimiento } from "../../services/accessControl.js";
import { byteaABuffer } from "../../utils/bytea.js";
import { enteroPositivo } from "../../utils/validation.js";
const INLINE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"]);
const EXTENSION_TYPES = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".gif", "image/gif"],
  [".webp", "image/webp"],
  [".pdf", "application/pdf"],
  [".txt", "text/plain"],
  [".doc", "application/msword"],
  [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  [".xls", "application/vnd.ms-excel"],
  [".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  [".zip", "application/zip"]
]);
function nombreRutaSeguro(value) {
  const filename = String(value || "");
  const valid = filename && filename.length <= 255 && path.basename(filename) === filename && !filename.startsWith(".");
  return valid ? filename : null;
}
function contentDisposition(type, originalName) {
  const disposition = INLINE_TYPES.has(type) ? "inline" : "attachment";
  const safeAscii = String(originalName || "archivo").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "archivo";
  return `${disposition}; filename="${safeAscii}"; filename*=UTF-8''${encodeURIComponent(String(originalName || safeAscii))}`;
}
function tipoArchivo(archivo, referenciaNombre) {
  return archivo.tipo || EXTENSION_TYPES.get(path.extname(referenciaNombre || "").toLowerCase()) || "application/octet-stream";
}
function permitirVisualizacionEnIframe(res) {
  // La cabecera global X-Frame-Options: DENY / frame-ancestors 'none' impide
  // previsualizar el PDF en el iframe propio del detalle de ticket. Aquí se
  // relaja solo para esta respuesta, restringiendo el framing a los orígenes
  // conocidos del frontend en vez de abrirlo a cualquier sitio.
  res.removeHeader("X-Frame-Options");
  const origenes = obtenerOrigenesPermitidos();
  res.setHeader("Content-Security-Policy", `frame-ancestors 'self' ${origenes.join(" ")}`);
}
function enviarArchivo(res, archivo, referenciaNombre) {
  const type = tipoArchivo(archivo, referenciaNombre);
  res.setHeader("Content-Type", type);
  res.setHeader("Content-Disposition", contentDisposition(type, archivo.nombre_original));
  res.setHeader("X-Content-Type-Options", "nosniff");
  permitirVisualizacionEnIframe(res);
  return res.send(byteaABuffer(archivo.contenido));
}
async function buscarArchivoPorNombre(filename) {
  const { data: ticket } = await supabase
    .from("archivos_adjuntos")
    .select("nombre_archivo,contenido,tipo,tickets(usuario_id,tecnico_id)")
    .eq("ruta_archivo", filename)
    .limit(1)
    .maybeSingle();
  if (ticket) {
    return {
      kind: "ticket",
      nombre_original: ticket.nombre_archivo,
      contenido: ticket.contenido,
      tipo: ticket.tipo,
      usuario_id: ticket.tickets?.usuario_id,
      tecnico_id: ticket.tickets?.tecnico_id
    };
  }
  const { data: procedimiento } = await supabase
    .from("procedimiento_archivos")
    .select("nombre_original,contenido,tipo,procedimientos(autor_id,estado,activo)")
    .eq("nombre", filename)
    .limit(1)
    .maybeSingle();
  if (!procedimiento) return null;
  return {
    kind: "procedimiento",
    nombre_original: procedimiento.nombre_original,
    contenido: procedimiento.contenido,
    tipo: procedimiento.tipo,
    autor_id: procedimiento.procedimientos?.autor_id,
    estado: procedimiento.procedimientos?.estado,
    activo: procedimiento.procedimientos?.activo
  };
}
export async function descargarArchivoTicket(req, res, next) {
  try {
    const ticketId = enteroPositivo(req.params.ticketId);
    if (!ticketId) return res.status(400).json({ message: "Ticket no válido" });
    const { data: archivo, error } = await supabase
      .from("archivos_adjuntos")
      .select("nombre_archivo,contenido,tipo,tickets(usuario_id,tecnico_id)")
      .eq("ticket_id", ticketId)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!archivo || !archivo.contenido) return res.status(404).json({ message: "Archivo no encontrado" });
    const acceso = { usuario_id: archivo.tickets?.usuario_id, tecnico_id: archivo.tickets?.tecnico_id };
    if (!puedeAccederTicket(req.usuario, acceso)) return res.status(403).json({ message: "No tienes acceso a este archivo" });
    return enviarArchivo(res, { nombre_original: archivo.nombre_archivo, contenido: archivo.contenido, tipo: archivo.tipo }, archivo.nombre_archivo);
  } catch (error) {
    return next(error);
  }
}
export async function descargarArchivo(req, res, next) {
  try {
    const filename = nombreRutaSeguro(req.params.filename);
    if (!filename) return res.status(400).json({ message: "Nombre de archivo inválido" });
    const archivo = await buscarArchivoPorNombre(filename);
    if (!archivo || !archivo.contenido) return res.status(404).json({ message: "Archivo no encontrado" });
    const allowed = archivo.kind === "ticket" ? puedeAccederTicket(req.usuario, archivo) : puedeVerProcedimiento(req.usuario, archivo);
    if (!allowed) return res.status(403).json({ message: "No tienes acceso a este archivo" });
    return enviarArchivo(res, archivo, filename);
  } catch (error) {
    return next(error);
  }
}
