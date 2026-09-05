import supabase from "../../../config/supabaseClient.js";
import { notificarRol } from "../../../services/notificacionesService.js";
import { enteroPositivo } from "../../../utils/validation.js";
const publicarProcedimiento = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Procedimiento no válido." });
    const { data: articulo } = await supabase.from("procedimientos").select("id,estado,titulo,autor_id").eq("id", id).eq("activo", true).maybeSingle();
    if (!articulo) {
      return res.status(404).json({ success: false, message: "El procedimiento no existe." });
    }
    if (req.usuario?.rol !== "Administrador" && Number(articulo.autor_id) !== Number(req.usuario?.id)) {
      return res.status(403).json({ success: false, message: "Solo el autor puede publicar este procedimiento." });
    }
    await supabase.from("procedimientos").update({
      estado: "PUBLICADO",
      fecha_publicacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString()
    }).eq("id", id);
    Promise.all([notificarRol("Tecnico", {
      tipo: "ARTICULO_PUBLICADO",
      titulo: "Nuevo artículo en la base de conocimiento",
      mensaje: articulo.titulo,
      enlace: `/BaseConocimiento?articulo=${id}`
    }, req.usuario.id), notificarRol("Administrador", {
      tipo: "ARTICULO_PUBLICADO",
      titulo: "Nuevo artículo en la base de conocimiento",
      mensaje: articulo.titulo,
      enlace: `/BaseConocimiento?articulo=${id}`
    }, req.usuario.id)]).catch(error => console.error("Error notificando artículo:", error));
    res.status(200).json({ success: true, message: "Procedimiento publicado correctamente." });
  } catch (error) {
    console.error("Error publicando procedimiento:", error);
    res.status(500).json({ success: false, message: "Ocurrió un error al publicar el procedimiento." });
  }
};
export { publicarProcedimiento };
