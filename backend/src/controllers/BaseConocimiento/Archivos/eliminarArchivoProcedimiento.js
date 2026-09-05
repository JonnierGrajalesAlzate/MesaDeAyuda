import supabase from "../../../config/supabaseClient.js";
import { puedeModificarProcedimiento } from "../../../services/accessControl.js";
import { buscarProcedimientoPorArchivo } from "../../../services/procedimientosAccessService.js";
import { enteroPositivo } from "../../../utils/validation.js";
const eliminarArchivoProcedimiento = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Archivo no válido." });
    const procedimiento = await buscarProcedimientoPorArchivo(id);
    if (!procedimiento) return res.status(404).json({ success: false, message: "El archivo no existe." });
    if (!puedeModificarProcedimiento(req.usuario, procedimiento)) {
      return res.status(403).json({ success: false, message: "Solo el autor puede eliminar este archivo." });
    }
    await supabase.from("procedimiento_archivos").delete().eq("id", id);
    return res.status(200).json({ success: true, message: "Archivo eliminado correctamente." });
  } catch (error) {
    console.error("Error eliminando archivo:", error.message);
    return res.status(500).json({ success: false, message: "Error al eliminar el archivo." });
  }
};
export { eliminarArchivoProcedimiento };
