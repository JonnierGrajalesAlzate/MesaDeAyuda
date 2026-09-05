import supabase from "../../config/supabaseClient.js";
import { enteroPositivo } from "../../utils/validation.js";
export async function listarNotificaciones(req, res) {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Math.min(Math.max(Number.isSafeInteger(requestedLimit) ? requestedLimit : 30, 1), 100);
    const [{ data: items, error: e1 }, { count, error: e2 }, { data: preferencia, error: e3 }] = await Promise.all([
      supabase.from("notificaciones").select("id,tipo,titulo,mensaje,enlace,leida,fecha_creacion").eq("usuario_id", req.usuario.id).order("fecha_creacion", { ascending: false }).limit(limit),
      supabase.from("notificaciones").select("id", { count: "exact", head: true }).eq("usuario_id", req.usuario.id).eq("leida", false),
      supabase.from("preferencias_notificaciones").select("activas").eq("usuario_id", req.usuario.id).maybeSingle()
    ]);
    if (e1 || e2 || e3) throw e1 || e2 || e3;
    return res.json({
      success: true,
      notificaciones: items,
      no_leidas: count || 0,
      activas: preferencia ? preferencia.activas : true
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "No se pudieron cargar las notificaciones" });
  }
}
export async function marcarLeida(req, res) {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ message: "Notificación no válida" });
    const { data, error } = await supabase.from("notificaciones").update({ leida: true }).eq("id", id).eq("usuario_id", req.usuario.id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Notificación no encontrada" });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "No se pudo actualizar la notificación" });
  }
}
export async function marcarTodasLeidas(req, res) {
  try {
    await supabase.from("notificaciones").update({ leida: true }).eq("usuario_id", req.usuario.id).eq("leida", false);
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "No se pudieron actualizar las notificaciones" });
  }
}

export async function marcarNoLeida(req, res) {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Notificación no válida" });
    const { data, error } = await supabase.from("notificaciones").update({ leida: false }).eq("id", id).eq("usuario_id", req.usuario.id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: "Notificación no encontrada" });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "No se pudo actualizar la notificación" });
  }
}

export async function eliminarNotificacion(req, res) {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: "Notificación no válida" });
    }
    const { data, error } = await supabase.from("notificaciones").delete().eq("id", id).eq("usuario_id", req.usuario.id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, message: "Notificación no encontrada" });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "No se pudo eliminar la notificación" });
  }
}

export async function actualizarPreferenciasNotificaciones(req, res) {
  try {
    const activas = req.body?.activas;
    if (typeof activas !== "boolean") {
      return res.status(400).json({ success: false, message: "La preferencia de notificaciones no es válida" });
    }
    const { error } = await supabase
      .from("preferencias_notificaciones")
      .upsert({ usuario_id: req.usuario.id, activas, fecha_actualizacion: new Date().toISOString() }, { onConflict: "usuario_id" });
    if (error) throw error;
    return res.json({ success: true, activas });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "No se pudieron actualizar las preferencias" });
  }
}
