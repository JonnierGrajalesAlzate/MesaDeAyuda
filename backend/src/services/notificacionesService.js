import supabase from "../config/supabaseClient.js";
import { obtenerIO } from "../sockets/socket.js";

// La tabla notificaciones y preferencias_notificaciones ya existen en el
// esquema de Supabase (ver backend/database/schema.sql).
export async function asegurarNotificaciones() {}

function enlaceInterno(enlace) {
  if (enlace === null || enlace === undefined || enlace === "") return null;
  const value = String(enlace);
  return value.startsWith("/") && !value.startsWith("//") && value.length <= 300 ? value : null;
}
export async function crearNotificacion({ usuarioId, tipo, titulo, mensaje, enlace = null }) {
  const { data: preferencia } = await supabase
    .from("preferencias_notificaciones")
    .select("activas")
    .eq("usuario_id", usuarioId)
    .maybeSingle();
  if (preferencia && preferencia.activas === false) return null;

  const { data: notificacion, error } = await supabase
    .from("notificaciones")
    .insert({
      usuario_id: usuarioId,
      tipo,
      titulo,
      mensaje,
      enlace: enlaceInterno(enlace)
    })
    .select()
    .single();
  if (error) throw error;
  obtenerIO()?.to(`usuario:${Number(usuarioId)}`).emit("NOTIFICACION_NUEVA", notificacion);
  return notificacion;
}
export async function notificarRol(rol, datos, excluirUsuarioId = null) {
  let query = supabase.from("usuarios").select("id,roles!inner(nombre)").eq("roles.nombre", rol);
  if (excluirUsuarioId !== null && excluirUsuarioId !== undefined) query = query.neq("id", excluirUsuarioId);
  const { data: usuarios, error } = await query;
  if (error) throw error;
  return Promise.all((usuarios || []).map(({ id }) => crearNotificacion({ ...datos, usuarioId: id })));
}
export async function notificarTodos(datos, excluirUsuarioId = null) {
  let query = supabase.from("usuarios").select("id");
  if (excluirUsuarioId !== null && excluirUsuarioId !== undefined) query = query.neq("id", excluirUsuarioId);
  const { data: usuarios, error } = await query;
  if (error) throw error;
  return Promise.all((usuarios || []).map(({ id }) => crearNotificacion({ ...datos, usuarioId: id })));
}
