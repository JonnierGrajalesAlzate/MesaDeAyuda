import supabase from "../../../config/supabaseClient.js";
import { enteroPositivo, texto } from "../../../utils/validation.js";
export async function listarAreas(_req, res) {
  try {
    const { data, error } = await supabase
      .from("areas")
      .select("id,nombre")
      .order("nombre");
    if (error) throw error;
    return res.json({
      success: true,
      areas: data
    });
  } catch (error) {
    console.error("Error cargando áreas:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error cargando áreas"
    });
  }
}
export async function listarUsuariosArea(req, res) {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Área no válida" });

    const [areaResult, usuariosResult] = await Promise.all([
      supabase.from("areas").select("id,nombre").eq("id", id).maybeSingle(),
      supabase
        .from("usuarios")
        .select("id,nombre,apellido,cargo,correo,rol_id,roles(nombre)")
        .eq("area_id", id)
        .order("nombre")
        .order("apellido")
    ]);
    if (areaResult.error) throw areaResult.error;
    if (usuariosResult.error) throw usuariosResult.error;
    if (!areaResult.data) return res.status(404).json({ success: false, message: "Área no encontrada" });

    const usuarios = usuariosResult.data.map(({ roles, ...usuario }) => ({
      ...usuario,
      rol: roles?.nombre ?? null
    }));

    return res.json({
      success: true,
      area: areaResult.data,
      usuarios,
      total: usuarios.length
    });
  } catch (error) {
    console.error("Error cargando usuarios del área:", error.message);
    return res.status(500).json({ success: false, message: "Error cargando los usuarios del área" });
  }
}
export async function crearArea(req, res) {
  try {
    const nombre = texto(req.body?.nombre, {
      max: 100
    });
    if (!nombre) return res.status(400).json({
      success: false,
      message: "El nombre no es válido"
    });
    const { data, error } = await supabase
      .from("areas")
      .insert({ nombre })
      .select("id,nombre")
      .single();
    if (error) {
      if (error.code === "23505") return res.status(409).json({
        success: false,
        message: "El área ya existe"
      });
      throw error;
    }
    return res.status(201).json({
      success: true,
      area: data,
      message: "Área creada correctamente"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creando área"
    });
  }
}
export async function actualizarArea(req, res) {
  try {
    const id = enteroPositivo(req.params.id);
    const nombre = texto(req.body?.nombre, {
      max: 100
    });
    if (!id || !nombre) return res.status(400).json({
      success: false,
      message: "Los datos del área no son válidos"
    });
    const { data, error } = await supabase
      .from("areas")
      .update({ nombre })
      .eq("id", id)
      .select("id,nombre")
      .maybeSingle();
    if (error) {
      if (error.code === "23505") return res.status(409).json({
        success: false,
        message: "El área ya existe"
      });
      throw error;
    }
    if (!data) return res.status(404).json({
      success: false,
      message: "Área no encontrada"
    });
    return res.json({
      success: true,
      area: data,
      message: "Área actualizada correctamente"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error actualizando área"
    });
  }
}
export async function eliminarArea(req, res) {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({
      success: false,
      message: "Área no válida"
    });
    const { data, error } = await supabase
      .from("areas")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) {
      if (error.code === "23503") return res.status(409).json({
        success: false,
        message: "No puedes eliminar un área que tiene usuarios relacionados"
      });
      throw error;
    }
    if (!data) return res.status(404).json({
      success: false,
      message: "Área no encontrada"
    });
    return res.json({
      success: true,
      message: "Área eliminada correctamente"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error eliminando área"
    });
  }
}
