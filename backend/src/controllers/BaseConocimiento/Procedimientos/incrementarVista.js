import supabase from "../../../config/supabaseClient.js";
import { puedeVerProcedimiento } from "../../../services/accessControl.js";
import { buscarProcedimiento } from "../../../services/procedimientosAccessService.js";
import { enteroPositivo } from "../../../utils/validation.js";
const incrementarVista = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Procedimiento no válido." });
    const procedimiento = await buscarProcedimiento(id);
    if (!procedimiento) {
      return res.status(404).json({ success: false, message: "El procedimiento no existe." });
    }
    if (!puedeVerProcedimiento(req.usuario, procedimiento)) {
      return res.status(403).json({ success: false, message: "No tienes acceso a este procedimiento." });
    }
    const { data: actual } = await supabase.from("procedimientos").select("vistas").eq("id", id).maybeSingle();
    await supabase.from("procedimientos").update({ vistas: (actual?.vistas || 0) + 1 }).eq("id", id);
    res.status(200).json({ success: true, message: "Vista registrada correctamente." });
  } catch (error) {
    console.error("Error incrementando vistas:", error);
    res.status(500).json({ success: false, message: "Ocurrió un error al registrar la vista." });
  }
};
export { incrementarVista };
