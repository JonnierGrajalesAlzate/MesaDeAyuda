import { Router } from "express";
import { descargarArchivo } from "../controllers/Archivos/descargarArchivoController.js";
const router = Router();
router.get("/:filename", descargarArchivo);
export default router;
