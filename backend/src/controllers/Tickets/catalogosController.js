import supabase from "../../config/supabaseClient.js";
import { enteroPositivo } from "../../utils/validation.js";
export const obtenerCategorias = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("categorias")
      .select("id,nombre,descripcion,prioridad_id")
      .order("nombre");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error obteniendo categorías"
    });
  }
};
export const obtenerPrioridades = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("prioridades")
      .select("id,nombre,color")
      .order("id");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error obteniendo prioridades"
    });
  }
};
export const obtenerSubcategorias = async (req, res) => {
  try {
    const categoriaId = enteroPositivo(req.query.categoria_id);
    if (!categoriaId) return res.status(400).json({
      message: "Categoría no válida"
    });
    const { data, error } = await supabase
      .from("subcategorias")
      .select("id,categoria_id,descripcion,prioridad_id")
      .eq("categoria_id", categoriaId)
      .order("descripcion");
    if (error) throw error;
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error obteniendo subcategorías"
    });
  }
};
export const obtenerEstados = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("estados")
      .select("id,nombre,color")
      .order("id");
    if (error) throw error;
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error obteniendo estados"
    });
  }
};
