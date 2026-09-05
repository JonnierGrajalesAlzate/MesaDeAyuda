import supabase from "../../../config/supabaseClient.js";
import { enteroPositivo, texto } from "../../../utils/validation.js";
export async function listarSubcategoriasPorCategoria(req, res) {
  try {
    const categoriaId = enteroPositivo(req.params.categoriaId);
    if (!categoriaId) return res.status(400).json({
      success: false,
      message: "Categoría no válida"
    });
    const { data, error } = await supabase
      .from("subcategorias")
      .select("id,categoria_id,descripcion,prioridad_id")
      .eq("categoria_id", categoriaId)
      .order("descripcion");
    if (error) throw error;
    return res.json({
      success: true,
      subcategorias: data
    });
  } catch (error) {
    console.error("Error cargando subcategorías:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error cargando subcategorías"
    });
  }
}
export async function crearSubcategoria(req, res) {
  try {
    const categoriaId = enteroPositivo(req.params.categoriaId);
    const descripcion = texto(req.body?.descripcion, {
      max: 300
    });
    const prioridad_id = enteroPositivo(req.body?.prioridad_id);
    if (!categoriaId || !descripcion || !prioridad_id) return res.status(400).json({
      success: false,
      message: "Los datos de la subcategoría no son válidos"
    });
    const { data, error } = await supabase
      .from("subcategorias")
      .insert({ categoria_id: categoriaId, descripcion, prioridad_id })
      .select("id,categoria_id,descripcion,prioridad_id")
      .single();
    if (error) {
      if (error.code === "23503") return res.status(400).json({
        success: false,
        message: "La categoría o la prioridad seleccionada no son válidas"
      });
      throw error;
    }
    return res.status(201).json({
      success: true,
      subcategoria: data,
      message: "Subcategoría creada correctamente"
    });
  } catch (error) {
    console.error("Error creando subcategoría:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error creando subcategoría"
    });
  }
}
export async function actualizarSubcategoria(req, res) {
  try {
    const id = enteroPositivo(req.params.id);
    const descripcion = texto(req.body?.descripcion, {
      max: 300
    });
    const prioridad_id = enteroPositivo(req.body?.prioridad_id);
    if (!id || !descripcion || !prioridad_id) return res.status(400).json({
      success: false,
      message: "Los datos de la subcategoría no son válidos"
    });
    const { data, error } = await supabase
      .from("subcategorias")
      .update({ descripcion, prioridad_id })
      .eq("id", id)
      .select("id,categoria_id,descripcion,prioridad_id")
      .maybeSingle();
    if (error) {
      if (error.code === "23503") return res.status(400).json({
        success: false,
        message: "La prioridad seleccionada no es válida"
      });
      throw error;
    }
    if (!data) return res.status(404).json({
      success: false,
      message: "Subcategoría no encontrada"
    });
    return res.json({
      success: true,
      subcategoria: data,
      message: "Subcategoría actualizada correctamente"
    });
  } catch (error) {
    console.error("Error actualizando subcategoría:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error actualizando subcategoría"
    });
  }
}
export async function eliminarSubcategoria(req, res) {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({
      success: false,
      message: "Subcategoría no válida"
    });
    const { data, error } = await supabase
      .from("subcategorias")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({
      success: false,
      message: "Subcategoría no encontrada"
    });
    return res.json({
      success: true,
      message: "Subcategoría eliminada correctamente"
    });
  } catch (error) {
    console.error("Error eliminando subcategoría:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error eliminando subcategoría"
    });
  }
}
