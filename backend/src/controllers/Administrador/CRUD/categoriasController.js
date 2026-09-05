import supabase from "../../../config/supabaseClient.js";
import { enteroPositivo, texto } from "../../../utils/validation.js";
export async function listarCategorias(_req, res) {
  try {
    const { data, error } = await supabase
      .from("categorias")
      .select("id,nombre,descripcion,prioridad_id")
      .order("nombre");
    if (error) throw error;
    return res.json({
      success: true,
      categorias: data
    });
  } catch (error) {
    console.error("Error cargando categorías:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error cargando categorías"
    });
  }
}
export async function crearCategoria(req, res) {
  try {
    const nombre = texto(req.body?.nombre, {
      max: 100
    });
    const descripcion = texto(req.body?.descripcion, {
      max: 300,
      optional: true
    });
    const prioridad_id = enteroPositivo(req.body?.prioridad_id);
    if (!nombre || descripcion === undefined || !prioridad_id) return res.status(400).json({
      success: false,
      message: "Los datos de la categoría no son válidos"
    });
    const { data, error } = await supabase
      .from("categorias")
      .insert({ nombre, descripcion, prioridad_id })
      .select("id,nombre,descripcion,prioridad_id")
      .single();
    if (error) {
      if (error.code === "23505") return res.status(409).json({
        success: false,
        message: "La categoría ya existe"
      });
      if (error.code === "23503") return res.status(400).json({
        success: false,
        message: "La prioridad seleccionada no es válida"
      });
      throw error;
    }
    return res.status(201).json({
      success: true,
      categoria: data,
      message: "Categoría creada correctamente"
    });
  } catch (error) {
    console.error("Error creando categoría:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error creando categoría"
    });
  }
}
export async function actualizarCategoria(req, res) {
  try {
    const id = enteroPositivo(req.params.id);
    const nombre = texto(req.body?.nombre, {
      max: 100
    });
    const descripcion = texto(req.body?.descripcion, {
      max: 300,
      optional: true
    });
    const prioridad_id = enteroPositivo(req.body?.prioridad_id);
    if (!id || !nombre || descripcion === undefined || !prioridad_id) return res.status(400).json({
      success: false,
      message: "Los datos de la categoría no son válidos"
    });
    const { data, error } = await supabase
      .from("categorias")
      .update({ nombre, descripcion, prioridad_id })
      .eq("id", id)
      .select("id,nombre,descripcion,prioridad_id")
      .maybeSingle();
    if (error) {
      if (error.code === "23503") return res.status(400).json({
        success: false,
        message: "La prioridad seleccionada no es válida"
      });
      if (error.code === "23505") return res.status(409).json({
        success: false,
        message: "La categoría ya existe"
      });
      throw error;
    }
    if (!data) return res.status(404).json({
      success: false,
      message: "Categoría no encontrada"
    });
    return res.json({
      success: true,
      categoria: data,
      message: "Categoría actualizada correctamente"
    });
  } catch (error) {
    console.error("Error actualizando categoría:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error actualizando categoría"
    });
  }
}
export async function eliminarCategoria(req, res) {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({
      success: false,
      message: "Categoría no válida"
    });
    const { data, error } = await supabase
      .from("categorias")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) {
      if (error.code === "23503") return res.status(409).json({
        success: false,
        message: "No puedes eliminar una categoría que tiene tickets, técnicos o procedimientos relacionados"
      });
      throw error;
    }
    if (!data) return res.status(404).json({
      success: false,
      message: "Categoría no encontrada"
    });
    return res.json({
      success: true,
      message: "Categoría eliminada correctamente"
    });
  } catch (error) {
    console.error("Error eliminando categoría:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error eliminando categoría"
    });
  }
}
