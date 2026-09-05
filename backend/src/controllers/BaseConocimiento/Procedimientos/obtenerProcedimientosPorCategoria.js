import supabase from "../../../config/supabaseClient.js";
import { esAdministrador } from "../../../services/accessControl.js";
import { enteroPositivo } from "../../../utils/validation.js";
const obtenerProcedimientosPorCategoria = async (req, res) => {
  try {
    const categoriaId = enteroPositivo(req.params.categoriaId);
    if (!categoriaId) return res.status(400).json({ success: false, message: "Categoría no válida." });
    const admin = esAdministrador(req.usuario);
    let query = supabase
      .from("procedimientos")
      .select("id,titulo,estado,fecha_publicacion,autor_id,usuarios(nombre,apellido)")
      .eq("categoria_id", categoriaId)
      .eq("activo", true);
    if (!admin) query = query.or(`estado.eq.PUBLICADO,autor_id.eq.${req.usuario.id}`);
    query = query.order("fecha_publicacion", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    const filas = data.map(({ usuarios, ...resto }) => ({ ...resto, autor: usuarios ? `${usuarios.nombre} ${usuarios.apellido}` : null }));
    return res.status(200).json({ success: true, procedimientos: filas });
  } catch (error) {
    console.error("Error obteniendo procedimientos por categoría:", error.message);
    return res.status(500).json({ success: false, message: "Error obteniendo procedimientos." });
  }
};
export { obtenerProcedimientosPorCategoria };
