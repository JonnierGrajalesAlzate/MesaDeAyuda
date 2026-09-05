import supabase from "../../../config/supabaseClient.js";
import { puedeVerProcedimiento } from "../../../services/accessControl.js";
import { buscarProcedimiento } from "../../../services/procedimientosAccessService.js";
import { enteroPositivo } from "../../../utils/validation.js";
const obtenerArchivosProcedimiento = async (req, res) => {
  try {
    const procedimientoId = enteroPositivo(req.params.procedimiento_id);
    if (!procedimientoId) return res.status(400).json({ success: false, message: "Procedimiento no válido." });
    const procedimiento = await buscarProcedimiento(procedimientoId);
    if (!procedimiento) return res.status(404).json({ success: false, message: "El procedimiento no existe." });
    if (!puedeVerProcedimiento(req.usuario, procedimiento)) {
      return res.status(403).json({ success: false, message: "No tienes acceso a estos archivos." });
    }
    const { data, error } = await supabase
      .from("procedimiento_archivos")
      .select("id,nombre,nombre_original,tipo,tipo_recurso,tamano,descripcion,es_principal,fecha_subida")
      .eq("procedimiento_id", procedimientoId)
      .order("es_principal", { ascending: false })
      .order("fecha_subida", { ascending: false });
    if (error) throw error;
    return res.status(200).json({ success: true, archivos: data });
  } catch (error) {
    console.error("Error obteniendo archivos del procedimiento:", error.message);
    return res.status(500).json({ success: false, message: "Error al obtener los archivos." });
  }
};
export { obtenerArchivosProcedimiento };
