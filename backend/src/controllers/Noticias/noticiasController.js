import supabase from "../../config/supabaseClient.js";
import { notificarRol } from "../../services/notificacionesService.js";
import { esAdministrador } from "../../services/accessControl.js";
import { enteroPositivo, texto } from "../../utils/validation.js";

const NOTICIA_SELECT = `
  id, titulo, descripcion, usuario_id, fecha_creacion, fecha_modificacion, modificado_por_id,
  estado_noticia!inner(id, nombre, color_estado),
  etiquetas(id, nombre, color),
  usuario:usuarios!usuario_id(nombre, apellido),
  modificador:usuarios!modificado_por_id(nombre, apellido)
`;

function aplanarNoticia(fila) {
  const { estado_noticia, etiquetas, usuario, modificador, ...resto } = fila;
  return {
    ...resto,
    estado_id: estado_noticia?.id ?? null,
    estado: estado_noticia?.nombre ?? null,
    estado_color: estado_noticia?.color_estado ?? null,
    etiqueta_id: etiquetas?.id ?? null,
    etiqueta: etiquetas?.nombre ?? null,
    color: etiquetas?.color ?? null,
    nombre: usuario?.nombre ?? null,
    apellido: usuario?.apellido ?? null,
    modificado_por_nombre: modificador?.nombre ?? null,
    modificado_por_apellido: modificador?.apellido ?? null
  };
}

const buscarEstadoPorId = async id => {
  const { data } = await supabase.from("estado_noticia").select("id, nombre, color_estado").eq("id", id).maybeSingle();
  return data || null;
};

const buscarEstadoPorNombre = async nombre => {
  const { data } = await supabase.from("estado_noticia").select("id, nombre, color_estado").ilike("nombre", nombre);
  return data?.[0] || null;
};

export const obtenerNoticias = async (req, res) => {
  try {
    let query = supabase.from("noticias").select(NOTICIA_SELECT);
    if (req.usuario?.rol === "Usuario") query = query.eq("estado_noticia.nombre", "Publicada");
    query = query.order("fecha_creacion", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    const noticias = data.filter(fila => fila.estado_noticia).map(aplanarNoticia);
    return res.status(200).json({ success: true, noticias });
  } catch (error) {
    console.error("Error obteniendo noticias:", error.message);
    return res.status(500).json({ success: false, message: "Error al obtener las noticias." });
  }
};
export const obtenerNoticiaPorId = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Noticia no válida." });
    const { data, error } = await supabase.from("noticias").select(NOTICIA_SELECT).eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data || (req.usuario?.rol === "Usuario" && String(data.estado_noticia?.nombre).toLowerCase() !== "publicada")) {
      return res.status(404).json({ success: false, message: "La noticia no existe." });
    }
    return res.status(200).json({ success: true, noticia: aplanarNoticia(data) });
  } catch (error) {
    console.error("Error creando noticia:", error.message);
    return res.status(500).json({ success: false, message: "Error al obtener la noticia." });
  }
};
export const crearNoticia = async (req, res) => {
  try {
    const titulo = texto(req.body?.titulo, { max: 180 });
    const descripcion = texto(req.body?.descripcion, { max: 10_000 });
    const etiqueta_id = enteroPositivo(req.body?.etiqueta_id);
    const usuario_id = req.usuario.id;
    if (!titulo || !descripcion || !etiqueta_id || !usuario_id) {
      return res.status(400).json({ success: false, message: "Todos los campos obligatorios deben ser enviados." });
    }
    const estadoPublicada = await buscarEstadoPorNombre("Publicada");
    if (!estadoPublicada) {
      return res.status(409).json({ success: false, message: "El estado Publicada no está configurado." });
    }
    const { data: noticia, error } = await supabase
      .from("noticias")
      .insert({ titulo, descripcion, etiqueta_id, usuario_id, estado_id: estadoPublicada.id })
      .select()
      .single();
    if (error) throw error;
    const datosNotificacion = { tipo: "NUEVA_NOTICIA", titulo: "Nueva noticia de Soporte LG", mensaje: titulo };
    Promise.all([notificarRol("Usuario", {
      ...datosNotificacion,
      enlace: `/dashboard?noticia=${noticia.id}#noticias`
    }), notificarRol("Tecnico", {
      ...datosNotificacion,
      enlace: `/Noticias?noticia=${noticia.id}`
    }, req.usuario.id), notificarRol("Administrador", {
      ...datosNotificacion,
      enlace: `/Noticias?noticia=${noticia.id}`
    }, req.usuario.id)]).catch(error => console.error("Error notificando noticia:", error));
    return res.status(201).json({ success: true, message: "Noticia creada correctamente.", noticia });
  } catch (error) {
    console.error("Error actualizando noticia:", error.message);
    return res.status(500).json({ success: false, message: "Error al crear la noticia." });
  }
};
export const actualizarNoticia = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    const titulo = texto(req.body?.titulo, { max: 180 });
    const descripcion = texto(req.body?.descripcion, { max: 10_000 });
    const etiqueta_id = enteroPositivo(req.body?.etiqueta_id);
    const estado_id = enteroPositivo(req.body?.estado_id);
    if (!id || !titulo || !descripcion || !etiqueta_id || !estado_id) {
      return res.status(400).json({ success: false, message: "Los datos de la noticia no son válidos." });
    }
    const estado = await buscarEstadoPorId(estado_id);
    if (!estado) {
      return res.status(400).json({ success: false, message: "El estado de la noticia no es válido." });
    }
    const { data: actual } = await supabase.from("noticias").select("usuario_id").eq("id", id).maybeSingle();
    if (!actual) return res.status(404).json({ success: false, message: "La noticia no existe." });
    const { data, error } = await supabase
      .from("noticias")
      .update({ titulo, descripcion, etiqueta_id, estado_id: estado.id, modificado_por_id: req.usuario.id, fecha_modificacion: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: "La noticia no existe." });
    return res.status(200).json({ success: true, message: "Noticia actualizada correctamente.", noticia: data });
  } catch (error) {
    console.error("Error eliminando noticia:", error.message);
    return res.status(500).json({ success: false, message: "Error al actualizar la noticia." });
  }
};
export const eliminarNoticia = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Noticia no válida." });
    const { data: actual } = await supabase.from("noticias").select("usuario_id").eq("id", id).maybeSingle();
    if (!actual) return res.status(404).json({ success: false, message: "La noticia no existe." });
    if (!esAdministrador(req.usuario) && Number(actual.usuario_id) !== req.usuario.id) {
      return res.status(403).json({ success: false, message: "Solo el autor puede eliminar esta noticia." });
    }
    const estadoEliminada = await buscarEstadoPorNombre("Eliminada");
    if (!estadoEliminada) {
      return res.status(409).json({ success: false, message: "El estado Eliminada no está configurado." });
    }
    const { data, error } = await supabase
      .from("noticias")
      .update({ estado_id: estadoEliminada.id, modificado_por_id: req.usuario.id, fecha_modificacion: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: "La noticia no existe." });
    return res.status(200).json({ success: true, message: "Noticia enviada a eliminadas correctamente." });
  } catch (error) {
    console.error("Error obteniendo etiquetas:", error.message);
    return res.status(500).json({ success: false, message: "Error al eliminar la noticia." });
  }
};
export const cambiarEstadoNoticia = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    const estado_id = enteroPositivo(req.body?.estado_id);
    if (!id || !estado_id) {
      return res.status(400).json({ success: false, message: "El estado de la noticia no es válido." });
    }
    const estado = await buscarEstadoPorId(estado_id);
    if (!estado) {
      return res.status(400).json({ success: false, message: "El estado de la noticia no es válido." });
    }
    const { data: actual } = await supabase.from("noticias").select("usuario_id,estado_id").eq("id", id).maybeSingle();
    if (!actual) {
      return res.status(404).json({ success: false, message: "La noticia no existe." });
    }
    if (!esAdministrador(req.usuario) && Number(actual.usuario_id) !== req.usuario.id) {
      return res.status(403).json({ success: false, message: "Solo el autor puede cambiar el estado de esta noticia." });
    }
    if (Number(actual.estado_id) === estado.id) {
      return res.json({ success: true, message: `La noticia ya está ${estado.nombre.toLowerCase()}.` });
    }

    const { data: noticia, error } = await supabase
      .from("noticias")
      .update({ estado_id: estado.id, modificado_por_id: req.usuario.id, fecha_modificacion: new Date().toISOString() })
      .eq("id", id)
      .select("id,estado_id,fecha_modificacion,modificado_por_id")
      .single();
    if (error) throw error;

    return res.json({
      success: true,
      message: estado.nombre === "Publicada"
        ? "Noticia publicada correctamente."
        : estado.nombre === "Archivada"
          ? "Noticia archivada correctamente."
          : "Noticia enviada a eliminadas correctamente.",
      noticia
    });
  } catch (error) {
    console.error("Error cambiando estado de noticia:", error.message);
    return res.status(500).json({ success: false, message: "Error al cambiar el estado de la noticia." });
  }
};
export const eliminarNoticiaDefinitivamente = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Noticia no válida." });

    const { data: actual } = await supabase
      .from("noticias")
      .select("usuario_id,estado_noticia(nombre)")
      .eq("id", id)
      .maybeSingle();
    if (!actual) return res.status(404).json({ success: false, message: "La noticia no existe." });
    if (!esAdministrador(req.usuario) && Number(actual.usuario_id) !== req.usuario.id) {
      return res.status(403).json({ success: false, message: "Solo el autor puede eliminar definitivamente esta noticia." });
    }
    if (actual.estado_noticia?.nombre !== "Eliminada") {
      return res.status(409).json({ success: false, message: "La noticia debe estar en Eliminadas antes de borrarla definitivamente." });
    }

    const { error } = await supabase.from("noticias").delete().eq("id", id);
    if (error) {
      if (error.code === "23503") {
        return res.status(409).json({ success: false, message: "La noticia tiene registros relacionados y no puede eliminarse definitivamente." });
      }
      throw error;
    }
    return res.json({ success: true, message: "Noticia eliminada definitivamente." });
  } catch (error) {
    console.error("Error eliminando definitivamente la noticia:", error.message);
    return res.status(500).json({ success: false, message: "Error al eliminar definitivamente la noticia." });
  }
};
export const obtenerEtiquetas = async (req, res) => {
  try {
    const { data, error } = await supabase.from("etiquetas").select("id,nombre,color").order("nombre");
    if (error) throw error;
    return res.status(200).json({ success: true, etiquetas: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error al obtener las etiquetas." });
  }
};

export const obtenerEstadosNoticia = async (_req, res) => {
  try {
    const { data, error } = await supabase.from("estado_noticia").select("id, nombre, color_estado").order("id");
    if (error) throw error;
    return res.status(200).json({ success: true, estados: data });
  } catch (error) {
    console.error("Error obteniendo estados de noticia:", error.message);
    return res.status(500).json({ success: false, message: "Error al obtener los estados de noticia." });
  }
};
