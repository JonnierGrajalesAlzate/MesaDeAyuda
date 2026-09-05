import { Router } from "express";
import { eliminarArchivoProcedimiento, establecerPrincipal, obtenerArchivosProcedimiento, subirArchivoProcedimiento } from "../../controllers/BaseConocimiento/index.js";
import { crearUploadSeguro, TIPOS_BASE_CONOCIMIENTO } from "../../middleware/upload.js";
const router = Router();
const uploadFile = crearUploadSeguro({
  tiposPermitidos: TIPOS_BASE_CONOCIMIENTO,
  campo: "archivo"
});
router.post("/procedimiento", uploadFile, subirArchivoProcedimiento);
router.get("/procedimiento/:procedimiento_id", obtenerArchivosProcedimiento);
router.delete("/procedimiento/:id", eliminarArchivoProcedimiento);
router.put("/procedimiento/:id/principal", establecerPrincipal);
export default router;
