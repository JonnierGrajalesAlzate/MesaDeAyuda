import supabase from "../../../config/supabaseClient.js";
import { puedeVerProcedimiento } from "../../../services/accessControl.js";
import { enteroPositivo, texto } from "../../../utils/validation.js";
const crearNotaProcedimiento = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    const nota = texto(req.body.nota, { min: 1, max: 2000 });
    if (!id || !nota) {
      return res.status(400).json({ success: false, message: "La nota no puede estar vacía." });
    }
    const { data: procedimiento } = await supabase.from("procedimientos").select("id,autor_id,estado,activo").eq("id", id).maybeSingle();
    if (!procedimiento) {
      return res.status(404).json({ success: false, message: "Procedimiento no encontrado." });
    }
    if (!puedeVerProcedimiento(req.usuario, procedimiento)) {
      return res.status(403).json({ success: false, message: "No tienes acceso a este procedimiento." });
    }
    const { data: insertado, error } = await supabase
      .from("procedimiento_notas")
      .insert({ procedimiento_id: id, usuario_id: req.usuario.id, nota })
      .select("id,nota,fecha_creacion")
      .single();
    if (error) throw error;
    const { data: autor } = await supabase.from("usuarios").select("nombre,apellido").eq("id", req.usuario.id).maybeSingle();
    return res.status(201).json({
      success: true,
      nota: { ...insertado, autor: autor ? `${autor.nombre} ${autor.apellido}` : "" }
    });
  } catch (error) {
    console.error("Error creando nota de procedimiento:", error.message);
    return res.status(500).json({ success: false, message: "Error al guardar la nota." });
  }
};
export { crearNotaProcedimiento };
