import supabase from "../../../config/supabaseClient.js";
import { enteroPositivo, texto } from "../../../utils/validation.js";
const crearProcedimiento = async (req, res) => {
  try {
    const titulo = texto(req.body?.titulo, { max: 180 });
    const descripcion = texto(req.body?.descripcion, { max: 5_000 });
    const categoriaId = enteroPositivo(req.body?.categoria_id);
    if (!titulo || !descripcion || !categoriaId) {
      return res.status(400).json({ success: false, message: "Título, descripción y categoría son obligatorios." });
    }
    const { data: categoria } = await supabase.from("categorias").select("id").eq("id", categoriaId).maybeSingle();
    if (!categoria) {
      return res.status(404).json({ success: false, message: "La categoría seleccionada no existe." });
    }
    const { data, error } = await supabase
      .from("procedimientos")
      .insert({ titulo, descripcion, categoria_id: categoriaId, autor_id: req.usuario.id, estado: "BORRADOR", vistas: 0, fecha_publicacion: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return res.status(201).json({ success: true, message: "Procedimiento creado correctamente.", procedimiento: data });
  } catch (error) {
    console.error("Error creando procedimiento:", error.message);
    return res.status(500).json({ success: false, message: "Ocurrió un error al crear el procedimiento." });
  }
};
export { crearProcedimiento };
