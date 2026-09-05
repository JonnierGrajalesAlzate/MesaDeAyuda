import supabase from "../../../config/supabaseClient.js";
import { puedeModificarProcedimiento } from "../../../services/accessControl.js";
import { buscarProcedimiento } from "../../../services/procedimientosAccessService.js";
import { booleano, enteroPositivo, texto } from "../../../utils/validation.js";
import { bufferABytea } from "../../../utils/bytea.js";
const subirArchivoProcedimiento = async (req, res) => {
  try {
    const procedimientoId = enteroPositivo(req.body?.procedimiento_id);
    const descripcion = texto(req.body?.descripcion, { max: 1_000, optional: true });
    if (!procedimientoId || !req.file) {
      return res.status(400).json({ success: false, message: "El procedimiento y el archivo son obligatorios." });
    }
    const procedimiento = await buscarProcedimiento(procedimientoId);
    if (!procedimiento) return res.status(404).json({ success: false, message: "El procedimiento no existe." });
    if (!puedeModificarProcedimiento(req.usuario, procedimiento)) {
      return res.status(403).json({ success: false, message: "Solo el autor puede subir archivos." });
    }
    const { data, error } = await supabase
      .from("procedimiento_archivos")
      .insert({
        procedimiento_id: procedimientoId,
        nombre: req.file.filename,
        nombre_original: req.file.originalname,
        ruta: req.file.filename,
        tipo: req.file.mimetype,
        tipo_recurso: "DOCUMENTO",
        tamano: req.file.size,
        descripcion,
        es_principal: booleano(req.body?.es_principal),
        contenido: bufferABytea(req.file.buffer)
      })
      .select("id,procedimiento_id,nombre,nombre_original,tipo,tipo_recurso,tamano,descripcion,es_principal,fecha_subida")
      .single();
    if (error) throw error;
    return res.status(201).json({ success: true, message: "Archivo subido correctamente.", archivo: data });
  } catch (error) {
    console.error("Error subiendo archivo:", error.message);
    return res.status(500).json({ success: false, message: "Error al subir el archivo." });
  }
};
export { subirArchivoProcedimiento };
