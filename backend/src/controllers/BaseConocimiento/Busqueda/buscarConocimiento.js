import supabase from "../../../config/supabaseClient.js";
import { enteroPositivo, texto } from "../../../utils/validation.js";
const buscarConocimiento = async (req, res) => {
  try {
    const buscar = texto(req.query.buscar, { max: 100 });
    const categoria_id = req.query.categoria_id ? enteroPositivo(req.query.categoria_id) : null;
    if (!buscar || req.query.categoria_id && !categoria_id) {
      return res.status(400).json({ success: false, message: "Debe ingresar un texto de búsqueda." });
    }
    let query = supabase
      .from("procedimientos")
      .select("id,titulo,descripcion,solucion,vistas,fecha_publicacion,categorias(nombre),usuarios(nombre,apellido)")
      .eq("estado", "PUBLICADO")
      .eq("activo", true)
      .or(`titulo.ilike.%${buscar}%,descripcion.ilike.%${buscar}%,solucion.ilike.%${buscar}%`);
    if (categoria_id) query = query.eq("categoria_id", categoria_id);
    query = query.order("vistas", { ascending: false }).order("fecha_publicacion", { ascending: false }).limit(100);
    const { data, error } = await query;
    if (error) throw error;
    const filas = data.map(({ categorias, usuarios, ...resto }) => ({
      ...resto,
      categoria: categorias?.nombre ?? null,
      autor: usuarios ? `${usuarios.nombre} ${usuarios.apellido}` : null
    }));
    res.status(200).json({ success: true, total: filas.length, procedimientos: filas });
  } catch (error) {
    console.error("Error buscando conocimiento:", error);
    res.status(500).json({ success: false, message: "Error al buscar en la base de conocimiento." });
  }
};
export { buscarConocimiento };
