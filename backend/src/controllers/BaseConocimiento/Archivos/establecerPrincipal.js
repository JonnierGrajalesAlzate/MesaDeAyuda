import supabase from "../../../config/supabaseClient.js";
import { puedeModificarProcedimiento } from "../../../services/accessControl.js";
import { buscarProcedimientoPorArchivo } from "../../../services/procedimientosAccessService.js";
import { enteroPositivo } from "../../../utils/validation.js";
const establecerPrincipal = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Archivo no válido." });
    const procedimiento = await buscarProcedimientoPorArchivo(id);
    if (!procedimiento) {
      return res.status(404).json({ success: false, message: "El archivo no existe." });
    }
    if (!puedeModificarProcedimiento(req.usuario, procedimiento)) {
      return res.status(403).json({ success: false, message: "Solo el autor puede modificar este archivo." });
    }
    const { error } = await supabase.rpc("fn_establecer_archivo_principal", {
      p_procedimiento_id: procedimiento.id,
      p_archivo_id: id
    });
    if (error) throw error;
    return res.status(200).json({ success: true, message: "Archivo establecido como principal." });
  } catch (error) {
    console.error("Error estableciendo archivo principal:", error.message);
    return res.status(500).json({ success: false, message: "Error al establecer archivo principal." });
  }
};
export { establecerPrincipal };
