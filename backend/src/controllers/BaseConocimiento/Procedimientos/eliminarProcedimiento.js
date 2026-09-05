import supabase from "../../../config/supabaseClient.js";
import { enteroPositivo } from "../../../utils/validation.js";
const eliminarProcedimiento = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Procedimiento no válido." });
    const { data: existe } = await supabase.from("procedimientos").select("id,autor_id").eq("id", id).eq("activo", true).maybeSingle();
    if (!existe) {
      return res.status(404).json({ success: false, message: "El procedimiento no existe." });
    }
    if (req.usuario?.rol !== "Administrador" && Number(existe.autor_id) !== Number(req.usuario?.id)) {
      return res.status(403).json({ success: false, message: "Solo el autor puede eliminar este procedimiento." });
    }
    await supabase.from("procedimientos").update({ activo: false, fecha_actualizacion: new Date().toISOString() }).eq("id", id);
    res.status(200).json({ success: true, message: "Procedimiento eliminado correctamente." });
  } catch (error) {
    console.error("Error eliminando procedimiento:", error);
    res.status(500).json({ success: false, message: "Ocurrió un error al eliminar el procedimiento." });
  }
};
export { eliminarProcedimiento };
