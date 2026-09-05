import supabase from "../../../config/supabaseClient.js";
import { enteroPositivo } from "../../../utils/validation.js";
const archivarProcedimiento = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Procedimiento no válido." });
    const { data: procedimiento } = await supabase.from("procedimientos").select("id,autor_id").eq("id", id).eq("activo", true).maybeSingle();
    if (!procedimiento) {
      return res.status(404).json({ success: false, message: "El procedimiento no existe." });
    }
    if (req.usuario?.rol !== "Administrador" && Number(procedimiento.autor_id) !== Number(req.usuario?.id)) {
      return res.status(403).json({ success: false, message: "Solo el autor puede archivar este procedimiento." });
    }
    await supabase.from("procedimientos").update({ estado: "ARCHIVADO", fecha_actualizacion: new Date().toISOString() }).eq("id", id);
    res.status(200).json({ success: true, message: "Procedimiento archivado correctamente." });
  } catch (error) {
    console.error("Error archivando procedimiento:", error);
    res.status(500).json({ success: false, message: "Ocurrió un error al archivar el procedimiento." });
  }
};
export { archivarProcedimiento };
