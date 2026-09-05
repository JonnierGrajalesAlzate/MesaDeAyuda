import supabase from "../../../config/supabaseClient.js";
import { enteroPositivo } from "../../../utils/validation.js";
const restaurarProcedimiento = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Procedimiento no válido." });
    const { data: existe } = await supabase.from("procedimientos").select("id,autor_id").eq("id", id).eq("activo", false).maybeSingle();
    if (!existe) {
      return res.status(404).json({ success: false, message: "El procedimiento no existe en la papelera." });
    }
    if (req.usuario?.rol !== "Administrador" && Number(existe.autor_id) !== Number(req.usuario?.id)) {
      return res.status(403).json({ success: false, message: "Solo el autor puede restaurar este procedimiento." });
    }
    await supabase.from("procedimientos").update({ activo: true, fecha_actualizacion: new Date().toISOString() }).eq("id", id);
    res.status(200).json({ success: true, message: "Procedimiento restaurado correctamente." });
  } catch (error) {
    console.error("Error restaurando procedimiento:", error);
    res.status(500).json({ success: false, message: "Ocurrió un error al restaurar el procedimiento." });
  }
};
export { restaurarProcedimiento };
